import Link from "next/link";
import { createAdminClient } from "@/lib/supabase";
import { formatPrice } from "@/lib/products";
import { orderStatusLabel, type OrderStatus } from "@/lib/orders";
import { getStoreSettings } from "@/lib/settings";

type ProductRef = { id?: string; name?: string; published?: boolean };

function productRef(value: ProductRef | ProductRef[] | null): ProductRef | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

export default async function AdminHome() {
  const admin = createAdminClient();
  const settings = await getStoreSettings();
  const { data: orders } = await admin
    .from("halo_orders")
    .select("id, status, total_cents, created_at, fulfillment")
    .neq("status", "pending_payment")
    .order("created_at", { ascending: false })
    .limit(8);
  const { data: variants } = await admin
    .from("halo_variants")
    .select("id, size, color, stock, product_id, halo_products(id, name, published)")
    .gt("stock", 0)
    .lte("stock", settings.lowStockAt)
    .order("stock");
  const low = (variants ?? [])
    .filter((row) => productRef(row.halo_products as ProductRef | ProductRef[] | null)?.published !== false)
    .slice(0, 12);

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <section>
        <h2 className="font-display text-3xl">Ordini recenti</h2>
        <ul className="mt-4 space-y-3">
          {(orders ?? []).map((order) => (
            <li key={order.id}>
              <Link href={`/admin/ordini/${order.id}`} className="flex justify-between rounded-2xl border border-ink-line px-4 py-3 hover:border-halo/50">
                <span>#{order.id.slice(0, 8)} · {order.fulfillment === "pickup" ? "ritiro" : "spedizione"}</span>
                <span className="text-halo-bright">
                  {orderStatusLabel[order.status as OrderStatus]} ·{" "}
                  {order.fulfillment === "pickup" &&
                  order.status !== "completed" &&
                  order.status !== "cancelled"
                    ? `da incassare ${formatPrice(order.total_cents / 100)}`
                    : formatPrice(order.total_cents / 100)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="font-display text-3xl">Scorte basse</h2>
        <p className="mt-2 text-sm text-ivory-dim">
          Conta i pezzi per taglia e colore, non il totale del capo. Soglia:{" "}
          {settings.lowStockAt} pz.
        </p>
        <ul className="mt-4 space-y-3 text-sm">
          {low.length === 0 && (
            <li className="text-ivory-dim">Nessun capo in esaurimento.</li>
          )}
          {low.map((row) => {
            const product = productRef(row.halo_products as ProductRef | ProductRef[] | null);
            const href = `/admin/catalogo/${product?.id ?? row.product_id}`;
            return (
              <li key={row.id}>
                <Link
                  href={href}
                  className="flex justify-between gap-3 rounded-2xl border border-ink-line px-4 py-3 hover:border-halo/50"
                >
                  <span>
                    {product?.name} · {row.size} · {row.color}
                  </span>
                  <span className="text-halo-bright">{row.stock} pz</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
