import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";
import { ensureCustomer } from "@/lib/auth";
import { formatPrice } from "@/lib/products";
import { orderStatusLabel, type OrderStatus } from "@/lib/orders";
import { fullAddress, storeConfig } from "@/lib/store-config";
import { ReturnsNotice } from "@/components/returns-notice";

type OrderItem = {
  id: string;
  product_name: string;
  size: string;
  color: string;
  quantity: number;
  unit_price_cents: number;
  image_url: string | null;
};

const statusCopy: Partial<Record<OrderStatus, string>> = {
  paid: "Il pagamento è arrivato. Stiamo preparando i capi.",
  preparing: "Stiamo preparando il tuo ordine.",
  ready_for_pickup: "I capi sono pronti in negozio. Puoi venire a ritirarli.",
  shipped: "Il pacco è partito.",
  completed: "Questo ordine è chiuso.",
  cancelled: "Questo ordine è stato annullato.",
  refunded: "È stato fatto un rimborso.",
  pending_payment: "In attesa del pagamento.",
};

export default async function CustomerOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await currentUser();
  if (!user) redirect("/sign-in");
  const { id } = await params;
  const customer = await ensureCustomer(user);
  const admin = createAdminClient();
  const { data: order } = await admin
    .from("halo_orders")
    .select("*, halo_order_items(*)")
    .eq("id", id)
    .eq("customer_id", customer.id)
    .neq("status", "pending_payment")
    .maybeSingle();
  if (!order) notFound();

  const status = order.status as OrderStatus;
  const items = (order.halo_order_items ?? []) as OrderItem[];
  const pickupUnpaid =
    order.fulfillment === "pickup" && status !== "completed" && status !== "cancelled";

  return (
    <section className="mx-auto max-w-2xl px-5 py-24">
      <Link
        href="/account"
        className="text-sm text-ivory-dim transition-colors hover:text-halo-bright"
      >
        ← Torna agli ordini
      </Link>

      <p className="mt-8 text-xs uppercase tracking-[0.34em] text-halo">Il tuo ordine</p>
      <h1 className="mt-4 font-display text-5xl">#{order.id.slice(0, 8)}</h1>
      <p className="mt-3 text-ivory-dim">
        {order.fulfillment === "pickup" ? "Ritiro in negozio" : "Spedizione"} ·{" "}
        {orderStatusLabel[status]}
      </p>
      {statusCopy[status] ? (
        <p className="mt-3 text-sm leading-relaxed text-ivory">{statusCopy[status]}</p>
      ) : null}

      <ul className="mt-10 divide-y divide-ink-line border-y border-ink-line">
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

      <p className="mt-5 font-display text-3xl text-halo-bright">
        {formatPrice(order.total_cents / 100)}
      </p>
      {pickupUnpaid ? (
        <p className="mt-1 text-sm text-ivory-dim">Da pagare in cassa al ritiro.</p>
      ) : null}

      {order.fulfillment === "pickup" ? (
        <div className="mt-8 text-sm leading-relaxed text-ivory-dim">
          <p className="text-xs uppercase tracking-[0.2em]">Ritiro</p>
          <p className="mt-2 text-ivory">{order.shipping_name}</p>
          {order.shipping_phone ? <p>{order.shipping_phone}</p> : null}
          <p className="mt-3">{fullAddress}</p>
          <a
            href={storeConfig.phone.href}
            className="mt-2 inline-block text-halo-bright hover:underline"
          >
            {storeConfig.phone.display}
          </a>
        </div>
      ) : (
        <div className="mt-8 text-sm leading-relaxed text-ivory-dim">
          <p className="text-xs uppercase tracking-[0.2em]">Spedizione</p>
          {order.shipping_name &&
          order.shipping_name.trim().toLowerCase() !== String(order.shipping_line1 ?? "").trim().toLowerCase() ? (
            <p className="mt-2 text-ivory">{order.shipping_name}</p>
          ) : null}
          {order.shipping_line1 ? (
            <p className={order.shipping_name ? "mt-1" : "mt-2"}>
              {order.shipping_line1}, {order.shipping_postal_code} {order.shipping_city}
            </p>
          ) : order.shipping_name ? (
            <p className="mt-2 text-ivory">{order.shipping_name}</p>
          ) : null}
          {order.tracking_code ? (
            <p className="mt-3 text-ivory">
              Tracking
              {order.tracking_carrier ? ` ${order.tracking_carrier}` : ""}: {order.tracking_code}
            </p>
          ) : (
            <p className="mt-3">Il tracking comparirà qui quando il pacco parte.</p>
          )}
        </div>
      )}

      {order.customer_note ? (
        <p className="mt-6 whitespace-pre-line text-sm text-ivory">{order.customer_note}</p>
      ) : null}

      {status !== "cancelled" && status !== "refunded" ? (
        <ReturnsNotice fulfillment={order.fulfillment === "pickup" ? "pickup" : "shipping"} />
      ) : null}
    </section>
  );
}
