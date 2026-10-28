import { ProductEditor } from "@/components/product-editor";
import { getAllProductsAdmin } from "@/lib/catalog";
import { getStoreCategories } from "@/lib/categories";
import { getCatalogMerch } from "@/lib/site";

export default async function NewProductPage() {
  const [categories, merch, products] = await Promise.all([
    getStoreCategories(),
    getCatalogMerch(),
    getAllProductsAdmin(),
  ]);
  const existingBadges = [
    ...new Set(
      products
        .filter((product) => product.published !== false)
        .map((product) => product.badge?.trim() ?? "")
        .filter(Boolean),
    ),
  ].sort((a, b) => a.localeCompare(b, "it"));
  return (
    <ProductEditor
      categories={categories}
      tags={merch.tags}
      existingBadges={existingBadges}
    />
  );
}
