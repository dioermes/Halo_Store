import { Resend } from "resend";
import { storeConfig } from "@/lib/store-config";
import { formatPrice } from "@/lib/products";
import { orderStatusLabel, type Fulfillment, type OrderStatus } from "@/lib/orders";
import { siteUrl } from "@/lib/stripe";

type OrderEmail = {
  id: string;
  email: string;
  name?: string | null;
  status: OrderStatus;
  fulfillment: Fulfillment;
  totalCents: number;
  shippingCents: number;
  trackingCode?: string | null;
  trackingCarrier?: string | null;
  pickupLabel?: string | null;
  note?: string | null;
  items: Array<{ name: string; size: string; color: string; quantity: number; unitPriceCents: number }>;
};

function fromAddress() {
  return process.env.HALO_FROM_EMAIL || "Halo Store <ordini@halostore-conversano.it>";
}

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

function wrap(title: string, body: string) {
  return `<!doctype html>
<html lang="it">
<body style="margin:0;background:#3F1521;color:#F4F2EE;font-family:Georgia,serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <p style="letter-spacing:.28em;text-transform:uppercase;font-size:11px;color:#A2B29F;">Halo Store · Conversano</p>
    <h1 style="font-weight:400;font-size:32px;margin:16px 0 24px;">${title}</h1>
    ${body}
    <p style="margin-top:40px;font-size:13px;color:#9AA392;">${storeConfig.legalName}<br/>${storeConfig.address.street}, ${storeConfig.address.postalCode} ${storeConfig.address.city}</p>
  </div>
</body>
</html>`;
}

function itemsHtml(order: OrderEmail) {
  const rows = order.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #6B3A45;">${item.name}<br/><span style="color:#9AA392;font-size:13px;">${item.size} · ${item.color} × ${item.quantity}</span></td>
          <td style="padding:8px 0;border-bottom:1px solid #6B3A45;text-align:right;">${formatPrice(item.unitPriceCents / 100)}</td>
        </tr>`,
    )
    .join("");
  return `<table style="width:100%;border-collapse:collapse;">${rows}</table>
    <p style="text-align:right;margin-top:16px;">Totale ${formatPrice(order.totalCents / 100)}</p>`;
}

async function send(to: string, subject: string, html: string) {
  const resend = getResend();
  if (!resend) {
    console.info("[email skipped]", subject, to);
    return;
  }
  if (!to) {
    console.error("[email skipped] missing recipient", subject);
    return;
  }
  try {
    const { error } = await resend.emails.send({ from: fromAddress(), to, subject, html });
    if (error) console.error("[email]", subject, error);
  } catch (error) {
    console.error("[email]", subject, error);
  }
}

export async function sendOrderPaidEmail(order: OrderEmail) {
  const pickup =
    order.fulfillment === "pickup"
      ? `<p>Puoi ritirarlo in negozio in ${storeConfig.address.street}, ${storeConfig.address.city}. Ti avvisiamo quando è pronto.</p>`
      : `<p>Prepariamo la spedizione in Italia. Riceverai il tracking appena parte il pacco.</p>`;
  await send(
    order.email,
    `Ordine confermato · ${storeConfig.name}`,
    wrap(
      "Grazie, è arrivato.",
      `<p>Ciao${order.name ? ` ${order.name}` : ""}, il pagamento è andato a buon fine.</p>${pickup}${itemsHtml(order)}
       <p><a href="${siteUrl()}/account" style="color:#A2B29F;">Vedi l'ordine nel tuo account</a></p>`,
    ),
  );
}

export async function sendPickupReservedEmail(order: OrderEmail) {
  const when = order.pickupLabel
    ? `<p>Ritiro prenotato: <strong>${order.pickupLabel}</strong>.</p>`
    : "";
  await send(
    order.email,
    `Ritiro prenotato · ${storeConfig.name}`,
    wrap(
      "Ti aspettiamo.",
      `<p>Ciao${order.name ? ` ${order.name}` : ""}, abbiamo messo da parte i capi. Paghi in negozio al ritiro, in ${storeConfig.address.street}, ${storeConfig.address.city}.</p>${when}${itemsHtml(order)}
       <p style="text-align:right;margin-top:-8px;color:#A2B29F;">Da pagare in cassa ${formatPrice(order.totalCents / 100)}</p>
       <p><a href="${siteUrl()}/account" style="color:#A2B29F;">Vedi l'ordine nel tuo account</a></p>`,
    ),
  );
}

export async function sendOwnerNewOrderEmail(order: OrderEmail) {
  const owner = process.env.HALO_OWNER_EMAIL;
  if (!owner) return;
  const pickup = order.fulfillment === "pickup";
  await send(
    owner,
    pickup
      ? `Ritiro da incassare ${order.id.slice(0, 8)} · ${formatPrice(order.totalCents / 100)}`
      : `Nuovo ordine ${order.id.slice(0, 8)} · ${formatPrice(order.totalCents / 100)}`,
    wrap(
      pickup ? "Nuovo ritiro da incassare" : "Nuovo ordine pagato",
      `<p>${pickup ? "Ritiro in negozio — paga in cassa" : "Spedizione Italia"} · ${order.email}</p>
       ${order.pickupLabel ? `<p>Quando: ${order.pickupLabel}</p>` : ""}
       ${order.note ? `<p>${order.note}</p>` : ""}
       ${itemsHtml(order)}
       <p><a href="${siteUrl()}/admin/ordini/${order.id}" style="color:#A2B29F;">Apri in amministrazione</a></p>`,
    ),
  );
}

export async function sendOrderStatusEmail(order: OrderEmail) {
  if (order.status === "ready_for_pickup") {
    await send(
      order.email,
      `Il tuo ordine è pronto in negozio · ${storeConfig.name}`,
      wrap(
        "È pronto.",
        `<p>Passa in ${storeConfig.address.street}, ${storeConfig.address.city}. Porta un documento. Paghi in cassa al ritiro.</p>${itemsHtml(order)}
         <p style="text-align:right;margin-top:-8px;color:#A2B29F;">Da pagare in cassa ${formatPrice(order.totalCents / 100)}</p>`,
      ),
    );
    return;
  }
  if (order.status === "shipped") {
    const tracking = order.trackingCode
      ? `<p>Tracking${order.trackingCarrier ? ` ${order.trackingCarrier}` : ""}: <strong>${order.trackingCode}</strong></p>`
      : "";
    await send(
      order.email,
      `Il tuo ordine è partito · ${storeConfig.name}`,
      wrap("Spedito.", `<p>Il pacco è in viaggio.</p>${tracking}${itemsHtml(order)}`),
    );
  }
}

export async function sendPaymentFailedEmail(email: string, name?: string | null) {
  await send(
    email,
    `Pagamento non riuscito · ${storeConfig.name}`,
    wrap(
      "Il pagamento non è andato a buon fine",
      `<p>Ciao${name ? ` ${name}` : ""}, le scorte sono di nuovo disponibili. Puoi riprovare dalla cassa quando vuoi.</p>
       <p><a href="${siteUrl()}/checkout" style="color:#A2B29F;">Torna alla cassa</a></p>`,
    ),
  );
}

export async function sendMarketingEmail(to: string, subject: string, htmlBody: string, unsubUrl: string) {
  await send(
    to,
    subject,
    wrap(subject, `${htmlBody}<p style="font-size:12px;color:#9AA392;margin-top:32px;">Ricevi questa mail perché hai chiesto le novità di Halo Store. <a href="${unsubUrl}" style="color:#A2B29F;">Disiscriviti</a></p>`),
  );
}

export function statusMailNeeded(status: OrderStatus) {
  return status === "ready_for_pickup" || status === "shipped" || status === "paid";
}

export { orderStatusLabel };
