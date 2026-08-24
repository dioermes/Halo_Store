import { createAdminClient, createPublicClient, isAdminConfigured, isSupabaseConfigured } from "@/lib/supabase";

export type StoreSettings = {
  shippingItalyCents: number;
  lowStockAt: number;
  holdMinutes: number;
  newsletterDiscountPercent: number;
  newsletterCode: string;
  birthdayDiscountPercent: number;
  birthdayCode: string;
  birthdayValidDays: number;
};

const defaults: StoreSettings = {
  shippingItalyCents: 700,
  lowStockAt: 2,
  holdMinutes: 20,
  newsletterDiscountPercent: 10,
  newsletterCode: "HALO10",
  birthdayDiscountPercent: 15,
  birthdayCode: "COMPLEANNO",
  birthdayValidDays: 14,
};

const settingKeys = [
  "shipping_italy_cents",
  "low_stock_at",
  "hold_minutes",
  "newsletter_discount_percent",
  "newsletter_code",
  "birthday_discount_percent",
  "birthday_code",
  "birthday_valid_days",
] as const;

function asNumber(value: unknown, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function asString(value: unknown, fallback: string) {
  if (typeof value === "string" && value.trim()) return value.trim();
  return fallback;
}

function parseSettings(
  rows: Array<{ key: string; value: unknown }> | null,
): StoreSettings {
  const map = new Map((rows ?? []).map((row) => [row.key, row.value]));
  return {
    shippingItalyCents: asNumber(map.get("shipping_italy_cents"), defaults.shippingItalyCents),
    lowStockAt: asNumber(map.get("low_stock_at"), defaults.lowStockAt),
    holdMinutes: asNumber(map.get("hold_minutes"), defaults.holdMinutes),
    newsletterDiscountPercent: asNumber(
      map.get("newsletter_discount_percent"),
      defaults.newsletterDiscountPercent,
    ),
    newsletterCode: asString(map.get("newsletter_code"), defaults.newsletterCode).toUpperCase(),
    birthdayDiscountPercent: asNumber(
      map.get("birthday_discount_percent"),
      defaults.birthdayDiscountPercent,
    ),
    birthdayCode: asString(map.get("birthday_code"), defaults.birthdayCode).toUpperCase(),
    birthdayValidDays: asNumber(map.get("birthday_valid_days"), defaults.birthdayValidDays),
  };
}

export async function getStoreSettings(): Promise<StoreSettings> {
  if (!isSupabaseConfigured()) return defaults;
  try {
    const client = isAdminConfigured() ? createAdminClient() : createPublicClient();
    const { data } = await client.from("halo_settings").select("key, value").in("key", [...settingKeys]);
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
    {
      key: "newsletter_discount_percent",
      value: next.newsletterDiscountPercent,
      updated_at: new Date().toISOString(),
    },
    { key: "newsletter_code", value: next.newsletterCode, updated_at: new Date().toISOString() },
    {
      key: "birthday_discount_percent",
      value: next.birthdayDiscountPercent,
      updated_at: new Date().toISOString(),
    },
    { key: "birthday_code", value: next.birthdayCode, updated_at: new Date().toISOString() },
    { key: "birthday_valid_days", value: next.birthdayValidDays, updated_at: new Date().toISOString() },
  ];
  const { error } = await admin.from("halo_settings").upsert(rows);
  if (error) throw new Error(error.message);
}
