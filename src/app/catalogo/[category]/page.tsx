import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Catalog } from "@/components/catalog";
import { ProductListStructuredData } from "@/components/structured-data";
import { getPublishedProducts } from "@/lib/catalog";
import { catalogPath, getStoreCategories } from "@/lib/categories";
import { productHasCategory } from "@/lib/products";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const categories = await getStoreCategories();
  const row = categories.find((item) => item.id === category);
  if (!row) return {};
  return {
    title: row.label,
    description: `${row.label} da Halo Store a Conversano: abbigliamento uomo scelto capo per capo.`,
    alternates: { canonical: catalogPath(category) },
  };
}

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
