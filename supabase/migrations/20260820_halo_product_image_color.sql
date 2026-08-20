-- Foto dedicata per ciascuna colorazione del capo.
alter table public.halo_product_images
  add column if not exists color text;

create unique index if not exists halo_images_product_color_idx
  on public.halo_product_images (product_id, color)
  where color is not null;
