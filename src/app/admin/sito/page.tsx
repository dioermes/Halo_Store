import { SiteEditor } from "@/components/site-editor";
import { getAllProductsAdmin } from "@/lib/catalog";
import { getCatalogMerch, getSiteAppearance } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function AdminSitePage({
  searchParams,
}: {
  searchParams: Promise<{ salvato?: string }>;
}) {
  const query = await searchParams;
  const [appearance, products, merch] = await Promise.all([
    getSiteAppearance(),
    getAllProductsAdmin(),
    getCatalogMerch(),
  ]);

  return (
    <div className="grid gap-6">
      {query.salvato === "1" ? (
        <p className="rounded-2xl border border-halo/40 bg-halo/10 px-4 py-3 text-sm">
          Sito salvato. Apri la home e fai un refresh se vedi ancora il media precedente.
        </p>
      ) : null}
      <SiteEditor appearance={appearance} products={products} tags={merch.tags} />
    </div>
  );
}
