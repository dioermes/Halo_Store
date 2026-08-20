-- Halo e-commerce schema for the dedicated Halo Supabase project.


-- halo_ecommerce_schema
create table if not exists public.halo_customers (
  id uuid primary key default gen_random_uuid(),
  clerk_id text not null unique,
  email text not null,
  phone text,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.halo_consents (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null unique references public.halo_customers(id) on delete cascade,
  cookie_analytics boolean not null default false,
  cookie_marketing boolean not null default false,
  email_marketing boolean not null default false,
  email_marketing_at timestamptz,
  source text,
  updated_at timestamptz not null default now()
);

create table if not exists public.halo_products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  subtitle text not null default '',
  category text not null,
  price_cents integer not null check (price_cents >= 0),
  compare_at_cents integer check (compare_at_cents is null or compare_at_cents > 0),
  fabric text not null default '',
  fit text not null default '',
  care text not null default '',
  description text not null default '',
  badge text,
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.halo_product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.halo_products(id) on delete cascade,
  url text not null,
  alt text,
  sort_order integer not null default 0
);

create table if not exists public.halo_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.halo_products(id) on delete cascade,
  size text not null,
  color text not null,
  sku text unique,
  stock integer not null default 0 check (stock >= 0),
  low_stock_at integer not null default 2,
  unique (product_id, size, color)
);

create table if not exists public.halo_cart_items (
  id uuid primary key default gen_random_uuid(),
  clerk_id text not null,
  variant_id uuid not null references public.halo_variants(id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  unique (clerk_id, variant_id)
);

create table if not exists public.halo_orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.halo_customers(id),
  status text not null default 'pending_payment'
    check (status in ('pending_payment','paid','preparing','ready_for_pickup','shipped','completed','cancelled','refunded')),
  fulfillment text not null check (fulfillment in ('pickup','shipping')),
  stripe_session_id text unique,
  stripe_payment_intent text,
  subtotal_cents integer not null,
  shipping_cents integer not null default 0,
  total_cents integer not null,
  currency text not null default 'eur',
  shipping_name text,
  shipping_phone text,
  shipping_line1 text,
  shipping_line2 text,
  shipping_city text,
  shipping_postal_code text,
  shipping_province text,
  shipping_country text default 'IT',
  tracking_carrier text,
  tracking_code text,
  customer_note text,
  owner_notified_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.halo_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.halo_orders(id) on delete cascade,
  variant_id uuid references public.halo_variants(id),
  product_name text not null,
  size text not null,
  color text not null,
  image_url text,
  quantity integer not null check (quantity > 0),
  unit_price_cents integer not null
);

create table if not exists public.halo_stock_holds (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.halo_variants(id),
  quantity integer not null check (quantity > 0),
  order_id uuid references public.halo_orders(id) on delete cascade,
  stripe_session_id text,
  expires_at timestamptz not null,
  released_at timestamptz,
  confirmed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.halo_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.halo_webhook_events (
  id text primary key,
  source text not null,
  processed_at timestamptz not null default now()
);

create table if not exists public.halo_stock_alerts (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  variant_id uuid not null references public.halo_variants(id) on delete cascade,
  clerk_id text,
  created_at timestamptz not null default now(),
  unique (email, variant_id)
);

create index if not exists halo_variants_product_idx on public.halo_variants (product_id);
create index if not exists halo_images_product_idx on public.halo_product_images (product_id);
create index if not exists halo_cart_clerk_idx on public.halo_cart_items (clerk_id);
create index if not exists halo_orders_customer_idx on public.halo_orders (customer_id);
create index if not exists halo_orders_status_idx on public.halo_orders (status);
create index if not exists halo_holds_variant_idx on public.halo_stock_holds (variant_id) where released_at is null and confirmed_at is null;

insert into public.halo_settings (key, value) values
  ('shipping_italy_cents', '700'::jsonb),
  ('low_stock_at', '2'::jsonb),
  ('hold_minutes', '20'::jsonb),
  ('from_email', '"Halo Store <ordini@halostore-conversano.it>"'::jsonb)
on conflict (key) do nothing;

-- halo_stock_functions_rls_storage
create or replace function public.halo_available_stock(p_variant uuid)
returns integer
language sql
stable
as $$
  select greatest(
    0,
    v.stock - coalesce((
      select sum(h.quantity)
      from public.halo_stock_holds h
      where h.variant_id = v.id
        and h.released_at is null
        and h.confirmed_at is null
        and h.expires_at > now()
    ), 0)
  )
  from public.halo_variants v
  where v.id = p_variant;
$$;

create or replace function public.halo_release_expired_holds()
returns integer
language plpgsql
as $$
declare
  n integer;
begin
  update public.halo_stock_holds
  set released_at = now()
  where released_at is null
    and confirmed_at is null
    and expires_at <= now();
  get diagnostics n = row_count;
  return n;
end;
$$;

create or replace function public.halo_reserve_stock(
  p_items jsonb,
  p_order_id uuid,
  p_session_id text,
  p_minutes integer default 20
) returns void
language plpgsql
as $$
declare
  item jsonb;
  v_id uuid;
  qty integer;
  avail integer;
begin
  perform public.halo_release_expired_holds();

  for item in select * from jsonb_array_elements(p_items)
  loop
    v_id := (item->>'variant_id')::uuid;
    qty := (item->>'quantity')::integer;

    perform 1 from public.halo_variants where id = v_id for update;
    if not found then
      raise exception 'variant_not_found %', v_id;
    end if;

    select public.halo_available_stock(v_id) into avail;
    if avail < qty then
      raise exception 'insufficient_stock %', v_id;
    end if;

    insert into public.halo_stock_holds (variant_id, quantity, order_id, stripe_session_id, expires_at)
    values (v_id, qty, p_order_id, p_session_id, now() + make_interval(mins => p_minutes));
  end loop;
end;
$$;

create or replace function public.halo_confirm_holds(p_order_id uuid)
returns void
language plpgsql
as $$
begin
  update public.halo_variants v
  set stock = v.stock - h.quantity
  from public.halo_stock_holds h
  where h.order_id = p_order_id
    and h.variant_id = v.id
    and h.confirmed_at is null
    and h.released_at is null;

  update public.halo_stock_holds
  set confirmed_at = now()
  where order_id = p_order_id
    and confirmed_at is null
    and released_at is null;
end;
$$;

create or replace function public.halo_release_order_holds(p_order_id uuid)
returns void
language plpgsql
as $$
begin
  update public.halo_stock_holds
  set released_at = now()
  where order_id = p_order_id
    and released_at is null
    and confirmed_at is null;
end;
$$;

alter table public.halo_customers enable row level security;
alter table public.halo_consents enable row level security;
alter table public.halo_products enable row level security;
alter table public.halo_product_images enable row level security;
alter table public.halo_variants enable row level security;
alter table public.halo_cart_items enable row level security;
alter table public.halo_orders enable row level security;
alter table public.halo_order_items enable row level security;
alter table public.halo_stock_holds enable row level security;
alter table public.halo_settings enable row level security;
alter table public.halo_webhook_events enable row level security;
alter table public.halo_stock_alerts enable row level security;

drop policy if exists halo_products_public_read on public.halo_products;
create policy halo_products_public_read on public.halo_products
  for select using (published = true);

drop policy if exists halo_images_public_read on public.halo_product_images;
create policy halo_images_public_read on public.halo_product_images
  for select using (
    exists (
      select 1 from public.halo_products p
      where p.id = product_id and p.published = true
    )
  );

drop policy if exists halo_variants_public_read on public.halo_variants;
create policy halo_variants_public_read on public.halo_variants
  for select using (
    exists (
      select 1 from public.halo_products p
      where p.id = product_id and p.published = true
    )
  );

drop policy if exists halo_settings_public_read on public.halo_settings;
create policy halo_settings_public_read on public.halo_settings
  for select using (key in ('shipping_italy_cents','low_stock_at'));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'halo-catalog',
  'halo-catalog',
  true,
  5242880,
  array['image/jpeg','image/png','image/webp','image/avif']
)
on conflict (id) do nothing;

drop policy if exists halo_catalog_public_read on storage.objects;
create policy halo_catalog_public_read on storage.objects
  for select using (bucket_id = 'halo-catalog');

-- halo_variant_availability_view
create or replace view public.halo_variants_store as
select
  v.*,
  public.halo_available_stock(v.id) as available
from public.halo_variants v;

grant select on public.halo_variants_store to anon, authenticated;
