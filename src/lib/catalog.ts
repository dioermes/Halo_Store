import { unstable_noStore as noStore } from "next/cache";
import {
  createAdminClient,
  createPublicClient,
  isAdminConfigured,
  isSupabaseConfigured,
} from "@/lib/supabase";
import {
  products as fallbackProducts,
  type CategoryId,
  type Product,
  type ProductVariant,
} from "@/lib/products";
import { applyCategoryOverride, getProductCategoryOverrides } from "@/lib/categories";
import { applyCatalogMerch, getCatalogMerch } from "@/lib/site";

export { findVariant } from "@/lib/products";

type ImageRow = {
  url: string;
  alt: string | null;
  sort_order: number;
  color?: string | null;
};
type VariantRow = {
  id: string;
  size: string;
  color: string;
  sku: string | null;
  stock: number;
  low_stock_at: number;
  available?: number;
};

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  category: CategoryId;
  price_cents: number;
  compare_at_cents: number | null;
  fabric: string;
  fit: string;
  care: string;
  description: string;
  badge: string | null;
  published: boolean;
  sort_order: number;
  halo_product_images?: ImageRow[];
  halo_variants?: VariantRow[];
};

function imageColor(row: ImageRow) {
  if (row.color) return row.color;
  if (row.alt?.startsWith("color:")) return row.alt.slice(6);
  return null;
}

export function mapProductRow(
  row: ProductRow,
  overrides: Record<string, string> = {},
): Product {
  const images = [...(row.halo_product_images ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order,
  );
  const variants: ProductVariant[] = (row.halo_variants ?? []).map((variant) => ({
    id: variant.id,
    size: variant.size,
    color: variant.color,
    sku: variant.sku ?? undefined,
    stock: variant.available ?? variant.stock,
    lowStockAt: variant.low_stock_at,
  }));
  const sizes = [...new Set(variants.map((variant) => variant.size))];
  const colors = [...new Set(variants.map((variant) => variant.color))];
  const stock = variants.reduce((sum, variant) => sum + variant.stock, 0);

  const colorImages: Record<string, string> = {};
  const general: ImageRow[] = [];
  for (const image of images) {
    const color = imageColor(image);
    if (color) colorImages[color] = image.url;
    else general.push(image);
  }

  const cover =
    general[0]?.url ??
    colorImages[colors[0] ?? ""] ??
    "/catalogo/amb-interno.jpg";

  return {
    id: row.slug,
    uuid: row.id,
    name: row.name,
    subtitle: row.subtitle,
    category: applyCategoryOverride(row.id, row.category, overrides),
    price: row.price_cents / 100,
    compareAt: row.compare_at_cents ? row.compare_at_cents / 100 : undefined,
    sizes: sizes.length > 0 ? sizes : ["Taglia unica"],
    colors: colors.length > 0 ? colors : ["—"],
    fabric: row.fabric,
    fit: row.fit,
    care: row.care,
    description: row.description,
    image: cover,
    gallery: [...general.map((image) => image.url), ...Object.values(colorImages)],
    colorImages,
    badge: row.badge ?? undefined,
    stock,
    variants,
    published: row.published,
  };
}

const select = "*, halo_product_images(*), halo_variants(*)";

export async function getPublishedProducts(): Promise<Product[]> {
  noStore();
  if (!isSupabaseConfigured()) return fallbackProducts;
  try {
    const client = createPublicClient();
    const { data, error } = await client
      .from("halo_products")
      .select(select)
      .eq("published", true)
      .order("sort_order");
    if (error || !data?.length) return fallbackProducts;
    const [overrides, merch] = await Promise.all([
      getProductCategoryOverrides(),
      getCatalogMerch(),
    ]);
    return applyCatalogMerch(
      (data as ProductRow[]).map((row) => mapProductRow(row, overrides)),
      merch,
    );
  } catch {
    return fallbackProducts;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await getPublishedProducts();
  return products.find((product) => product.id === slug) ?? null;
}

export async function getAllProductsAdmin(): Promise<Product[]> {
  const client = isAdminConfigured() ? createAdminClient() : createPublicClient();
  const { data, error } = await client
    .from("halo_products")
    .select(select)
    .order("sort_order");
  if (error || !data) throw new Error(error?.message ?? "Catalogo non disponibile");
  const [overrides, merch] = await Promise.all([
    getProductCategoryOverrides(),
    getCatalogMerch(),
  ]);
  return applyCatalogMerch(
    (data as ProductRow[]).map((row) => mapProductRow(row, overrides)),
    merch,
  );
}

export async function getProductAdmin(id: string): Promise<Product | null> {
  const client = createAdminClient();
  const { data, error } = await client
    .from("halo_products")
    .select(select)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  const [overrides, merch] = await Promise.all([
    getProductCategoryOverrides(),
    getCatalogMerch(),
  ]);
  return data ? applyCatalogMerch([mapProductRow(data as ProductRow, overrides)], merch)[0] : null;
}

