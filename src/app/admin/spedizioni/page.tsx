import { createAdminClient } from "@/lib/supabase";
import { isPacklinkLive } from "@/lib/packlink";
import { loadAllPacklinkStates } from "@/lib/packlink-store";
import { PacklinkPickupBoard, PacklinkQuoteLab, type PickupRow } from "@/components/packlink-pickup-board";
import { orderStatusLabel, type OrderStatus } from "@/lib/orders";

export default async function AdminSpedizioniPage() {
  const admin = createAdminClient();
  const [{ data: orders }, states] = await Promise.all([
    admin
      .from("halo_orders")
      .select(
        "id, status, fulfillment, shipping_name, shipping_city, halo_customers(email)",
      )
      .eq("fulfillment", "shipping")
      .in("status", ["paid", "preparing", "shipped"])
      .order("created_at", { ascending: false })
      .limit(80),
    loadAllPacklinkStates(),
  ]);

  const rows: PickupRow[] = (orders ?? [])
    .map((order) => {
      const state = states.get(order.id);
      if (!state?.reference) return null;
      const customer = order.halo_customers as { email?: string } | { email?: string }[] | null;
      const email = Array.isArray(customer) ? customer[0]?.email : customer?.email;
      return {
        id: order.id,
        email: email ?? "",
        name: order.shipping_name ?? "",
        city: order.shipping_city ?? "",
        status: orderStatusLabel[order.status as OrderStatus] ?? order.status,
        state,
      };
    })
    .filter((row): row is PickupRow => Boolean(row));

  return (
    <div className="grid gap-12">
      <PacklinkPickupBoard configured={isPacklinkLive()} rows={rows} />
      <PacklinkQuoteLab configured={isPacklinkLive()} />
    </div>
  );
}
