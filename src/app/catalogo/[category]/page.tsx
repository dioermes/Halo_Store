import { notFound } from "next/navigation";
import { Catalog } from "@/components/catalog";
import { ProductListStructuredData } from "@/components/structured-data";
import { getPublishedProducts } from "@/lib/catalog";
import { getStoreCategories } from "@/lib/categories";
import { productHasCategory } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function CatalogoCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const [products, categories] = await Promise.all([
    getPublishedProducts(),
    getStoreCategories(),
  ]);
  if (!categories.some((row) => row.id === category)) notFound();

  const visible = products.filter((product) => productHasCategory(product, category));

  return (
    <>
      <ProductListStructuredData products={visible} />
      <Catalog products={products} categories={categories} initialCategory={category} />
    </>
  );
}
