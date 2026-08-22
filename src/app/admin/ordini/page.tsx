import Link from "next/link";
import { createAdminClient } from "@/lib/supabase";
import { formatPrice } from "@/lib/products";
import { orderStatusLabel, type OrderStatus } from "@/lib/orders";
import { getSeenAdminOrderIds, isUnseenAdminOrder } from "@/lib/admin-orders";
import { AdminLiveRefresh } from "@/components/admin-live-refresh";
import { NewOrderTag } from "@/components/new-order-tag";

export default async function AdminOrdersPage() {
  const admin = createAdminClient();
  const [{ data: orders }, seen] = await Promise.all([
    admin
      .from("halo_orders")
      .select("id, status, fulfillment, total_cents, created_at, halo_customers(email)")
      .order("created_at", { ascending: false })
      .limit(80),
    getSeenAdminOrderIds(),
  ]);
  const list = [...(orders ?? [])].sort((a, b) => {
    const aNew = isUnseenAdminOrder(a.status, a.id, seen) ? 0 : 1;
    const bNew = isUnseenAdminOrder(b.status, b.id, seen) ? 0 : 1;
    if (aNew !== bNew) return aNew - bNew;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div>
      <h2 className="font-display text-3xl">Ordini</h2>
      <AdminLiveRefresh />
      <ul className="mt-6 divide-y divide-ink-line border-y border-ink-line">
        {list.map((order) => {
          const customer = order.halo_customers as { email?: string } | { email?: string }[] | null;
          const email = Array.isArray(customer) ? customer[0]?.email : customer?.email;
          const unseen = isUnseenAdminOrder(order.status, order.id, seen);
          return (
            <li key={order.id} className={`py-4 ${unseen ? "bg-ivory/10" : ""}`}>
              <Link href={`/admin/ordini/${order.id}`} className="flex flex-wrap items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  {unseen ? <NewOrderTag /> : null}
                  <span className="font-display text-2xl">#{order.id.slice(0, 8)}</span>
                </span>
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
