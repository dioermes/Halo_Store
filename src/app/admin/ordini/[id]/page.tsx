import Image from "next/image";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase";
import { formatPrice } from "@/lib/products";
import { nextStatuses, orderStatusLabel, type Fulfillment, type OrderStatus } from "@/lib/orders";
import { updateOrderAction } from "@/app/admin/actions";
import { OrderStatusSelect } from "@/components/order-status-select";

type OrderItem = {
  id: string;
  product_name: string;
  size: string;
  color: string;
  quantity: number;
  unit_price_cents: number;
  image_url: string | null;
};

export default async function AdminOrderDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();
  const { data: order } = await admin
    .from("halo_orders")
    .select("*, halo_customers(*), halo_order_items(*)")
    .eq("id", id)
    .maybeSingle();
  if (!order) notFound();

  const options = nextStatuses(order.status as OrderStatus, order.fulfillment as Fulfillment);
  const items = (order.halo_order_items ?? []) as OrderItem[];

  return (
    <div className="max-w-2xl">
      <h2 className="font-display text-4xl">Ordine #{order.id.slice(0, 8)}</h2>
      <p className="mt-2 text-ivory-dim">
        {order.halo_customers?.email} · {order.fulfillment === "pickup" ? "Ritiro" : "Spedizione"} ·{" "}
        {orderStatusLabel[order.status as OrderStatus]}
      </p>
      <ul className="mt-8 divide-y divide-ink-line border-y border-ink-line">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-4 py-4">
            <span className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl border border-ink-line bg-ink-soft">
              {item.image_url ? (
                <Image
                  src={item.image_url}
                  alt={item.product_name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              ) : null}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-2xl leading-none">{item.product_name}</p>
              <p className="mt-2 text-sm text-ivory-dim">
                {item.size} · {item.color} × {item.quantity}
              </p>
            </div>
            <span className="shrink-0 text-sm text-halo-bright">
              {formatPrice((item.unit_price_cents * item.quantity) / 100)}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-4 font-display text-3xl text-halo-bright">{formatPrice(order.total_cents / 100)}</p>
      {order.fulfillment === "pickup" && order.status !== "completed" && order.status !== "cancelled" && (
        <p className="mt-1 text-sm text-ivory-dim">Da incassare in negozio. Non è stato pagato online.</p>
      )}

      {order.shipping_name && (
        <p className="mt-6 text-sm text-ivory-dim">
          {order.fulfillment === "pickup" ? "Chi ritira" : "Spedizione"}
          <br />
          {order.shipping_name}
          {order.shipping_phone ? (
            <>
              <br />
              {order.shipping_phone}
            </>
          ) : null}
          {order.shipping_line1 ? (
            <>
              <br />
              {order.shipping_line1}, {order.shipping_postal_code} {order.shipping_city}
            </>
          ) : null}
        </p>
      )}
      {order.customer_note && (
        <p className="mt-4 whitespace-pre-line text-sm text-ivory">{order.customer_note}</p>
      )}

      <form action={updateOrderAction} className="mt-10 grid gap-3">
        <input type="hidden" name="id" value={order.id} />
        <OrderStatusSelect current={order.status as OrderStatus} options={options} />
        {order.fulfillment === "shipping" && (
          <>
            <input
              name="trackingCarrier"
              defaultValue={order.tracking_carrier ?? ""}
              placeholder="Corriere"
              className="rounded-xl border border-ink-line bg-ink/60 px-4 py-3"
            />
            <input
              name="trackingCode"
              defaultValue={order.tracking_code ?? ""}
              placeholder="Tracking"
              className="rounded-xl border border-ink-line bg-ink/60 px-4 py-3"
            />
          </>
        )}
        <button type="submit" className="rounded-full bg-ivory py-3 text-sm font-medium text-ink">
          Aggiorna ordine
        </button>
      </form>
    </div>
  );
}
