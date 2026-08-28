-- Production Halo was missing halo_categories (PostgREST 404).
-- Also applies leftover column/policy bits if a later migration was skipped.

create table if not exists public.halo_categories (
  id text primary key,
  label text not null,
  hint text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

insert into public.halo_categories (id, label, hint, sort_order) values
  ('top', 'Top', 'T-shirt, camicie, maglieria', 1),
  ('denim', 'Denim', 'Jeans e capispalla in tela', 2),
  ('outerwear', 'Outerwear', 'Pelle, bomber, cappotti', 3),
  ('accessori', 'Accessori', 'Il dettaglio che cambia tutto', 4)
on conflict (id) do nothing;

alter table public.halo_products drop constraint if exists halo_products_category_check;

alter table public.halo_categories enable row level security;

drop policy if exists halo_categories_public_read on public.halo_categories;
create policy halo_categories_public_read on public.halo_categories
  for select using (true);

grant select on public.halo_categories to anon, authenticated;
grant all on public.halo_categories to service_role;

alter table public.halo_orders add column if not exists packlink jsonb;
alter table public.halo_orders add column if not exists discount_cents integer not null default 0;
alter table public.halo_orders add column if not exists discount_code text;
alter table public.halo_orders add column if not exists discount_kind text;
alter table public.halo_product_images add column if not exists color text;

drop policy if exists halo_settings_public_read on public.halo_settings;
create policy halo_settings_public_read on public.halo_settings
  for select using (
    key in (
      'shipping_italy_cents',
      'low_stock_at',
      'hold_minutes',
      'catalog_categories',
      'product_category_overrides',
      'site_appearance',
      'catalog_merch'
    )
  );

notify pgrst, 'reload schema';
