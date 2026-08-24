import { unstable_noStore as noStore } from "next/cache";
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

export function catalogPath(categoryId = "tutti") {
  return !categoryId || categoryId === "tutti" ? "/catalogo" : `/catalogo/${categoryId}`;
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
  noStore();
  const fromTable = await readCategoryTable();
  const fromSettings = asCategoryList(await readSetting(CATEGORIES_KEY));
  const managed = mergeCategories(fromTable, fromSettings);
  return managed.length ? managed : fallbackCategories;
}

async function persistCategoryList(list: StoreCategory[]) {
  const client = createAdminClient();
  for (const [index, category] of list.entries()) {
    const { error } = await client.from("halo_categories").upsert({
      id: category.id,
      label: category.label,
      hint: category.hint,
      sort_order: index + 1,
    });
    if (error) break;
  }
  await writeSetting(CATEGORIES_KEY, list);
}

export async function updateStoreCategory(input: {
  id: string;
  label: string;
  hint?: string;
}): Promise<StoreCategory> {
  const id = input.id.trim();
  const label = input.label.trim();
  if (!id) throw new Error("Tipologia mancante.");
  if (!label) throw new Error("Dai un nome alla tipologia.");
  const category: StoreCategory = {
    id,
    label,
    hint: input.hint?.trim() ?? "",
  };
  const current = await getStoreCategories();
  if (!current.some((row) => row.id === id)) throw new Error("Tipologia non trovata.");
  const next = current.map((row) => (row.id === id ? category : row));
  await persistCategoryList(next);
  return category;
}

export async function deleteStoreCategory(id: string) {
  const current = await getStoreCategories();
  if (!current.some((row) => row.id === id)) throw new Error("Tipologia non trovata.");
  if (current.length <= 1) throw new Error("Deve restare almeno una tipologia.");

  const client = createAdminClient();
  const { count } = await client
    .from("halo_products")
    .select("id", { count: "exact", head: true })
    .eq("category", id);
  const overrides = await getProductCategoryOverrides();
  const overrideCount = Object.values(overrides).filter((value) => value === id).length;
  if ((count ?? 0) + overrideCount > 0) {
    throw new Error("Sposta prima i capi di questa tipologia, poi puoi eliminarla.");
  }

  await client.from("halo_categories").delete().eq("id", id);
  const next = current.filter((row) => row.id !== id);
  await writeSetting(CATEGORIES_KEY, next);
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
