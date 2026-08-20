import Image from "next/image";
import Link from "next/link";
import { getAllProductsAdmin } from "@/lib/catalog";
import { catalogFilters, getStoreCategories, labelFromCategoryId } from "@/lib/categories";
import { formatPrice } from "@/lib/products";
import { togglePublishedAction } from "@/app/admin/actions";
import { DeleteProductButton } from "@/components/delete-product-button";

export default async function AdminCatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>;
}) {
  const query = await searchParams;
  const [products, storeCategories] = await Promise.all([
    getAllProductsAdmin(),
    getStoreCategories(),
  ]);
  const filters = catalogFilters(storeCategories, products.length);
  const active = filters.some((category) => category.id === query.tipo)
    ? query.tipo!
    : "tutti";
  const visible =
    active === "tutti"
      ? products
      : products.filter((product) => product.category === active);

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-3xl">Catalogo</h2>
        <Link href="/admin/catalogo/nuovo" className="rounded-full bg-ivory px-5 py-2 text-sm text-ink">
          Nuovo capo
        </Link>
      </div>

      <div
        className="mt-6 flex flex-wrap gap-2"
        role="tablist"
        aria-label="Filtra per tipologia"
      >
        {filters.map((category) => {
          const selected = active === category.id;
          const href =
            category.id === "tutti"
              ? "/admin/catalogo"
              : `/admin/catalogo?tipo=${category.id}`;
          return (
            <Link
              key={category.id}
              href={href}
              scroll={false}
              role="tab"
              aria-selected={selected}
              className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                selected
                  ? "border-halo bg-halo/10 text-halo-bright"
                  : "border-ink-line text-ivory-dim hover:border-halo/60 hover:text-ivory"
              }`}
            >
              {category.id === "tutti" ? "Tutti" : category.label}
            </Link>
          );
        })}
      </div>
      <p className="mt-3 text-sm text-ivory-dim">
        {visible.length} {visible.length === 1 ? "capo" : "capi"}
        {active !== "tutti" && (
          <>
            {" · "}
            {filters.find((category) => category.id === active)?.hint}
          </>
        )}
      </p>

      {visible.length === 0 ? (
        <p className="mt-8 text-ivory-dim">Nessun capo in questa tipologia.</p>
      ) : (
        <ul className="mt-6 divide-y divide-ink-line border-y border-ink-line">
          {visible.map((product) => {
            const tipo = labelFromCategoryId(product.category, storeCategories);
            return (
              <li
                key={product.uuid ?? product.id}
                className="flex flex-wrap items-center justify-between gap-3 py-4"
              >
                <Link
                  href={`/admin/catalogo/${product.uuid}`}
                  className="flex min-w-0 flex-1 items-center gap-4"
                >
                  <span className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl border border-ink-line bg-ink-soft">
                    {product.gallery && product.gallery.length > 0 ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : null}
                  </span>
                  <div className="min-w-0">
                    <p className="font-display text-2xl">{product.name}</p>
                    <p className="text-sm text-ivory-dim">
                      {tipo} · {formatPrice(product.price)} · {product.stock} pz in tutto ·{" "}
                      {product.published === false ? "nascosto" : "pubblico"}
                    </p>
                  </div>
                </Link>
                <div className="flex gap-2">
                  <form
                    action={async () => {
                      "use server";
                      await togglePublishedAction(product.uuid ?? "", !(product.published ?? true));
                    }}
                  >
                    <button type="submit" className="rounded-full border border-ink-line px-4 py-2 text-sm">
                      {product.published === false ? "Pubblica" : "Nascondi"}
                    </button>
                  </form>
                  <Link
                    href={`/admin/catalogo/${product.uuid}`}
                    className="rounded-full border border-ink-line px-4 py-2 text-sm"
                  >
                    Modifica
                  </Link>
                  {product.uuid ? (
                    <DeleteProductButton id={product.uuid} name={product.name} />
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
