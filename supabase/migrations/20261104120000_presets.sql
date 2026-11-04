-- Presets vidéo : commandes en plusieurs étapes, interrupteur de sécurité et
-- vote à l'aveugle du Preset Lab. Le prix en tokens reste géré par "generations"
-- et le grand livre : une commande de preset est une génération comme une autre.
-- Toutes les écritures passent par le serveur (clé service_role).

-- Une ligne par commande, même identifiant que sa ligne de "generations".
create table public.preset_jobs (
  id uuid primary key references public.generations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  preset_id text not null,
  preset_version text not null,
  variant_id text not null,
  -- running → done | failed
  status text not null default 'running' check (status in ('running', 'done', 'failed')),
  -- keyframe → video → finish
  stage text not null check (stage in ('keyframe', 'video', 'finish')),
  -- Chemins des photos dans le bucket privé, supprimées dès la fin de la commande.
  photo_paths text[] not null,
  -- Par étape payante : identifiant de la tâche chez le fournisseur, résultat, verdict.
  steps jsonb not null default '{}',
  result_url text,
  error text,
  -- "refused" : refus du filtre du modèle, pas un défaut du preset.
  error_kind text,
  -- Coût estimé d'après le tarif du preset, en dollars.
  cost_usd numeric(8, 4) not null default 0,
  -- Une seule exécution à la fois : webhook, suivi du navigateur et tâche
  -- quotidienne peuvent arriver ensemble, un appel payant ne part qu'une fois.
  locked_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index preset_jobs_open_idx on public.preset_jobs (updated_at) where status = 'running';
create index preset_jobs_stats_idx on public.preset_jobs (preset_id, created_at desc);

-- Dépublication automatique : un preset listé ici ne prend plus de commande,
-- quel que soit son statut. Supprimer la ligne pour le rouvrir.
create table public.preset_switches (
  preset_id text primary key,
  reason text not null,
  disabled_at timestamptz not null default now()
);

-- Benchmark à l'aveugle : l'identifiant de la campagne sert de lien secret.
create table public.preset_lab_campaigns (
  id uuid primary key default gen_random_uuid(),
  preset_id text not null,
  preset_version text not null,
  candidate_variant text not null,
  comparator_variant text not null,
  -- [{ photo, a: { path, role }, b: { path, role } }] : "role" n'est jamais
  -- envoyé au navigateur (candidate ou comparator).
  pairs jsonb not null,
  closes_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table public.preset_lab_votes (
  campaign_id uuid not null references public.preset_lab_campaigns (id) on delete cascade,
  -- Identifiant aléatoire tiré par le navigateur du votant.
  rater_id uuid not null,
  pair_index integer not null,
  -- { a: { realisme, stabilite, mouvement, visage, defauts }, b: { … } }, notes de 1 à 5.
  scores jsonb not null,
  created_at timestamptz not null default now(),
  primary key (campaign_id, rater_id, pair_index)
);

alter table public.preset_jobs enable row level security;
alter table public.preset_switches enable row level security;
alter table public.preset_lab_campaigns enable row level security;
alter table public.preset_lab_votes enable row level security;

create policy "lecture de ses commandes de preset" on public.preset_jobs
  for select to authenticated using ((select auth.uid()) = user_id);
