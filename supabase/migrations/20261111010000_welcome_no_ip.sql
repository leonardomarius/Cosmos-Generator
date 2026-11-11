-- Offre de bienvenue : plus de limite d'un cadeau par IP (décision du
-- 2026-11-11). Corrige les bases qui ont reçu la première version de
-- 20261111000000_welcome_promo.sql ; sans effet sur une base neuve.

drop function if exists public.claim_welcome_bonus(uuid, text, integer, date, integer);
-- Supprime aussi son index.
alter table public.welcome_bonuses drop column if exists ip_hash;

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

revoke execute on function public.claim_welcome_bonus(uuid, integer, date, integer) from public, anon, authenticated;
grant execute on function public.claim_welcome_bonus(uuid, integer, date, integer) to service_role;

notify pgrst, 'reload schema';
