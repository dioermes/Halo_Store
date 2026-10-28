import Link from "next/link";
import { createAdminClient } from "@/lib/supabase";
import { formatPrice } from "@/lib/products";
import { orderStatusLabel, type OrderStatus } from "@/lib/orders";
import {
  getSeenAdminOrderIds,
  groupAdminOrdersByDate,
  isUnseenAdminOrder,
} from "@/lib/admin-orders";
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
  const groups = groupAdminOrdersByDate(orders ?? []);
  for (const group of groups) {
    group.orders.sort((a, b) => {
      const aNew = isUnseenAdminOrder(a.status, a.id, seen) ? 0 : 1;
      const bNew = isUnseenAdminOrder(b.status, b.id, seen) ? 0 : 1;
      return aNew - bNew;
    });
  }

  return (
    <div>
      <h2 className="font-display text-3xl">Ordini</h2>
      <AdminLiveRefresh />
      <div className="mt-6 space-y-8">
        {groups.map((group) => (
          <section key={group.key}>
            <h3 className="mb-2 border-b border-ink-line pb-2 text-xs uppercase tracking-[0.2em] text-ivory-dim">
              {group.label}
            </h3>
            <ul className="divide-y divide-ink-line border-y border-ink-line">
              {group.orders.map((order) => {
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
          </section>
        ))}
      </div>
    </div>
  );
}
