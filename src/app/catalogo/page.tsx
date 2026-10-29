import { Catalog } from "@/components/catalog";
import { ProductListStructuredData } from "@/components/structured-data";
import { getPublishedProducts } from "@/lib/catalog";
import { getStoreCategories } from "@/lib/categories";
import { getCatalogMerch } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Catalogo",
  description: "Tutto il catalogo Halo Store a Conversano.",
  alternates: { canonical: "/catalogo" },
};

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string | string[] }>;
}) {
  const [products, categories, merch, query] = await Promise.all([
    getPublishedProducts(),
    getStoreCategories(),
    getCatalogMerch(),
    searchParams,
  ]);
  const requestedTag = typeof query.tag === "string" ? query.tag : "";
  const validTag =
    ["newArrival", "bestseller", "sale"].includes(requestedTag) ||
    merch.tags.some((tag) => tag.id === requestedTag);
  const initialTag = validTag ? requestedTag : "";

  return (
    <>
      <ProductListStructuredData products={products} />
      <Catalog
        products={products}
        categories={categories}
        initialCategory="tutti"
        initialTag={initialTag}
        tags={merch.tags}
      />
    </>
  );
}
