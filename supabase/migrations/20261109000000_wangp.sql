-- File des générations rendues sur le PC (WanGP) au lieu de fal.ai : images,
-- vidéos par prompt, vidéo de star et vidéo de la statue.
-- Le planificateur local vient chercher les tâches (/api/wangp/next), les rend,
-- dépose le résultat dans Supabase Storage puis signale la fin (/api/wangp/[id]/complete).
-- Même identifiant que la ligne de "generations" : il sert aussi de request id.
create table public.wangp_jobs (
  id uuid primary key references public.generations (id) on delete cascade,
  model text not null,
  email text not null,
  prompt text not null default '',
  -- Vidéos par prompt seulement.
  duration integer,
  -- Images et vidéos par prompt seulement.
  aspect_ratio text,
  -- Mensurations facultatives de la vidéo de star.
  options jsonb not null default '{}',
  -- Chemins des images du client dans le bucket "videos".
  photos text[] not null default '{}',
  -- queued → running → done | failed
  status text not null default 'queued',
  result_path text,
  error text,
  created_at timestamptz not null default now(),
  claimed_at timestamptz,
  finished_at timestamptz
);
create index wangp_jobs_queue_idx on public.wangp_jobs (status, created_at);

-- Aucune règle : seul le serveur (service_role) lit et écrit cette table.
alter table public.wangp_jobs enable row level security;
