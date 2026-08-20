import { formatPrice, getProduct } from "@/lib/products";
import { storeConfig } from "@/lib/store-config";
import type { CartItem } from "@/components/reservation-provider";

export type ReservationDetails = {
  name: string;
  phone: string;
  day: string;
  note: string;
};

export function buildReservationMessage(
  items: CartItem[],
  details: ReservationDetails,
) {
  const lines: string[] = [
    `Ciao ${storeConfig.name}! Vorrei mettere da parte questi capi:`,
    "",
  ];

  let total = 0;

  for (const item of items) {
    const product = getProduct(item.productId);
    if (!product) continue;
    total += product.price;

    const parts = [`${product.name} (${product.subtitle})`, `taglia ${item.size}`];
    if (item.color) parts.push(item.color);
    lines.push(`• ${parts.join(" · ")} — ${formatPrice(product.price)}`);
  }

  lines.push("", `Totale indicativo: ${formatPrice(total)}`, "");
  lines.push(`Nome: ${details.name}`);
  if (details.phone.trim()) lines.push(`Telefono: ${details.phone.trim()}`);
  if (details.day) lines.push(`Passo in negozio: ${details.day}`);
  if (details.note.trim()) lines.push(`Note: ${details.note.trim()}`);
  lines.push("", "Grazie!");

  return lines.join("\n");
}

export function buildWhatsappUrl(message: string) {
  return `https://wa.me/${storeConfig.whatsapp.number}?text=${encodeURIComponent(message)}`;
}

export function notifyOwnerNewOrder(order: {
  id: string;
  total_cents: number;
  fulfillment: string;
  customer_note?: string | null;
  halo_customers: { email: string; full_name: string | null } | null;
  halo_order_items: Array<{ product_name: string; size: string; color: string; quantity: number }>;
}) {
  const payInStore = order.fulfillment === "pickup";
  const lines = [
    payInStore
      ? `Nuovo ritiro Halo Store (${order.id.slice(0, 8)}) — da incassare in negozio`
      : `Nuovo ordine Halo Store (${order.id.slice(0, 8)})`,
    payInStore ? "Ritiro in negozio" : "Spedizione Italia",
    `${order.halo_customers?.full_name ?? ""} ${order.halo_customers?.email ?? ""}`.trim(),
    ...order.halo_order_items.map(
      (item) => `• ${item.product_name} · ${item.size} · ${item.color} × ${item.quantity}`,
    ),
    payInStore
      ? `Da pagare in cassa ${formatPrice(order.total_cents / 100)}`
      : `Totale ${formatPrice(order.total_cents / 100)}`,
  ];
  if (order.customer_note) lines.push(order.customer_note);
  const message = lines.join("\n");
  if (storeConfig.whatsapp.isConfigured) {
    console.info("[owner-whatsapp]", buildWhatsappUrl(message));
  }
}
