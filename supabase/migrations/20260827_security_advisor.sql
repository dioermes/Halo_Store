-- Security advisor: pinned search_path, no public listing of halo-catalog,
-- and revoke leftover rls_auto_enable RPC.

alter function public.halo_available_stock(uuid) set search_path to public, pg_temp;
alter function public.halo_release_expired_holds() set search_path to public, pg_temp;
alter function public.halo_reserve_stock(jsonb, uuid, text, integer) set search_path to public, pg_temp;
alter function public.halo_confirm_holds(uuid) set search_path to public, pg_temp;
alter function public.halo_release_order_holds(uuid) set search_path to public, pg_temp;

drop policy if exists halo_catalog_public_read on storage.objects;

revoke all on function public.rls_auto_enable() from public;
revoke all on function public.rls_auto_enable() from anon, authenticated;
