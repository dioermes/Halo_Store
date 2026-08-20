import {
  createAdminClient,
  createPublicClient,
  isAdminConfigured,
  isSupabaseConfigured,
} from "@/lib/supabase";
import { fallbackCategories, type StoreCategory } from "@/lib/products";
import { slugify } from "@/lib/slug";

export const BUILTIN_CATEGORY_IDS = fallbackCategories.map((row) => row.id);

const CATEGORIES_KEY = "catalog_categories";
const OVERRIDES_KEY = "product_category_overrides";

function dataClient() {
  return isAdminConfigured() ? createAdminClient() : createPublicClient();
}

function asCategoryList(value: unknown): StoreCategory[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((row) => {
    if (!row || typeof row !== "object") return [];
    const item = row as Partial<StoreCategory>;
    if (typeof item.id !== "string" || typeof item.label !== "string") return [];
    return [
      {
        id: item.id,
        label: item.label,
        hint: typeof item.hint === "string" ? item.hint : "",
      },
    ];
  });
}

function asOverrides(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string" && Boolean(entry[1]),
    ),
  );
}

function mergeCategories(...lists: StoreCategory[][]) {
  const map = new Map<string, StoreCategory>();
  for (const list of lists) {
    for (const row of list) {
      if (!row.id) continue;
      map.set(row.id, row);
    }
  }
  return [...map.values()];
}

export function labelFromCategoryId(id: string, list: StoreCategory[] = fallbackCategories) {
  return list.find((row) => row.id === id)?.label
    ?? id
      .split("-")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
}

export function catalogFilters(list: StoreCategory[], productCount: number): StoreCategory[] {
  return [
    {
      id: "tutti",
      label: "Tutto il negozio",
      hint: `${productCount} ${productCount === 1 ? "capo" : "capi"}`,
    },
    ...list,
  ];
}

async function readSetting(key: string) {
  if (!isSupabaseConfigured()) return null;
  const client = dataClient();
  const { data } = await client.from("halo_settings").select("value").eq("key", key).maybeSingle();
  return data?.value ?? null;
}

async function writeSetting(key: string, value: unknown) {
  const client = createAdminClient();
  const { error } = await client.from("halo_settings").upsert({
    key,
    value,
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);
}

export async function getStoreCategories(): Promise<StoreCategory[]> {
  const fromTable = await readCategoryTable();
  const fromSettings = asCategoryList(await readSetting(CATEGORIES_KEY));
  return mergeCategories(fallbackCategories, fromTable, fromSettings);
}

async function readCategoryTable(): Promise<StoreCategory[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const client = dataClient();
    const { data, error } = await client
      .from("halo_categories")
      .select("id, label, hint")
      .order("sort_order");
    if (error || !data) return [];
    return asCategoryList(data);
  } catch {
    return [];
  }
}

export async function getProductCategoryOverrides(): Promise<Record<string, string>> {
  return asOverrides(await readSetting(OVERRIDES_KEY));
}

export function applyCategoryOverride(
  productId: string | undefined,
  stored: string,
  overrides: Record<string, string>,
) {
  if (productId && overrides[productId]) return overrides[productId];
  return stored;
}

export async function ensureStoreCategory(input: {
  id?: string;
  label: string;
  hint?: string;
}): Promise<StoreCategory> {
  const label = input.label.trim();
  if (!label) throw new Error("Dai un nome alla tipologia.");
  const id = slugify(input.id || label);
  if (!id) throw new Error("Usa almeno una lettera nel nome della tipologia.");
  const category: StoreCategory = {
    id,
    label,
    hint: input.hint?.trim() ?? "",
  };

  const client = createAdminClient();
  const { error: tableError } = await client.from("halo_categories").upsert({
    id: category.id,
    label: category.label,
    hint: category.hint,
    sort_order: 50,
  });
  if (!tableError) return category;

  const current = await getStoreCategories();
  const next = mergeCategories(current, [category]);
  await writeSetting(CATEGORIES_KEY, next);
  return category;
}

export async function saveCategoryOverride(productId: string, categoryId: string | null) {
  const current = await getProductCategoryOverrides();
  if (categoryId) current[productId] = categoryId;
  else delete current[productId];
  await writeSetting(OVERRIDES_KEY, current);
}

export function uniqueCategoryId(label: string, existing: StoreCategory[]) {
  const base = slugify(label) || "tipologia";
  if (!existing.some((row) => row.id === base)) return base;
  let index = 2;
  while (existing.some((row) => row.id === `${base}-${index}`)) index += 1;
  return `${base}-${index}`;
}
