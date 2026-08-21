-- Public homepage must read vetrina settings without the service role.
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
