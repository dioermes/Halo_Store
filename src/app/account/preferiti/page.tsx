import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { ensureCustomer } from "@/lib/auth";
import { getPublishedProducts } from "@/lib/catalog";
import { createAdminClient } from "@/lib/supabase";

export default async function AccountFavoritesPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in?redirect_url=%2Faccount%2Fpreferiti");

  const customer = await ensureCustomer(user);
  const admin = createAdminClient();
  const { data: favorites, error } = await admin
    .from("halo_product_favorites")
    .select("product_id")
    .eq("customer_id", customer.id)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Impossibile caricare i preferiti: ${error.message}`);

  const products = await getPublishedProducts();
  const productById = new Map(
    products.filter((product) => product.uuid).map((product) => [product.uuid!, product]),
  );
  const favoriteProducts = (favorites ?? [])
    .map((favorite) => productById.get(favorite.product_id))
    .filter((product) => product !== undefined);

  return (
    <section className="mx-auto max-w-7xl px-5 pb-20 pt-32 sm:px-8">
      <p className="text-xs uppercase tracking-[0.34em] text-halo">Il tuo account</p>
      <h1 className="mt-4 font-display text-5xl">I tuoi preferiti</h1>
      {favoriteProducts.length ? (
        <div className="halo-product-grid mt-10">
          {favoriteProducts.map((product) => (
            <ProductCard key={product.uuid} product={product} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-ink-line bg-ink-soft p-6 sm:p-8">
          <p className="text-ivory-dim">Non hai ancora aggiunto capi ai preferiti.</p>
          <Link
            href="/catalogo"
            className="mt-5 inline-flex rounded-full border border-ink-line px-5 py-3 text-sm transition-colors hover:border-halo/60 hover:text-halo-bright"
          >
            Scopri il catalogo
          </Link>
        </div>
      )}
    </section>
  );
}
