import { createAdminClient, createPublicClient, isAdminConfigured, isSupabaseConfigured } from "@/lib/supabase";

export type StoreSettings = {
  shippingItalyCents: number;
  lowStockAt: number;
  holdMinutes: number;
};

const defaults: StoreSettings = {
  shippingItalyCents: 700,
  lowStockAt: 2,
  holdMinutes: 20,
};

function parseSettings(
  rows: Array<{ key: string; value: unknown }> | null,
): StoreSettings {
  const map = new Map((rows ?? []).map((row) => [row.key, row.value]));
  return {
    shippingItalyCents: Number(map.get("shipping_italy_cents") ?? defaults.shippingItalyCents),
    lowStockAt: Number(map.get("low_stock_at") ?? defaults.lowStockAt),
    holdMinutes: Number(map.get("hold_minutes") ?? defaults.holdMinutes),
  };
}

export async function getStoreSettings(): Promise<StoreSettings> {
  if (!isSupabaseConfigured()) return defaults;
  try {
    const client = isAdminConfigured() ? createAdminClient() : createPublicClient();
    const { data } = await client
      .from("halo_settings")
      .select("key, value")
      .in("key", ["shipping_italy_cents", "low_stock_at", "hold_minutes"]);
    return parseSettings(data);
  } catch {
    return defaults;
  }
}

export async function saveStoreSettings(next: StoreSettings) {
  const admin = createAdminClient();
  const rows = [
    { key: "shipping_italy_cents", value: next.shippingItalyCents, updated_at: new Date().toISOString() },
    { key: "low_stock_at", value: next.lowStockAt, updated_at: new Date().toISOString() },
    { key: "hold_minutes", value: next.holdMinutes, updated_at: new Date().toISOString() },
  ];
  const { error } = await admin.from("halo_settings").upsert(rows);
  if (error) throw new Error(error.message);
}
