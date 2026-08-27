-- The advisor flags views that run as the creator (SECURITY DEFINER).
-- security_invoker applies RLS and grants of the user who queries the view.
alter view public.halo_variants_store set (security_invoker = true);
