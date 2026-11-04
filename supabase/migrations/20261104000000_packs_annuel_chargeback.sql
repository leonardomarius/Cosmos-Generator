-- Achat unique de tokens, abonnement annuel et blocage sur rétrofacturation.
-- Deux soldes séparés :
-- - balance : tokens d'abonnement, remis au quota à chaque recharge ;
-- - purchased_balance : tokens achetés, jamais expirés, conservés à chaque
--   recharge, à la résiliation et à la fin de l'abonnement.
-- Dépense : d'abord balance, puis purchased_balance. Le ledger garde la part
-- venant des tokens achetés (purchased_delta) : un remboursement rend chaque
-- token au solde d'où il vient. delta et balance_after portent sur le total.
-- À appliquer AVANT de déployer le code : les colonnes ont des valeurs par
-- défaut et les fonctions gardent leur signature, l'ancien code continue de
-- fonctionner.

alter table public.token_balances
  add column purchased_balance integer not null default 0 check (purchased_balance >= 0),
  -- Renseigné par une rétrofacturation. Déblocage manuel uniquement.
  add column blocked_at timestamptz;

alter table public.token_ledger
  add column purchased_delta integer not null default 0;
alter table public.token_ledger drop constraint token_ledger_reason_check;
alter table public.token_ledger add constraint token_ledger_reason_check
  check (reason in ('monthly_reset', 'upgrade', 'generation', 'refund', 'expired', 'purchase', 'chargeback'));

alter table public.subscriptions
  add column billing_interval text not null default 'month' check (billing_interval in ('month', 'year')),
  -- Intervalle choisi, appliqué au prochain renouvellement (comme next_plan).
  add column next_interval text check (next_interval in ('month', 'year')),
  -- Rappel de reconduction de la période en cours (art. L215-1 du Code de la
  -- consommation) : vidé à chaque renouvellement.
  add column renewal_reminder_sent_at timestamptz;

-- Remet les tokens d'abonnement à p_quota (paiement reçu, recharge mensuelle
-- de l'annuel) ou à 0 (abonnement terminé). Les tokens achetés ne bougent pas.
-- Compte bloqué : aucune recharge, seule la référence est notée.
create or replace function public.reset_tokens(p_user uuid, p_quota integer, p_reason text, p_ref text)
returns integer
language plpgsql
set search_path = ''
as $$
declare
  v_balance integer;
  v_purchased integer;
  v_blocked timestamptz;
begin
  v_balance := public.lock_token_balance(p_user);
  select purchased_balance, blocked_at into v_purchased, v_blocked from public.token_balances where user_id = p_user;
  if exists (select 1 from public.token_ledger where ref = p_ref) then
    return v_balance + v_purchased;
  end if;
  if v_blocked is not null then
    insert into public.token_ledger (user_id, delta, reason, ref, balance_after)
      values (p_user, 0, p_reason, p_ref, v_balance + v_purchased);
    return v_balance + v_purchased;
  end if;
  update public.token_balances set balance = p_quota, granted_quota = p_quota, updated_at = now()
    where user_id = p_user;
  insert into public.token_ledger (user_id, delta, reason, ref, balance_after)
    values (p_user, p_quota - v_balance, p_reason, p_ref, p_quota + v_purchased);
  return p_quota + v_purchased;
end;
$$;

-- Montée de plan (prorata payé) : ajoute la différence de quota, au prorata du
-- temps restant jusqu'à la prochaine recharge (p_fraction entre 0 et 1).
create or replace function public.upgrade_tokens(p_user uuid, p_quota integer, p_fraction numeric, p_ref text)
returns integer
language plpgsql
set search_path = ''
as $$
declare
  v_balance integer;
  v_purchased integer;
  v_granted integer;
  v_blocked timestamptz;
  v_added integer;
begin
  v_balance := public.lock_token_balance(p_user);
  select purchased_balance, granted_quota, blocked_at into v_purchased, v_granted, v_blocked
    from public.token_balances where user_id = p_user;
  if v_blocked is not null or p_quota <= v_granted or exists (select 1 from public.token_ledger where ref = p_ref) then
    return v_balance + v_purchased;
  end if;
  v_added := floor((p_quota - v_granted) * least(greatest(p_fraction, 0), 1));
  update public.token_balances
    set balance = balance + v_added, granted_quota = p_quota, updated_at = now()
    where user_id = p_user;
  insert into public.token_ledger (user_id, delta, reason, ref, balance_after)
    values (p_user, v_added, 'upgrade', p_ref, v_balance + v_purchased + v_added);
  return v_balance + v_purchased + v_added;
end;
$$;

-- Retire p_amount tokens pour la génération p_generation : d'abord les tokens
-- d'abonnement, puis les tokens achetés.
-- Lève "insufficient_tokens" si le total ne suffit pas, "account_blocked" si
-- le compte est bloqué.
create or replace function public.spend_tokens(p_user uuid, p_amount integer, p_generation uuid)
returns integer
language plpgsql
set search_path = ''
as $$
declare
  v_balance integer;
  v_purchased integer;
  v_blocked timestamptz;
  v_from_purchased integer;
  v_ref text := 'generation:' || p_generation;
begin
  v_balance := public.lock_token_balance(p_user);
  select purchased_balance, blocked_at into v_purchased, v_blocked from public.token_balances where user_id = p_user;
  if exists (select 1 from public.token_ledger where ref = v_ref) then
    return v_balance + v_purchased;
  end if;
  if v_blocked is not null then
    raise exception 'account_blocked';
  end if;
  if v_balance + v_purchased < p_amount then
    raise exception 'insufficient_tokens';
  end if;
  v_from_purchased := greatest(p_amount - v_balance, 0);
  update public.token_balances
    set balance = balance - (p_amount - v_from_purchased),
        purchased_balance = purchased_balance - v_from_purchased,
        updated_at = now()
    where user_id = p_user;
  insert into public.token_ledger (user_id, delta, purchased_delta, reason, ref, balance_after)
    values (p_user, -p_amount, -v_from_purchased, 'generation', v_ref, v_balance + v_purchased - p_amount);
  return v_balance + v_purchased - p_amount;
end;
$$;

-- Rend les tokens d'une génération échouée, une seule fois, chacun dans le
-- solde d'où il vient. Compte bloqué : rien n'est rendu, et un déblocage
-- ultérieur ne le rendra pas non plus (la référence est notée).
create or replace function public.refund_generation(p_generation uuid)
returns void
language plpgsql
set search_path = ''
as $$
declare
  v_spent public.token_ledger%rowtype;
  v_balance integer;
  v_purchased integer;
  v_blocked timestamptz;
begin
  select * into v_spent from public.token_ledger where ref = 'generation:' || p_generation;
  if not found then
    return;
  end if;
  v_balance := public.lock_token_balance(v_spent.user_id);
  select purchased_balance, blocked_at into v_purchased, v_blocked
    from public.token_balances where user_id = v_spent.user_id;
  if exists (select 1 from public.token_ledger where ref = 'refund:' || p_generation) then
    return;
  end if;
  if v_blocked is not null then
    insert into public.token_ledger (user_id, delta, reason, ref, balance_after)
      values (v_spent.user_id, 0, 'refund', 'refund:' || p_generation, v_balance + v_purchased);
    return;
  end if;
  update public.token_balances
    set balance = balance - (v_spent.delta - v_spent.purchased_delta),
        purchased_balance = purchased_balance - v_spent.purchased_delta,
        updated_at = now()
    where user_id = v_spent.user_id;
  insert into public.token_ledger (user_id, delta, purchased_delta, reason, ref, balance_after)
    values (v_spent.user_id, -v_spent.delta, -v_spent.purchased_delta, 'refund', 'refund:' || p_generation,
      v_balance + v_purchased - v_spent.delta);
end;
$$;

-- Crédite des tokens achetés (paiement confirmé), une seule fois par référence
-- ("purchase:<paymentId>"). Renvoie le nouveau total, ou null si le compte est
-- bloqué : rien n'est crédité, à signaler dans les logs.
create function public.credit_purchased_tokens(p_user uuid, p_amount integer, p_ref text)
returns integer
language plpgsql
set search_path = ''
as $$
declare
  v_balance integer;
  v_purchased integer;
  v_blocked timestamptz;
begin
  if p_amount <= 0 then
    raise exception 'invalid_amount';
  end if;
  v_balance := public.lock_token_balance(p_user);
  select purchased_balance, blocked_at into v_purchased, v_blocked from public.token_balances where user_id = p_user;
  if exists (select 1 from public.token_ledger where ref = p_ref) then
    return v_balance + v_purchased;
  end if;
  if v_blocked is not null then
    insert into public.token_ledger (user_id, delta, reason, ref, balance_after)
      values (p_user, 0, 'purchase', p_ref, v_balance + v_purchased);
    return null;
  end if;
  update public.token_balances set purchased_balance = purchased_balance + p_amount, updated_at = now()
    where user_id = p_user;
  insert into public.token_ledger (user_id, delta, purchased_delta, reason, ref, balance_after)
    values (p_user, p_amount, p_amount, 'purchase', p_ref, v_balance + v_purchased + p_amount);
  return v_balance + v_purchased + p_amount;
end;
$$;

-- Rétrofacturation : bloque le compte et remet les deux soldes à 0, une seule
-- fois par référence ("chargeback:<paymentId>"). Renvoie true au premier appel.
-- Un rappel du webhook après un déblocage manuel ne rebloque donc pas.
create function public.block_account_for_chargeback(p_user uuid, p_ref text)
returns boolean
language plpgsql
set search_path = ''
as $$
declare
  v_balance integer;
  v_purchased integer;
begin
  v_balance := public.lock_token_balance(p_user);
  select purchased_balance into v_purchased from public.token_balances where user_id = p_user;
  if exists (select 1 from public.token_ledger where ref = p_ref) then
    return false;
  end if;
  update public.token_balances
    set balance = 0, purchased_balance = 0, granted_quota = 0, blocked_at = coalesce(blocked_at, now()), updated_at = now()
    where user_id = p_user;
  insert into public.token_ledger (user_id, delta, purchased_delta, reason, ref, balance_after)
    values (p_user, -(v_balance + v_purchased), -v_purchased, 'chargeback', p_ref, 0);
  return true;
end;
$$;

-- Par défaut, toute fonction de "public" est appelable via l'API par anon et
-- authenticated : un utilisateur pourrait se créditer. Réservé au serveur.
revoke execute on function public.lock_token_balance(uuid) from public, anon, authenticated;
revoke execute on function public.reset_tokens(uuid, integer, text, text) from public, anon, authenticated;
revoke execute on function public.upgrade_tokens(uuid, integer, numeric, text) from public, anon, authenticated;
revoke execute on function public.spend_tokens(uuid, integer, uuid) from public, anon, authenticated;
revoke execute on function public.refund_generation(uuid) from public, anon, authenticated;
revoke execute on function public.credit_purchased_tokens(uuid, integer, text) from public, anon, authenticated;
revoke execute on function public.block_account_for_chargeback(uuid, text) from public, anon, authenticated;
grant execute on function public.lock_token_balance(uuid) to service_role;
grant execute on function public.reset_tokens(uuid, integer, text, text) to service_role;
grant execute on function public.upgrade_tokens(uuid, integer, numeric, text) to service_role;
grant execute on function public.spend_tokens(uuid, integer, uuid) to service_role;
grant execute on function public.refund_generation(uuid) to service_role;
grant execute on function public.credit_purchased_tokens(uuid, integer, text) to service_role;
grant execute on function public.block_account_for_chargeback(uuid, text) to service_role;
