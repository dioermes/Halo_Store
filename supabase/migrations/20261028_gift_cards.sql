alter table public.halo_orders
  add column if not exists gift_card_discount_cents integer not null default 0,
  add column if not exists gift_card_id uuid;

create table if not exists public.halo_gift_card_purchases (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.halo_customers(id),
  buyer_email text not null,
  amount_cents integer not null check (amount_cents between 1000 and 30000),
  status text not null default 'pending' check (status in ('pending', 'paid', 'cancelled')),
  stripe_session_id text unique,
  stripe_payment_intent text,
  gift_card_id uuid unique,
  email_claimed_at timestamptz,
  email_sent_at timestamptz,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

alter table public.halo_gift_card_purchases
  drop constraint if exists halo_gift_card_purchases_stripe_session_id_key;
create index if not exists halo_gift_card_purchases_session_idx
  on public.halo_gift_card_purchases (stripe_session_id);

create table if not exists public.halo_gift_cards (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid not null unique references public.halo_gift_card_purchases(id),
  code text not null unique,
  buyer_email text not null,
  initial_balance_cents integer not null check (initial_balance_cents > 0),
  balance_cents integer not null check (balance_cents >= 0),
  created_at timestamptz not null default now()
);

alter table public.halo_gift_card_purchases
  drop constraint if exists halo_gift_card_purchases_gift_card_id_fkey;
alter table public.halo_gift_card_purchases
  add constraint halo_gift_card_purchases_gift_card_id_fkey
  foreign key (gift_card_id) references public.halo_gift_cards(id);
alter table public.halo_orders
  drop constraint if exists halo_orders_gift_card_id_fkey;
alter table public.halo_orders
  add constraint halo_orders_gift_card_id_fkey
  foreign key (gift_card_id) references public.halo_gift_cards(id);

create table if not exists public.halo_gift_card_holds (
  id uuid primary key default gen_random_uuid(),
  gift_card_id uuid not null references public.halo_gift_cards(id),
  order_id uuid not null unique references public.halo_orders(id) on delete cascade,
  amount_cents integer not null check (amount_cents > 0),
  expires_at timestamptz not null,
  released_at timestamptz,
  consumed_at timestamptz,
  restored_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.halo_gift_card_transactions (
  id uuid primary key default gen_random_uuid(),
  gift_card_id uuid not null references public.halo_gift_cards(id),
  order_id uuid not null references public.halo_orders(id),
  transaction_type text not null check (transaction_type in ('redeem', 'restore')),
  amount_cents integer not null check (amount_cents > 0),
  created_at timestamptz not null default now(),
  unique (order_id, transaction_type)
);

create index if not exists halo_gift_cards_code_idx on public.halo_gift_cards (code);
create index if not exists halo_gift_card_holds_active_idx
  on public.halo_gift_card_holds (gift_card_id, expires_at)
  where released_at is null and consumed_at is null;

alter table public.halo_gift_card_purchases enable row level security;
alter table public.halo_gift_cards enable row level security;
alter table public.halo_gift_card_holds enable row level security;
alter table public.halo_gift_card_transactions enable row level security;

create or replace function public.halo_reserve_gift_card(
  p_code text,
  p_order_id uuid,
  p_requested_cents integer,
  p_minutes integer default 35
) returns table (gift_card_id uuid, reserved_cents integer)
language plpgsql
security definer
set search_path to public, pg_temp
as $$
declare
  card public.halo_gift_cards%rowtype;
  held integer;
  available integer;
begin
  select * into card
  from public.halo_gift_cards
  where code = upper(regexp_replace(trim(p_code), '[[:space:]]+', '', 'g'))
  for update;
  if not found then
    raise exception 'gift_card_invalid';
  end if;

  select coalesce(sum(h.amount_cents), 0)::integer into held
  from public.halo_gift_card_holds h
  where h.gift_card_id = card.id
    and h.released_at is null
    and h.consumed_at is null
    and h.expires_at > now();

  available := greatest(0, card.balance_cents - held);
  if available <= 0 then
    raise exception 'gift_card_empty';
  end if;

  insert into public.halo_gift_card_holds (
    gift_card_id, order_id, amount_cents, expires_at
  ) values (
    card.id,
    p_order_id,
    least(available, greatest(0, p_requested_cents)),
    now() + make_interval(mins => greatest(1, p_minutes))
  );
  return query select card.id, least(available, greatest(0, p_requested_cents));
end;
$$;

create or replace function public.halo_consume_gift_card_hold(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path to public, pg_temp
as $$
declare
  hold public.halo_gift_card_holds%rowtype;
begin
  select * into hold
  from public.halo_gift_card_holds
  where order_id = p_order_id
  for update;
  if not found or hold.released_at is not null then
    return;
  end if;
  if hold.consumed_at is not null then
    return;
  end if;

  update public.halo_gift_cards
  set balance_cents = balance_cents - hold.amount_cents
  where id = hold.gift_card_id
    and balance_cents >= hold.amount_cents;
  if not found then
    raise exception 'gift_card_balance_changed';
  end if;

  update public.halo_gift_card_holds
  set consumed_at = now()
  where id = hold.id;
  insert into public.halo_gift_card_transactions (
    gift_card_id, order_id, transaction_type, amount_cents
  ) values (hold.gift_card_id, p_order_id, 'redeem', hold.amount_cents)
  on conflict (order_id, transaction_type) do nothing;
end;
$$;

create or replace function public.halo_restore_gift_card_hold(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path to public, pg_temp
as $$
declare
  hold public.halo_gift_card_holds%rowtype;
begin
  select * into hold
  from public.halo_gift_card_holds
  where order_id = p_order_id
  for update;
  if not found or hold.restored_at is not null then
    return;
  end if;

  if hold.consumed_at is not null then
    update public.halo_gift_cards
    set balance_cents = balance_cents + hold.amount_cents
    where id = hold.gift_card_id;
    insert into public.halo_gift_card_transactions (
      gift_card_id, order_id, transaction_type, amount_cents
    ) values (hold.gift_card_id, p_order_id, 'restore', hold.amount_cents)
    on conflict (order_id, transaction_type) do nothing;
    update public.halo_gift_card_holds set restored_at = now() where id = hold.id;
  else
    update public.halo_gift_card_holds set released_at = now() where id = hold.id;
  end if;
end;
$$;

create or replace function public.halo_issue_gift_card(
  p_purchase_id uuid,
  p_session_id text,
  p_payment_intent text,
  p_code text
) returns table (gift_card_id uuid, code text, buyer_email text, amount_cents integer)
language plpgsql
security definer
set search_path to public, pg_temp
as $$
declare
  purchase public.halo_gift_card_purchases%rowtype;
  card public.halo_gift_cards%rowtype;
begin
  select * into purchase
  from public.halo_gift_card_purchases
  where id = p_purchase_id
  for update;
  if not found or purchase.stripe_session_id is distinct from p_session_id then
    raise exception 'gift_card_purchase_not_found';
  end if;

  if purchase.status not in ('pending', 'paid') then
    raise exception 'gift_card_purchase_not_payable';
  end if;

  select * into card
  from public.halo_gift_cards
  where halo_gift_cards.purchase_id = p_purchase_id;
  if not found then
    insert into public.halo_gift_cards (
      purchase_id, code, buyer_email, initial_balance_cents, balance_cents
    ) values (
      p_purchase_id, p_code, purchase.buyer_email, purchase.amount_cents, purchase.amount_cents
    )
    returning * into card;
  end if;

  update public.halo_gift_card_purchases
  set status = 'paid',
      stripe_payment_intent = coalesce(p_payment_intent, stripe_payment_intent),
      gift_card_id = card.id,
      paid_at = coalesce(paid_at, now())
  where id = p_purchase_id;

  return query select card.id, card.code, card.buyer_email, card.initial_balance_cents;
end;
$$;

create or replace function public.halo_claim_gift_card_email(p_purchase_id uuid)
returns boolean
language plpgsql
security definer
set search_path to public, pg_temp
as $$
begin
  update public.halo_gift_card_purchases
  set email_claimed_at = now()
  where id = p_purchase_id
    and email_sent_at is null
    and (email_claimed_at is null or email_claimed_at < now() - interval '5 minutes');
  return found;
end;
$$;

create or replace function public.halo_mark_gift_card_email_sent(p_purchase_id uuid)
returns void
language sql
security definer
set search_path to public, pg_temp
as $$
  update public.halo_gift_card_purchases
  set email_sent_at = now()
  where id = p_purchase_id;
$$;

revoke all on function public.halo_reserve_gift_card(text, uuid, integer, integer) from public, anon, authenticated;
revoke all on function public.halo_consume_gift_card_hold(uuid) from public, anon, authenticated;
revoke all on function public.halo_restore_gift_card_hold(uuid) from public, anon, authenticated;
revoke all on function public.halo_issue_gift_card(uuid, text, text, text) from public, anon, authenticated;
revoke all on function public.halo_claim_gift_card_email(uuid) from public, anon, authenticated;
revoke all on function public.halo_mark_gift_card_email_sent(uuid) from public, anon, authenticated;
grant execute on function public.halo_reserve_gift_card(text, uuid, integer, integer) to service_role;
grant execute on function public.halo_consume_gift_card_hold(uuid) to service_role;
grant execute on function public.halo_restore_gift_card_hold(uuid) to service_role;
grant execute on function public.halo_issue_gift_card(uuid, text, text, text) to service_role;
grant execute on function public.halo_claim_gift_card_email(uuid) to service_role;
grant execute on function public.halo_mark_gift_card_email_sent(uuid) to service_role;
