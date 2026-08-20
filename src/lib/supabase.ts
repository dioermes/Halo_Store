import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function publicUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
}

function anonKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
}

export function isSupabaseConfigured() {
  return Boolean(publicUrl() && anonKey());
}

export function createPublicClient(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase non è configurato");
  }
  return createClient(publicUrl(), anonKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function isAdminConfigured() {
  return Boolean(publicUrl() && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function createAdminClient(): SupabaseClient {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!publicUrl() || !serviceKey) {
    throw new Error("Manca SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(publicUrl(), serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
