import { Catalog } from "@/components/catalog";
import { ProductListStructuredData } from "@/components/structured-data";
import { getPublishedProducts } from "@/lib/catalog";
import { getStoreCategories } from "@/lib/categories";
import { getCatalogMerch, getSiteAppearance } from "@/lib/site";

export const dynamic = "force-dynamic";

const description =
  "Il catalogo online di Halo Store a Conversano: abbigliamento uomo, outfit di nicchia e capi selezionati. Ritiro in negozio o spedizione in Italia.";

export async function generateMetadata() {
  const appearance = await getSiteAppearance();
  const photo = appearance.homeSections.find((section) => section.interlude?.kind === "image")
    ?.interlude?.url;
  return {
    title: "Catalogo",
    description,
    alternates: { canonical: "/catalogo" },
    ...(photo
      ? {
          openGraph: { title: "Catalogo · Halo Store Conversano", description, images: [{ url: photo }] },
          twitter: { card: "summary_large_image", images: [photo] },
        }
      : {}),
  };
}

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
