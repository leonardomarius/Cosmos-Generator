-- Tokens comptés en centaines : 1 ancien token vaut 100 tokens (l'abonnement
-- Essentiel donne 1 000 tokens au lieu de 10, au même prix).
-- Les montants déjà enregistrés passent à la nouvelle unité : un échec rend
-- le bon nombre de tokens (refund_generation relit le ledger) et une montée de
-- plan compare le nouveau quota au quota déjà accordé dans la même unité.
-- À appliquer en même temps que le déploiement du code, une seule fois.

update public.token_balances
  set balance = balance * 100, granted_quota = granted_quota * 100, updated_at = now();
update public.token_ledger
  set delta = delta * 100, balance_after = balance_after * 100;
update public.generations
  set tokens = tokens * 100;
