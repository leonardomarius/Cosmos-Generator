-- Statistiques de visites pour /admin, sans cookie : chaque visiteur est une
-- empreinte anonyme (hachage salé de l'IP et du navigateur, recalculée chaque
-- jour), jamais l'IP elle-même. Alimentées par src/proxy.ts.

-- Visiteurs uniques : une ligne par visiteur et par jour.
create table if not exists public.site_visitors (
  day date not null,
  visitor text not null,
  views integer not null default 0 check (views >= 0),
  primary key (day, visitor)
);

-- Pages vues, par jour et par page.
create table if not exists public.site_page_views (
  day date not null,
  path text not null,
  views integer not null default 0 check (views >= 0),
  primary key (day, path)
);

alter table public.site_visitors enable row level security;
alter table public.site_page_views enable row level security;

-- Une page vue : compte le visiteur et la page en une seule requête.
create or replace function public.record_site_visit(p_day date, p_visitor text, p_path text)
returns void
language sql
set search_path = ''
as $$
  insert into public.site_visitors (day, visitor, views) values (p_day, p_visitor, 1)
    on conflict (day, visitor) do update set views = public.site_visitors.views + 1;
  insert into public.site_page_views (day, path, views) values (p_day, left(p_path, 200), 1)
    on conflict (day, path) do update set views = public.site_page_views.views + 1;
$$;

revoke all on function public.record_site_visit(date, text, text) from public, anon, authenticated;
grant execute on function public.record_site_visit(date, text, text) to service_role;

-- Résumé par jour depuis p_since : visiteurs uniques et pages vues.
create or replace function public.site_visit_days(p_since date)
returns table (day date, visitors bigint, views bigint)
language sql
stable
set search_path = ''
as $$
  select v.day, count(*)::bigint, sum(v.views)::bigint
  from public.site_visitors v
  where v.day >= p_since
  group by v.day
  order by v.day;
$$;

revoke all on function public.site_visit_days(date) from public, anon, authenticated;
grant execute on function public.site_visit_days(date) to service_role;
