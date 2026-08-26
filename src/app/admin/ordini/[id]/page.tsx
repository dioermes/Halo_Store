import Image from "next/image";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase";
import { formatPrice } from "@/lib/products";
import { nextStatuses, orderStatusLabel, type Fulfillment, type OrderStatus } from "@/lib/orders";
import { updateOrderAction } from "@/app/admin/actions";
import { OrderStatusSelect } from "@/components/order-status-select";
import { OrderUpdatedNotice, UpdateOrderButton } from "@/components/update-order-feedback";
import { markAdminOrderSeen } from "@/lib/admin-orders";
import { isPacklinkLive, isCustomerTrackingCode } from "@/lib/packlink";
import { applyTrackingToOrder, loadPacklinkState } from "@/lib/packlink-store";
import { syncPacklinkOrder } from "@/lib/packlink-order-sync";
import { PacklinkShipPanel } from "@/components/packlink-ship-panel";

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
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; stato?: string; mail?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const admin = createAdminClient();
  const { data: loaded } = await admin
    .from("halo_orders")
    .select("*, halo_customers(*), halo_order_items(*)")
    .eq("id", id)
    .maybeSingle();
  if (!loaded) notFound();
  let order = loaded;

  await markAdminOrderSeen(order.id);
  let packlink = order.fulfillment === "shipping" ? await loadPacklinkState(order.id) : null;
  if (packlink?.reference && order.fulfillment === "shipping") {
    await syncPacklinkOrder(order.id);
    const { data: refreshed } = await admin
      .from("halo_orders")
      .select("*, halo_customers(*), halo_order_items(*)")
      .eq("id", id)
      .maybeSingle();
    if (refreshed) order = refreshed;
    packlink = await loadPacklinkState(order.id);
  }
  if (
    packlink &&
    order.tracking_code &&
    !isCustomerTrackingCode(String(order.tracking_code), packlink.reference)
  ) {
    await applyTrackingToOrder(order.id, packlink.carrierName, [], packlink.reference);
    order.tracking_code = null;
  }

  const options = nextStatuses(order.status as OrderStatus, order.fulfillment as Fulfillment);
  const items = (order.halo_order_items ?? []) as OrderItem[];
  const showTracking =
    order.fulfillment === "shipping" &&
    (order.status === "shipped" || order.status === "completed");

  return (
    <div className="max-w-2xl">
      {query.ok === "1" && query.stato ? (
        <OrderUpdatedNotice
          status={query.stato as OrderStatus}
          mailed={query.mail === "1"}
          mailFailed={query.mail === "0"}
        />
      ) : null}

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

      {order.fulfillment === "shipping" &&
      order.status !== "cancelled" &&
      order.status !== "refunded" &&
      order.status !== "pending_payment" ? (
        <PacklinkShipPanel
          orderId={order.id}
          toZip={order.shipping_postal_code ?? ""}
          toCity={order.shipping_city ?? ""}
          configured={isPacklinkLive()}
          initial={packlink}
        />
      ) : null}

      <form action={updateOrderAction} className="mt-10 grid gap-3">
        <input type="hidden" name="id" value={order.id} />
        <OrderStatusSelect current={order.status as OrderStatus} options={options} />
        {order.fulfillment === "shipping" ? (
          <p className="text-xs text-ivory-dim">
            Packlink aggiorna da solo gli stati: etichetta → in preparazione, pacco in viaggio →
            spedito (con corriere e tracking), consegnato → completato. Puoi ancora cambiarli a
            mano se serve.
          </p>
        ) : null}
        {showTracking && (
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
            <p className="text-xs text-ivory-dim">
              Corriere e tracking arrivano da Packlink dopo la scansione del corriere. Puoi
              correggerli se manca qualcosa: la mail di spedizione li include.
            </p>
          </>
        )}
        <UpdateOrderButton />
      </form>
    </div>
  );
}
