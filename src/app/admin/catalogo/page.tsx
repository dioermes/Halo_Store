import Image from "next/image";
import Link from "next/link";
import { AdminCategoryBar } from "@/components/admin-category-bar";
import { getAllProductsAdmin } from "@/lib/catalog";
import { getStoreCategories, labelFromCategoryId } from "@/lib/categories";
import { formatPrice, stockBySize } from "@/lib/products";
import { togglePublishedFormAction } from "@/app/admin/actions";
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
  const active = storeCategories.some((category) => category.id === query.tipo)
    ? query.tipo!
    : "tutti";
  const visible =
    active === "tutti"
      ? products
      : products.filter((product) => product.category === active);

  return (
    <div className="min-w-0">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-3xl">Catalogo</h2>
        <Link
          href="/admin/catalogo/nuovo"
          className="shrink-0 rounded-full bg-ivory px-4 py-2 text-sm text-ink sm:px-5"
        >
          Nuovo capo
        </Link>
      </div>

      <AdminCategoryBar categories={storeCategories} active={active} />
      <p className="mt-3 text-sm text-ivory-dim">
        {visible.length} {visible.length === 1 ? "capo" : "capi"}
      </p>

      {visible.length === 0 ? (
        <p className="mt-8 text-ivory-dim">Nessun capo in questa tipologia.</p>
      ) : (
        <ul className="mt-6 divide-y divide-ink-line border-y border-ink-line">
          {visible.map((product) => {
            const tipo = labelFromCategoryId(product.category, storeCategories);
            const sizeStock = stockBySize(product);
            const meta = [
              tipo,
              formatPrice(product.price),
              ...sizeStock,
              product.published === false ? "nascosto" : "pubblico",
            ];
            return (
              <li key={product.uuid ?? product.id} className="grid gap-4 py-5 sm:flex sm:items-center sm:justify-between sm:gap-4">
                <Link
                  href={`/admin/catalogo/${product.uuid}`}
                  className="flex min-w-0 items-center gap-3 sm:flex-1 sm:gap-4"
                >
                  <span className="relative h-16 w-14 shrink-0 overflow-hidden rounded-xl border border-ink-line bg-ink-soft sm:h-20 sm:w-16">
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
                    <p className="truncate font-display text-xl leading-none sm:text-2xl">
                      {product.name}
                    </p>
                    <ul className="mt-2 flex flex-wrap gap-1.5">
                      {meta.map((item) => (
                        <li
                          key={`${product.uuid ?? product.id}-${item}`}
                          className="rounded-full border border-ink-line px-2 py-0.5 text-[11px] text-ivory-dim sm:text-xs"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Link>
                <div className="flex gap-2 sm:shrink-0">
                  <form
                    className="min-w-0 flex-1 sm:flex-none"
                    action={togglePublishedFormAction}
                  >
                    <input type="hidden" name="id" value={product.uuid ?? ""} />
                    <input
                      type="hidden"
                      name="published"
                      value={product.published === false ? "1" : "0"}
                    />
                    <button
                      type="submit"
                      className="w-full rounded-full border border-ink-line px-3 py-2 text-xs sm:w-auto sm:px-4 sm:text-sm"
                    >
                      {product.published === false ? "Pubblica" : "Nascondi"}
                    </button>
                  </form>
                  <Link
                    href={`/admin/catalogo/${product.uuid}`}
                    className="min-w-0 flex-1 rounded-full border border-ink-line px-3 py-2 text-center text-xs sm:flex-none sm:px-4 sm:text-sm"
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
