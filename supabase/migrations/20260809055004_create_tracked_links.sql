-- Turn the Link Clicks report into a complete tracked-link workflow.
create table if not exists public.tracked_links (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 80),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  destination_url text not null check (destination_url ~ '^https?://'),
  source_platform text not null check (source_platform in ('instagram', 'facebook', 'tiktok', 'youtube', 'other')),
  utm_source text,
  utm_medium text,
  utm_campaign text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.tracked_links enable row level security;

create policy "customers can only access their own tracked links"
on public.tracked_links
for all
to authenticated
using (customer_id in (select id from public.customers where auth_user_id = auth.uid()))
with check (customer_id in (select id from public.customers where auth_user_id = auth.uid()));

create index if not exists idx_tracked_links_customer_id
on public.tracked_links(customer_id);

create index if not exists idx_link_clicks_customer_slug
on public.link_clicks(customer_id, link_slug);

-- Supabase is moving new public tables to explicit Data API grants. Keep the
-- browser client tenant-scoped through RLS and reserve click recording for the
-- server-only secret/service-role client.
grant select, insert, update, delete on table public.tracked_links to authenticated;
grant select, insert, update, delete on table public.tracked_links to service_role;
grant select on table public.link_clicks to authenticated;
grant insert, select on table public.link_clicks to service_role;
