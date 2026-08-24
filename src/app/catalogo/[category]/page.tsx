import { notFound } from "next/navigation";
import { Catalog } from "@/components/catalog";
import { getPublishedProducts } from "@/lib/catalog";
import { getStoreCategories } from "@/lib/categories";

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

  return <Catalog products={products} categories={categories} initialCategory={category} />;
}
