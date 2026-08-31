import { Catalog } from "@/components/catalog";
import { ProductListStructuredData } from "@/components/structured-data";
import { getPublishedProducts } from "@/lib/catalog";
import { getStoreCategories } from "@/lib/categories";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Catalogo",
  description: "Tutto il catalogo Halo Store a Conversano.",
};

export default async function CatalogoPage() {
  const [products, categories] = await Promise.all([
    getPublishedProducts(),
    getStoreCategories(),
  ]);

  return (
    <>
      <ProductListStructuredData products={products} />
      <Catalog products={products} categories={categories} initialCategory="tutti" />
    </>
  );
}
