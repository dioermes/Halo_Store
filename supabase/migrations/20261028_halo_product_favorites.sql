create table if not exists public.halo_product_favorites (
  customer_id uuid not null references public.halo_customers(id) on delete cascade,
  product_id uuid not null references public.halo_products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (customer_id, product_id)
);

create index if not exists halo_product_favorites_customer_created_idx
  on public.halo_product_favorites (customer_id, created_at desc);

alter table public.halo_product_favorites enable row level security;
