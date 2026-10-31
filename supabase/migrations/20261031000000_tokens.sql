-- Abonnement mensuel et tokens.
-- Chaque facture Stripe payée remet le solde au quota du plan (pas de report
-- d'un mois sur l'autre). Une génération retire ses tokens au lancement et les
-- rend si elle échoue.
-- Toutes les écritures passent par le serveur (clé service_role) : les
-- utilisateurs ne peuvent que lire leurs propres lignes.

create table public.subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  stripe_customer_id text not null unique,
  stripe_subscription_id text unique,
  plan text,
  -- Statut Stripe (active, past_due, canceled…), "none" avant le premier paiement.
  status text not null default 'none',
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  updated_at timestamptz not null default now()
);

create table public.token_balances (
  user_id uuid primary key references auth.users (id) on delete cascade,
  balance integer not null default 0 check (balance >= 0),
  -- Quota mensuel déjà accordé pour la période en cours : une montée de plan
  -- n'accorde que la différence, et monter, descendre puis remonter n'accorde rien de plus.
  granted_quota integer not null default 0,
  updated_at timestamptz not null default now()
);

-- Historique de chaque mouvement. "ref" rend chaque opération idempotente :
-- un webhook rejoué (même facture, même génération) n'a aucun effet.
create table public.token_ledger (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  delta integer not null,
  reason text not null check (reason in ('monthly_reset', 'upgrade', 'generation', 'refund', 'expired')),
  ref text not null unique,
  balance_after integer not null,
  created_at timestamptz not null default now()
);
create index token_ledger_user_idx on public.token_ledger (user_id, created_at desc);

create table public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  model text not null,
  tokens integer not null,
  fal_request_id text unique,
  -- starting → queued → done | failed
  status text not null default 'starting',
  created_at timestamptz not null default now()
);
create index generations_user_idx on public.generations (user_id, created_at desc);

alter table public.subscriptions enable row level security;
alter table public.token_balances enable row level security;
alter table public.token_ledger enable row level security;
alter table public.generations enable row level security;

create policy "lecture de son abonnement" on public.subscriptions
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "lecture de son solde" on public.token_balances
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "lecture de son historique" on public.token_ledger
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "lecture de ses générations" on public.generations
  for select to authenticated using ((select auth.uid()) = user_id);

-- Ligne de solde verrouillée pour la durée de la transaction (créée à 0 si besoin).
create function public.lock_token_balance(p_user uuid)
returns integer
language plpgsql
set search_path = ''
as $$
declare
  v_balance integer;
begin
  insert into public.token_balances (user_id) values (p_user) on conflict (user_id) do nothing;
  select balance into v_balance from public.token_balances where user_id = p_user for update;
  return v_balance;
end;
$$;

-- Remet le solde à p_quota (facture payée) ou à 0 (abonnement terminé).
-- p_ref : identifiant de la facture ou de l'évènement Stripe.
create function public.reset_tokens(p_user uuid, p_quota integer, p_reason text, p_ref text)
returns integer
language plpgsql
set search_path = ''
as $$
declare
  v_balance integer;
begin
  v_balance := public.lock_token_balance(p_user);
  if exists (select 1 from public.token_ledger where ref = p_ref) then
    return v_balance;
  end if;
  update public.token_balances set balance = p_quota, granted_quota = p_quota, updated_at = now()
    where user_id = p_user;
  insert into public.token_ledger (user_id, delta, reason, ref, balance_after)
    values (p_user, p_quota - v_balance, p_reason, p_ref, p_quota);
  return p_quota;
end;
$$;

-- Montée de plan en cours de mois (facture de prorata payée) : ajoute la
-- différence de quota, au prorata du temps restant (p_fraction entre 0 et 1).
create function public.upgrade_tokens(p_user uuid, p_quota integer, p_fraction numeric, p_ref text)
returns integer
language plpgsql
set search_path = ''
as $$
declare
  v_balance integer;
  v_granted integer;
  v_added integer;
begin
  v_balance := public.lock_token_balance(p_user);
  select granted_quota into v_granted from public.token_balances where user_id = p_user;
  if p_quota <= v_granted or exists (select 1 from public.token_ledger where ref = p_ref) then
    return v_balance;
  end if;
  v_added := floor((p_quota - v_granted) * least(greatest(p_fraction, 0), 1));
  update public.token_balances
    set balance = balance + v_added, granted_quota = p_quota, updated_at = now()
    where user_id = p_user;
  insert into public.token_ledger (user_id, delta, reason, ref, balance_after)
    values (p_user, v_added, 'upgrade', p_ref, v_balance + v_added);
  return v_balance + v_added;
end;
$$;

-- Retire p_amount tokens pour la génération p_generation.
-- Lève "insufficient_tokens" si le solde ne suffit pas.
create function public.spend_tokens(p_user uuid, p_amount integer, p_generation uuid)
returns integer
language plpgsql
set search_path = ''
as $$
declare
  v_balance integer;
  v_ref text := 'generation:' || p_generation;
begin
  v_balance := public.lock_token_balance(p_user);
  if exists (select 1 from public.token_ledger where ref = v_ref) then
    return v_balance;
  end if;
  if v_balance < p_amount then
    raise exception 'insufficient_tokens';
  end if;
  update public.token_balances set balance = balance - p_amount, updated_at = now() where user_id = p_user;
  insert into public.token_ledger (user_id, delta, reason, ref, balance_after)
    values (p_user, -p_amount, 'generation', v_ref, v_balance - p_amount);
  return v_balance - p_amount;
end;
$$;

-- Rend les tokens d'une génération échouée, une seule fois.
create function public.refund_generation(p_generation uuid)
returns void
language plpgsql
set search_path = ''
as $$
declare
  v_spent public.token_ledger%rowtype;
  v_balance integer;
begin
  select * into v_spent from public.token_ledger where ref = 'generation:' || p_generation;
  if not found then
    return;
  end if;
  v_balance := public.lock_token_balance(v_spent.user_id);
  if exists (select 1 from public.token_ledger where ref = 'refund:' || p_generation) then
    return;
  end if;
  update public.token_balances set balance = balance - v_spent.delta, updated_at = now()
    where user_id = v_spent.user_id;
  insert into public.token_ledger (user_id, delta, reason, ref, balance_after)
    values (v_spent.user_id, -v_spent.delta, 'refund', 'refund:' || p_generation, v_balance - v_spent.delta);
end;
$$;

-- Par défaut, toute fonction de "public" est appelable via l'API par anon et
-- authenticated : un utilisateur pourrait se créditer. Réservé au serveur.
revoke execute on function public.lock_token_balance(uuid) from public, anon, authenticated;
revoke execute on function public.reset_tokens(uuid, integer, text, text) from public, anon, authenticated;
revoke execute on function public.upgrade_tokens(uuid, integer, numeric, text) from public, anon, authenticated;
revoke execute on function public.spend_tokens(uuid, integer, uuid) from public, anon, authenticated;
revoke execute on function public.refund_generation(uuid) from public, anon, authenticated;
grant execute on function public.lock_token_balance(uuid) to service_role;
grant execute on function public.reset_tokens(uuid, integer, text, text) to service_role;
grant execute on function public.upgrade_tokens(uuid, integer, numeric, text) to service_role;
grant execute on function public.spend_tokens(uuid, integer, uuid) to service_role;
grant execute on function public.refund_generation(uuid) to service_role;
