import { unstable_noStore as noStore } from "next/cache";
import { deleteCatalogObjects } from "@/lib/catalog-bucket";
import { createAdminClient, createPublicClient, isAdminConfigured, isSupabaseConfigured } from "@/lib/supabase";
import { ambientImages, type Product } from "@/lib/products";

export type SiteMedia = {
  url: string;
  kind: "image" | "video";
};

export type SiteAppearance = {
  heroDesktop: SiteMedia;
  heroMobile: SiteMedia;
  interlude: SiteMedia;
  featuredNewIds: string[];
  featuredBestIds: string[];
};

export type CatalogMerch = {
  newArrivalIds: string[];
  bestsellerIds: string[];
  keywords: Record<string, string>;
};

const appearanceDefaults: SiteAppearance = {
  heroDesktop: { url: ambientImages.interior, kind: "image" },
  heroMobile: { url: ambientImages.interior, kind: "image" },
  interlude: { url: ambientImages.leather, kind: "image" },
  featuredNewIds: [],
  featuredBestIds: [],
};

const merchDefaults: CatalogMerch = {
  newArrivalIds: [],
  bestsellerIds: [],
  keywords: {},
};

function mediaKind(url: string, kind: unknown): SiteMedia["kind"] {
  if (kind === "video" || /\.(mp4|webm|mov)(\?|$)/i.test(url)) return "video";
  return "image";
}

function asMedia(value: unknown, fallback: SiteMedia): SiteMedia {
  if (!value || typeof value !== "object") return fallback;
  const row = value as { url?: unknown; kind?: unknown };
  const url = typeof row.url === "string" ? row.url.trim() : "";
  if (!url) return fallback;
  return { url, kind: mediaKind(url, row.kind) };
}

function asIdList(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((id): id is string => typeof id === "string" && id.length > 0);
}

function parseAppearance(value: unknown): SiteAppearance {
  if (!value || typeof value !== "object") return appearanceDefaults;
  const row = value as Partial<SiteAppearance>;
  return {
    heroDesktop: asMedia(row.heroDesktop, appearanceDefaults.heroDesktop),
    heroMobile: asMedia(row.heroMobile, appearanceDefaults.heroMobile),
    interlude: asMedia(row.interlude, appearanceDefaults.interlude),
    featuredNewIds: asIdList(row.featuredNewIds).slice(0, 4),
    featuredBestIds: asIdList(row.featuredBestIds).slice(0, 4),
  };
}

function parseMerch(value: unknown): CatalogMerch {
  if (!value || typeof value !== "object") return merchDefaults;
  const row = value as Partial<CatalogMerch> & { keywords?: unknown };
  const keywords =
    row.keywords && typeof row.keywords === "object" && !Array.isArray(row.keywords)
      ? Object.fromEntries(
          Object.entries(row.keywords as Record<string, unknown>).flatMap(([key, text]) =>
            typeof text === "string" && text.trim() ? [[key, text.trim()]] : [],
          ),
        )
      : {};
  return {
    newArrivalIds: asIdList(row.newArrivalIds),
    bestsellerIds: asIdList(row.bestsellerIds),
    keywords,
  };
}

function settingsClient() {
  return isAdminConfigured() ? createAdminClient() : createPublicClient();
}

async function readSetting(key: string) {
  noStore();
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await settingsClient()
      .from("halo_settings")
      .select("value")
      .eq("key", key)
      .maybeSingle();
    if (error) {
      console.error("[halo_settings read]", key, error.message);
      return null;
    }
    return data?.value ?? null;
  } catch {
    return null;
  }
}

async function writeSetting(key: string, value: unknown) {
  const admin = createAdminClient();
  const { error } = await admin
    .from("halo_settings")
    .upsert(
      { key, value, updated_at: new Date().toISOString() },
      { onConflict: "key" },
    );
  if (error) throw new Error(error.message);
}

export async function getSiteAppearance(): Promise<SiteAppearance> {
  return parseAppearance(await readSetting("site_appearance"));
}

function appearanceMediaUrls(appearance: SiteAppearance) {
  return [appearance.heroDesktop.url, appearance.heroMobile.url, appearance.interlude.url];
}

async function urlsStillUsedByProducts(urls: string[]) {
  if (!urls.length || !isSupabaseConfigured()) return new Set<string>();
  try {
    const { data } = await createAdminClient()
      .from("halo_product_images")
      .select("url")
      .in("url", urls);
    return new Set((data ?? []).map((row) => row.url).filter(Boolean));
  } catch {
    return new Set<string>();
  }
}

async function deleteReplacedHomeMedia(previous: SiteAppearance, next: SiteAppearance) {
  const kept = new Set(appearanceMediaUrls(next));
  const leftover = appearanceMediaUrls(previous).filter((url) => url && !kept.has(url));
  if (!leftover.length) return;
  const usedByProducts = await urlsStillUsedByProducts(leftover);
  await deleteCatalogObjects(leftover.filter((url) => !usedByProducts.has(url)));
}

export async function saveSiteAppearance(next: SiteAppearance) {
  const previous = await getSiteAppearance();
  await writeSetting("site_appearance", next);
  await deleteReplacedHomeMedia(previous, next);
}

export async function patchSiteAppearance(patch: Partial<SiteAppearance>) {
  const current = await getSiteAppearance();
  await saveSiteAppearance({ ...current, ...patch });
}

export async function getCatalogMerch(): Promise<CatalogMerch> {
  return parseMerch(await readSetting("catalog_merch"));
}

export async function saveCatalogMerch(next: CatalogMerch) {
  await writeSetting("catalog_merch", next);
}

export function productKey(product: Pick<Product, "id" | "uuid">) {
  return product.uuid ?? product.id;
}

export function applyCatalogMerch(products: Product[], merch: CatalogMerch): Product[] {
  return products.map((product) => {
    const keys = [product.uuid, product.id].filter((value): value is string => Boolean(value));
    const inList = (ids: string[]) => ids.some((id) => keys.includes(id));
    return {
      ...product,
      isNewArrival:
        inList(merch.newArrivalIds) ||
        Boolean(product.isNewArrival) ||
        /nuovo arrivo/i.test(product.badge ?? ""),
      isBestseller:
        inList(merch.bestsellerIds) ||
        Boolean(product.isBestseller) ||
        /best seller/i.test(product.badge ?? ""),
      searchKeywords:
        keys.map((key) => merch.keywords[key]).find((text) => Boolean(text)) ?? product.searchKeywords,
    };
  });
}

export function pickFeatured(products: Product[], featuredIds: string[]) {
  const matches = (product: Product, id: string) => product.uuid === id || product.id === id;
  const featured = featuredIds
    .map((id) => products.find((product) => matches(product, id)))
    .filter((product): product is Product => Boolean(product));
  if (featured.length) return featured.slice(0, 4);
  return products.slice(0, 4);
}

/** Completa una sezione con altri capi del catalogo, così «Scopri di più» ha qualcosa da aprire. */
export function fillSection(tagged: Product[], pool: Product[], minimum = 7) {
  if (tagged.length >= minimum) return tagged;
  const seen = new Set(tagged.map(productKey));
  const extra = pool.filter((product) => !seen.has(productKey(product)));
  return [...tagged, ...extra.slice(0, minimum - tagged.length)];
}

export function merchKindFromFile(file: File): SiteMedia["kind"] {
  return file.type.startsWith("video/") ? "video" : "image";
}

export function setProductMerch(
  merch: CatalogMerch,
  productId: string,
  patch: { newArrival: boolean; bestseller: boolean; keywords: string },
): CatalogMerch {
  const toggle = (ids: string[], on: boolean) =>
    on ? [...new Set([...ids, productId])] : ids.filter((id) => id !== productId);
  const keywords = { ...merch.keywords };
  const text = patch.keywords.trim();
  if (text) keywords[productId] = text;
  else delete keywords[productId];
  return {
    newArrivalIds: toggle(merch.newArrivalIds, patch.newArrival),
    bestsellerIds: toggle(merch.bestsellerIds, patch.bestseller),
    keywords,
  };
}

export function removeProductMerch(merch: CatalogMerch, productId: string): CatalogMerch {
  const keywords = { ...merch.keywords };
  delete keywords[productId];
  return {
    newArrivalIds: merch.newArrivalIds.filter((id) => id !== productId),
    bestsellerIds: merch.bestsellerIds.filter((id) => id !== productId),
    keywords,
  };
}
