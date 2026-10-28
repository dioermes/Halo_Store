import { ProductEditor } from "@/components/product-editor";
import { getStoreCategories } from "@/lib/categories";
import { getAllProductsAdmin, getProductAdmin } from "@/lib/catalog";
import { getCatalogMerch } from "@/lib/site";
import { notFound } from "next/navigation";

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ salvato?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const saved = query.salvato === "1";
  const [categories, merch, products] = await Promise.all([
    getStoreCategories(),
    getCatalogMerch(),
    getAllProductsAdmin(),
  ]);
  const existingBadges = [
    ...new Set(
      products
        .filter((item) => item.published !== false)
        .map((item) => item.badge?.trim() ?? "")
        .filter(Boolean),
    ),
  ].sort((a, b) => a.localeCompare(b, "it"));
  if (id === "nuovo") {
    return (
      <ProductEditor
        saved={saved}
        categories={categories}
        tags={merch.tags}
        existingBadges={existingBadges}
      />
    );
  }
  const product = products.find((item) => item.uuid === id) ?? await getProductAdmin(id);
  if (!product) notFound();
  return (
    <ProductEditor
      product={product}
      productId={id}
      saved={saved}
      categories={categories}
      tags={merch.tags}
      existingBadges={existingBadges}
    />
  );
}
