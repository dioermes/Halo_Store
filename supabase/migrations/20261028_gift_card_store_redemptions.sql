create table if not exists public.halo_gift_card_store_redemptions (
  id uuid primary key default gen_random_uuid(),
  gift_card_id uuid not null references public.halo_gift_cards(id),
  amount_cents integer not null check (amount_cents > 0),
  balance_after_cents integer not null check (balance_after_cents >= 0),
  redeemed_by text not null,
  created_at timestamptz not null default now()
);

create index if not exists halo_gift_card_store_redemptions_card_idx
  on public.halo_gift_card_store_redemptions (gift_card_id, created_at desc);

alter table public.halo_gift_card_store_redemptions enable row level security;

create or replace function public.halo_redeem_gift_card_in_store(
  p_code text,
  p_amount_cents integer,
  p_redeemed_by text
) returns table (code text, amount_cents integer, balance_cents integer)
language plpgsql
security definer
set search_path to public, pg_temp
as $$
declare
  card public.halo_gift_cards%rowtype;
  held integer;
begin
  if p_amount_cents is null or p_amount_cents <= 0 then
    raise exception 'gift_card_invalid_amount';
  end if;
  if p_redeemed_by is null or length(trim(p_redeemed_by)) = 0 then
    raise exception 'gift_card_missing_operator';
  end if;

  select * into card
  from public.halo_gift_cards
  where halo_gift_cards.code = upper(regexp_replace(trim(p_code), '[[:space:]]+', '', 'g'))
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

  if p_amount_cents > greatest(0, card.balance_cents - held) then
    raise exception 'gift_card_insufficient_balance';
  end if;

  update public.halo_gift_cards as gift_card
  set balance_cents = gift_card.balance_cents - p_amount_cents
  where gift_card.id = card.id
  returning * into card;

  insert into public.halo_gift_card_store_redemptions (
    gift_card_id, amount_cents, balance_after_cents, redeemed_by
  ) values (
    card.id, p_amount_cents, card.balance_cents, trim(p_redeemed_by)
  );

  return query select card.code, p_amount_cents, card.balance_cents;
end;
$$;

revoke all on function public.halo_redeem_gift_card_in_store(text, integer, text)
  from public, anon, authenticated;
grant execute on function public.halo_redeem_gift_card_in_store(text, integer, text)
  to service_role;

notify pgrst, 'reload schema';
