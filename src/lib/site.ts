import { unstable_noStore as noStore } from "next/cache";
import { deleteCatalogObjects } from "@/lib/catalog-bucket";
import { createAdminClient, createPublicClient, isAdminConfigured, isSupabaseConfigured } from "@/lib/supabase";
import { ambientImages, type Product } from "@/lib/products";

export type SiteMedia = {
  url: string;
  kind: "image" | "video";
};

export type SiteMediaSlot = "heroDesktop" | "heroMobile";

export type HomeSectionSource = "newArrival" | "bestseller" | "sale" | "picks" | "tag";

export type HomeSection = {
  id: string;
  title: string;
  source: HomeSectionSource;
  tagId: string;
  productIds: string[];
  featuredIds: string[];
  interlude: SiteMedia | null;
};

export type SiteAppearance = {
  heroDesktop: SiteMedia;
  heroMobile: SiteMedia;
  homeSections: HomeSection[];
  soldOutBadgeBg: string;
  soldOutBadgeFg: string;
};

export type CatalogTag = {
  id: string;
  label: string;
};

export type CatalogMerch = {
  newArrivalIds: string[];
  bestsellerIds: string[];
  saleIds: string[];
  keywords: Record<string, string>;
  tags: CatalogTag[];
  tagProductIds: Record<string, string[]>;
};

const HOME_SOURCES = new Set<HomeSectionSource>(["newArrival", "bestseller", "sale", "picks", "tag"]);

export const homeSectionSourceOptions: { id: HomeSectionSource; label: string; hint: string }[] = [
  {
    id: "newArrival",
    label: "Nuovi arrivi",
    hint: "Mostra i capi con il tag nuovo arrivo nel catalogo.",
  },
  {
    id: "bestseller",
    label: "Best seller",
    hint: "Mostra i capi con il tag best seller nel catalogo.",
  },
  {
    id: "sale",
    label: "Saldi",
    hint: "Mostra i capi in saldo.",
  },
  {
    id: "picks",
    label: "Capi scelti a mano",
    hint: "Scegli tu quali capi mettere in questa sezione, ad esempio una collezione estate.",
  },
  {
    id: "tag",
    label: "Tag personalizzato",
    hint: "Mostra i capi con un tag che hai creato tu, per una sezione della home.",
  },
];

function defaultHomeSections(legacy: {
  interlude?: unknown;
  interludeSale?: unknown;
  featuredNewIds?: unknown;
  featuredBestIds?: unknown;
  featuredSaleIds?: unknown;
}): HomeSection[] {
  return [
    {
      id: "nuovi-arrivi",
      title: "Nuovi arrivi",
      source: "newArrival",
      tagId: "",
      productIds: [],
      featuredIds: asIdList(legacy.featuredNewIds).slice(0, 4),
      interlude: asMedia(legacy.interlude, { url: ambientImages.leather, kind: "image" }),
    },
    {
      id: "best-seller",
      title: "Best seller",
      source: "bestseller",
      tagId: "",
      productIds: [],
      featuredIds: asIdList(legacy.featuredBestIds).slice(0, 4),
      interlude: asMedia(legacy.interludeSale, { url: ambientImages.denim, kind: "image" }),
    },
    {
      id: "saldi",
      title: "Saldi",
      source: "sale",
      tagId: "",
      productIds: [],
      featuredIds: asIdList(legacy.featuredSaleIds).slice(0, 4),
      interlude: null,
    },
  ];
}

const appearanceDefaults: SiteAppearance = {
  heroDesktop: { url: ambientImages.interior, kind: "image" },
  heroMobile: { url: ambientImages.interior, kind: "image" },
  homeSections: defaultHomeSections({}),
  soldOutBadgeBg: "#dc2626",
  soldOutBadgeFg: "#ffffff",
};

const merchDefaults: CatalogMerch = {
  newArrivalIds: [],
  bestsellerIds: [],
  saleIds: [],
  keywords: {},
  tags: [],
  tagProductIds: {},
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

function asOptionalMedia(value: unknown): SiteMedia | null {
  if (!value || typeof value !== "object") return null;
  const row = value as { url?: unknown; kind?: unknown };
  const url = typeof row.url === "string" ? row.url.trim() : "";
  if (!url) return null;
  return { url, kind: mediaKind(url, row.kind) };
}

function asIdList(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((id): id is string => typeof id === "string" && id.length > 0);
}

export function asHexColor(value: unknown, fallback: string) {
  const raw = typeof value === "string" ? value.trim() : "";
  if (/^#[0-9a-fA-F]{6}$/.test(raw)) return raw.toLowerCase();
  if (/^[0-9a-fA-F]{6}$/.test(raw)) return `#${raw.toLowerCase()}`;
  return fallback;
}

export function slugifyHomeSection(value: string) {
  const slug = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return slug || "sezione";
}

export function uniqueHomeSectionId(title: string, used: string[]) {
  const base = slugifyHomeSection(title);
  if (!used.includes(base)) return base;
  let n = 2;
  while (used.includes(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

function parseSource(value: unknown): HomeSectionSource {
  if (typeof value === "string" && HOME_SOURCES.has(value as HomeSectionSource)) {
    return value as HomeSectionSource;
  }
  return "picks";
}

function parseHomeSection(value: unknown, usedIds: string[]): HomeSection | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const title =
    typeof row.title === "string" && row.title.trim() ? row.title.trim().slice(0, 80) : "Sezione";
  const requested =
    typeof row.id === "string" && row.id.trim()
      ? slugifyHomeSection(row.id)
      : slugifyHomeSection(title);
  const id = usedIds.includes(requested) ? uniqueHomeSectionId(requested, usedIds) : requested;
  const source = parseSource(row.source);
  const rawTag = typeof row.tagId === "string" ? row.tagId.trim() : "";
  return {
    id,
    title,
    source,
    tagId: source === "tag" && rawTag ? slugifyHomeSection(rawTag) : "",
    productIds: asIdList(row.productIds),
    featuredIds: asIdList(row.featuredIds).slice(0, 4),
    interlude: asOptionalMedia(row.interlude),
  };
}

export function parseHomeSectionsPayload(value: unknown): HomeSection[] {
  if (!Array.isArray(value)) return [];
  const sections: HomeSection[] = [];
  for (const item of value.slice(0, 16)) {
    const parsed = parseHomeSection(
      item,
      sections.map((section) => section.id),
    );
    if (parsed) sections.push(parsed);
  }
  return sections;
}

function parseHomeSections(row: Record<string, unknown>): HomeSection[] {
  if (Array.isArray(row.homeSections)) return parseHomeSectionsPayload(row.homeSections);
  return defaultHomeSections(row);
}

function parseAppearance(value: unknown): SiteAppearance {
  if (!value || typeof value !== "object") return appearanceDefaults;
  const row = value as Record<string, unknown> & Partial<SiteAppearance>;
  return {
    heroDesktop: asMedia(row.heroDesktop, appearanceDefaults.heroDesktop),
    heroMobile: asMedia(row.heroMobile, appearanceDefaults.heroMobile),
    homeSections: parseHomeSections(row),
    soldOutBadgeBg: asHexColor(
      migrateSoldOutColor(row.soldOutBadgeBg, "#3f1521", appearanceDefaults.soldOutBadgeBg),
      appearanceDefaults.soldOutBadgeBg,
    ),
    soldOutBadgeFg: asHexColor(
      migrateSoldOutColor(row.soldOutBadgeFg, "#c5cebc", appearanceDefaults.soldOutBadgeFg),
      appearanceDefaults.soldOutBadgeFg,
    ),
  };
}

function migrateSoldOutColor(value: unknown, previousDefault: string, nextDefault: string) {
  const hex = asHexColor(value, "");
  if (!hex) return nextDefault;
  if (hex === previousDefault) return nextDefault;
  return hex;
}

function parseTags(value: unknown): CatalogTag[] {
  if (!Array.isArray(value)) return [];
  const tags: CatalogTag[] = [];
  const used = tags.map((tag) => tag.id);
  for (const item of value.slice(0, 40)) {
    if (!item || typeof item !== "object") continue;
    const row = item as { id?: unknown; label?: unknown };
    const label = typeof row.label === "string" ? row.label.trim().slice(0, 40) : "";
    if (!label) continue;
    const requested =
      typeof row.id === "string" && row.id.trim() ? slugifyHomeSection(row.id) : slugifyHomeSection(label);
    const id = used.includes(requested) ? uniqueHomeSectionId(requested, used) : requested;
    used.push(id);
    tags.push({ id, label });
  }
  return tags;
}

function parseTagProductIds(value: unknown): Record<string, string[]> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, ids]) => [key, asIdList(ids)]),
  );
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
    saleIds: asIdList(row.saleIds),
    keywords,
    tags: parseTags(row.tags),
    tagProductIds: parseTagProductIds(row.tagProductIds),
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
  return [
    appearance.heroDesktop.url,
    appearance.heroMobile.url,
    ...appearance.homeSections.map((section) => section.interlude?.url ?? ""),
  ];
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
      isOnSale:
        inList(merch.saleIds) ||
        Boolean(product.isOnSale) ||
        /saldi|sconto/i.test(product.badge ?? "") ||
        Boolean(product.compareAt && product.compareAt > product.price),
      customTagIds: merch.tags.filter((tag) => inList(merch.tagProductIds[tag.id] ?? [])).map((tag) => tag.id),
      customTags: merch.tags.filter((tag) => inList(merch.tagProductIds[tag.id] ?? [])),
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

export function productsForHomeSection(section: HomeSection, products: Product[]) {
  if (section.source === "newArrival") return products.filter((product) => product.isNewArrival);
  if (section.source === "bestseller") return products.filter((product) => product.isBestseller);
  if (section.source === "sale") return products.filter((product) => product.isOnSale);
  if (section.source === "tag") {
    const tagId = section.tagId;
    if (!tagId) return [];
    return products.filter((product) => (product.customTagIds ?? []).includes(tagId));
  }
  const matches = (product: Product, id: string) => product.uuid === id || product.id === id;
  return section.productIds
    .map((id) => products.find((product) => matches(product, id)))
    .filter((product): product is Product => Boolean(product));
}

export function sanitizeHomeSections(sections: HomeSection[], catalog: Product[]): HomeSection[] {
  const resolve = (id: string) => {
    const product = catalog.find((row) => row.uuid === id || row.id === id);
    return product ? productKey(product) : "";
  };
  return sections.map((section) => {
    const productIds = [...new Set(section.productIds.map(resolve).filter(Boolean))];
    const featuredIds = [...new Set(section.featuredIds.map(resolve).filter(Boolean))].slice(0, 4);
    const allowed = section.source === "picks" ? new Set(productIds) : null;
    return {
      ...section,
      tagId: section.source === "tag" ? section.tagId : "",
      productIds,
      featuredIds: allowed ? featuredIds.filter((id) => allowed.has(id)) : featuredIds,
    };
  });
}

export function dropProductFromHomeSections(sections: HomeSection[], productId: string): HomeSection[] {
  const drop = (ids: string[]) => ids.filter((id) => id !== productId);
  return sections.map((section) => ({
    ...section,
    productIds: drop(section.productIds),
    featuredIds: drop(section.featuredIds),
  }));
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

const RESERVED_TAG_IDS = ["newArrival", "bestseller", "sale", "picks", "tag"];

export function addCatalogTag(merch: CatalogMerch, label: string): { merch: CatalogMerch; tag: CatalogTag } {
  const trimmed = label.trim().slice(0, 40);
  if (!trimmed) throw new Error("Serve un nome per il tag.");
  const existing = merch.tags.find((tag) => tag.label.toLowerCase() === trimmed.toLowerCase());
  if (existing) return { merch, tag: existing };
  const used = [...RESERVED_TAG_IDS, ...merch.tags.map((tag) => tag.id)];
  const tag = { id: uniqueHomeSectionId(trimmed, used), label: trimmed };
  return {
    merch: {
      ...merch,
      tags: [...merch.tags, tag],
      tagProductIds: { ...merch.tagProductIds, [tag.id]: merch.tagProductIds[tag.id] ?? [] },
    },
    tag,
  };
}

export function mergeCatalogTags(merch: CatalogMerch, incoming: CatalogTag[]): CatalogMerch {
  let next = merch;
  for (const tag of incoming) {
    next = addCatalogTag(next, tag.label).merch;
  }
  return next;
}

export function setProductMerch(
  merch: CatalogMerch,
  productId: string,
  patch: {
    newArrival: boolean;
    bestseller: boolean;
    sale: boolean;
    keywords: string;
    customTagIds?: string[];
  },
): CatalogMerch {
  const toggle = (ids: string[], on: boolean) =>
    on ? [...new Set([...ids, productId])] : ids.filter((id) => id !== productId);
  const keywords = { ...merch.keywords };
  const text = patch.keywords.trim();
  if (text) keywords[productId] = text;
  else delete keywords[productId];
  const selected = patch.customTagIds;
  const tagProductIds = { ...merch.tagProductIds };
  if (selected) {
    const chosen = new Set(selected);
    for (const tag of merch.tags) {
      tagProductIds[tag.id] = toggle(tagProductIds[tag.id] ?? [], chosen.has(tag.id));
    }
  }
  return {
    newArrivalIds: toggle(merch.newArrivalIds, patch.newArrival),
    bestsellerIds: toggle(merch.bestsellerIds, patch.bestseller),
    saleIds: toggle(merch.saleIds, patch.sale),
    keywords,
    tags: merch.tags,
    tagProductIds,
  };
}

export function removeProductMerch(merch: CatalogMerch, productId: string): CatalogMerch {
  const keywords = { ...merch.keywords };
  delete keywords[productId];
  const drop = (ids: string[]) => ids.filter((id) => id !== productId);
  return {
    newArrivalIds: drop(merch.newArrivalIds),
    bestsellerIds: drop(merch.bestsellerIds),
    saleIds: drop(merch.saleIds),
    keywords,
    tags: merch.tags,
    tagProductIds: Object.fromEntries(
      Object.entries(merch.tagProductIds).map(([key, ids]) => [key, drop(ids)]),
    ),
  };
}
