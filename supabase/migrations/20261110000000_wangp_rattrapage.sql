-- Rattrapage de 20261109000000_wangp.sql : la première version, appliquée en
-- production, n'avait ni "options" ni durée et format facultatifs. Sans cette
-- colonne, chaque commande échouait à l'insertion (PGRST204) et était remboursée.
-- Sans effet si la table est déjà à jour.
alter table public.wangp_jobs add column if not exists options jsonb not null default '{}';
alter table public.wangp_jobs alter column prompt set default '';
alter table public.wangp_jobs alter column duration drop not null;
alter table public.wangp_jobs alter column aspect_ratio drop not null;

-- Recharge le cache de schéma de l'API Supabase, qui ignore sinon la nouvelle colonne.
notify pgrst, 'reload schema';
