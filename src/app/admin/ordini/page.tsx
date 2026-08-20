import Link from "next/link";
import { createAdminClient } from "@/lib/supabase";
import { formatPrice } from "@/lib/products";
import { orderStatusLabel, type OrderStatus } from "@/lib/orders";

export default async function AdminOrdersPage() {
  const admin = createAdminClient();
  const { data: orders } = await admin
    .from("halo_orders")
    .select("id, status, fulfillment, total_cents, created_at, halo_customers(email)")
    .order("created_at", { ascending: false })
    .limit(80);

  return (
    <div>
      <h2 className="font-display text-3xl">Ordini</h2>
      <ul className="mt-6 divide-y divide-ink-line border-y border-ink-line">
        {(orders ?? []).map((order) => {
          const customer = order.halo_customers as { email?: string } | { email?: string }[] | null;
          const email = Array.isArray(customer) ? customer[0]?.email : customer?.email;
          return (
            <li key={order.id} className="py-4">
              <Link href={`/admin/ordini/${order.id}`} className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-display text-2xl">#{order.id.slice(0, 8)}</span>
                <span className="text-sm text-ivory-dim">
                  {email} · {order.fulfillment === "pickup" ? "ritiro" : "spedizione"} ·{" "}
                  {order.fulfillment === "pickup" &&
                  order.status !== "completed" &&
                  order.status !== "cancelled"
                    ? `da incassare ${formatPrice(order.total_cents / 100)}`
                    : formatPrice(order.total_cents / 100)}
                </span>
                <span className="text-sm text-halo-bright">{orderStatusLabel[order.status as OrderStatus]}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
