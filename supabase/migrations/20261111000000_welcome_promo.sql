-- Offre de lancement : les comptes créés entre PROMO_START et PROMO_END
-- (src/config/promo.ts) reçoivent des tokens de bienvenue, l'équivalent d'une
-- vidéo de 10 s ou d'une vidéo preset. Un seul cadeau par compte. Les règles
-- sont garanties ici, en base :
-- claim_welcome_bonus vérifie et crédite dans une seule transaction.

-- Clé d'idempotence : une requête rejouée (double clic) retrouve la génération
-- déjà créée au lieu d'en créer une autre.
alter table public.generations add column if not exists idempotency_key text;
create unique index if not exists generations_idempotency_idx on public.generations (user_id, idempotency_key);

-- Priorité dans la file du PC : 0 = client qui a déjà payé, 1 = compte qui
-- n'a que des tokens offerts (passe après les payants).
alter table public.wangp_jobs add column if not exists priority smallint not null default 0;
drop index if exists public.wangp_jobs_queue_idx;
create index wangp_jobs_queue_idx on public.wangp_jobs (status, priority, created_at);

-- Réglages modifiables depuis /admin sans redéploiement (une seule ligne).
-- daily_budget : cadeaux par jour au maximum ; null = FREE_DAILY_BUDGET.
create table if not exists public.promo_settings (
  id smallint primary key default 1 check (id = 1),
  enabled boolean not null default true,
  daily_budget integer check (daily_budget >= 0),
  updated_at timestamptz not null default now()
);
insert into public.promo_settings (id) values (1) on conflict (id) do nothing;

-- Un cadeau de bienvenue par compte (clé primaire).
create table if not exists public.welcome_bonuses (
  user_id uuid primary key references auth.users (id) on delete cascade,
  tokens integer not null check (tokens > 0),
  -- Jour calendaire à Paris.
  day date not null,
  created_at timestamptz not null default now()
);

-- Cadeaux accordés par jour, pour le plafond. Sa ligne sert aussi de verrou :
-- les demandes d'une même journée passent une par une.
create table if not exists public.welcome_daily_usage (
  day date primary key,
  granted integer not null default 0 check (granted >= 0)
);

-- Limites de fréquence par clé (IP, IP + jour…), par fenêtre fixe.
-- Les anciennes fenêtres sont effacées par /api/cron/purge-videos.
create table if not exists public.rate_limits (
  key text not null,
  window_start timestamptz not null,
  hits integer not null default 0,
  primary key (key, window_start)
);

alter table public.promo_settings enable row level security;
alter table public.welcome_bonuses enable row level security;
alter table public.welcome_daily_usage enable row level security;
alter table public.rate_limits enable row level security;

drop policy if exists "lecture de son cadeau de bienvenue" on public.welcome_bonuses;
create policy "lecture de son cadeau de bienvenue" on public.welcome_bonuses
  for select to authenticated using ((select auth.uid()) = user_id);

-- Accorde le cadeau de bienvenue : tokens achetés (jamais expirés), référence
-- "welcome:<compte>" dans l'historique. Renvoie le nouveau solde total.
-- Erreurs : welcome_already_claimed, welcome_budget_reached, account_blocked.
create or replace function public.claim_welcome_bonus(
  p_user uuid,
  p_tokens integer,
  p_day date,
  p_budget integer
)
returns integer
language plpgsql
set search_path = ''
as $$
declare
  v_granted integer;
  v_balance integer;
begin
  -- Verrou de la journée : deux demandes simultanées passent l'une après l'autre.
  insert into public.welcome_daily_usage (day) values (p_day) on conflict (day) do nothing;
  select u.granted into v_granted from public.welcome_daily_usage u where u.day = p_day for update;

  if exists (select 1 from public.welcome_bonuses w where w.user_id = p_user) then
    raise exception 'welcome_already_claimed';
  end if;
  if v_granted >= p_budget then
    raise exception 'welcome_budget_reached';
  end if;

  -- La clé primaire reste le dernier rempart.
  insert into public.welcome_bonuses (user_id, tokens, day) values (p_user, p_tokens, p_day);
  v_balance := public.credit_purchased_tokens(p_user, p_tokens, 'welcome:' || p_user);
  if v_balance is null then
    -- Compte bloqué : tout est annulé, rien n'est accordé.
    raise exception 'account_blocked';
  end if;
  update public.welcome_daily_usage set granted = granted + 1 where day = p_day;
  return v_balance;
end;
$$;

-- Le compte a-t-il déjà payé (abonnement ou achat) ? Les tokens de bienvenue
-- ne comptent pas.
create or replace function public.user_has_paid(p_user uuid)
returns boolean
language sql
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.token_ledger l
    where l.user_id = p_user
      and (l.reason in ('monthly_reset', 'upgrade') or (l.reason = 'purchase' and l.ref not like 'welcome:%'))
      and l.delta > 0
  );
$$;

-- Compte une requête pour p_key dans la fenêtre en cours. false : limite dépassée.
create or replace function public.hit_rate_limit(p_key text, p_window_seconds integer, p_max integer)
returns boolean
language plpgsql
set search_path = ''
as $$
declare
  v_start timestamptz := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  v_hits integer;
begin
  insert into public.rate_limits (key, window_start, hits) values (p_key, v_start, 1)
    on conflict (key, window_start) do update set hits = public.rate_limits.hits + 1
    returning hits into v_hits;
  return v_hits <= p_max;
end;
$$;

-- Le compte existe-t-il déjà ? (un ancien compte à email jetable peut
-- toujours se connecter)
create or replace function public.auth_email_exists(p_email text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from auth.users where lower(email) = lower(p_email));
$$;

-- Réservé au serveur (clé service_role), comme les fonctions des tokens.
revoke execute on function public.claim_welcome_bonus(uuid, integer, date, integer) from public, anon, authenticated;
revoke execute on function public.user_has_paid(uuid) from public, anon, authenticated;
revoke execute on function public.hit_rate_limit(text, integer, integer) from public, anon, authenticated;
revoke execute on function public.auth_email_exists(text) from public, anon, authenticated;
grant execute on function public.claim_welcome_bonus(uuid, integer, date, integer) to service_role;
grant execute on function public.user_has_paid(uuid) to service_role;
grant execute on function public.hit_rate_limit(text, integer, integer) to service_role;
grant execute on function public.auth_email_exists(text) to service_role;

notify pgrst, 'reload schema';
