-- Newsletter subscribers, one-time welcome/birthday codes, order discount fields.
-- Apply on the Halo Store Supabase project (not via other MCP projects).

create table if not exists public.halo_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  birthday date not null,
  marketing_opt_in boolean not null default true,
  welcome_email_sent_at timestamptz,
  welcome_redeemed_at timestamptz,
  welcome_order_id uuid references public.halo_orders(id) on delete set null,
  birthday_email_year integer,
  birthday_redeemed_at timestamptz,
  birthday_order_id uuid references public.halo_orders(id) on delete set null,
  source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists halo_subscribers_birthday_idx on public.halo_subscribers (birthday);
create index if not exists halo_subscribers_opt_in_idx on public.halo_subscribers (marketing_opt_in);

alter table public.halo_subscribers enable row level security;

alter table public.halo_orders
  add column if not exists discount_cents integer not null default 0,
  add column if not exists discount_code text,
  add column if not exists discount_kind text;

insert into public.halo_settings (key, value, updated_at)
values
  ('newsletter_discount_percent', '10'::jsonb, now()),
  ('newsletter_code', '"HALO10"'::jsonb, now()),
  ('birthday_discount_percent', '15'::jsonb, now()),
  ('birthday_code', '"COMPLEANNO"'::jsonb, now()),
  ('birthday_valid_days', '14'::jsonb, now())
on conflict (key) do nothing;
