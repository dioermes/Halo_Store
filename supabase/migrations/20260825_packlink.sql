alter table public.halo_orders
  add column if not exists packlink jsonb;

comment on column public.halo_orders.packlink is
  'Spedizione Packlink PRO: pacco, corriere, riferimento, etichette, ritiro.';
