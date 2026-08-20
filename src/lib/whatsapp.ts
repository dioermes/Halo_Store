import { formatPrice, getProduct } from "@/lib/products";
import { storeConfig } from "@/lib/store-config";
import type { ReservationItem } from "@/components/reservation-provider";

export type ReservationDetails = {
  name: string;
  phone: string;
  day: string;
  note: string;
};

export function buildReservationMessage(
  items: ReservationItem[],
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
