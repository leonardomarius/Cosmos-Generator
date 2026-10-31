-- Passage de Stripe à Mollie.
-- Mollie n'a pas de portail client : on garde le mandat (pour prélever une
-- montée de plan ou se réabonner sans repasser par la page de paiement) et le
-- plan qui s'appliquera au prochain renouvellement après une baisse.
-- Statuts : none (avant le premier paiement), active, past_due (dernier
-- prélèvement échoué), canceled (résilié, accès jusqu'à current_period_end).

alter table public.subscriptions rename column stripe_customer_id to mollie_customer_id;
alter table public.subscriptions rename column stripe_subscription_id to mollie_subscription_id;
alter table public.subscriptions
  add column mollie_mandate_id text,
  add column next_plan text;
