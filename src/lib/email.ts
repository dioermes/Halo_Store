import { Resend } from "resend";
import { storeConfig } from "@/lib/store-config";
import { formatPrice } from "@/lib/products";
import { orderStatusLabel, type Fulfillment, type OrderStatus } from "@/lib/orders";
import { siteUrl } from "@/lib/stripe";
import { returnsEmailHtml } from "@/lib/returns";
import { esc, firstName, haloEmail, orderCode, shortOrderId } from "@/lib/email-layout";
import { unsubscribeUrl } from "@/lib/unsubscribe";

export type OrderEmail = {
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

function extractEmail(raw: string) {
  const match = raw.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match?.[0] ?? null;
}

function fromAddress() {
  const email = extractEmail(process.env.HALO_FROM_EMAIL ?? "");
  if (email && !/@(gmail|googlemail)\.com$/i.test(email)) {
    return `Halo Store <${email}>`;
  }
  return "Halo Store <beth.t@example.com>";
}

function mailboxOf(address: string) {
  return extractEmail(address) ?? address;
}

function getResend() {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  return new Resend(key);
}

export type SendEmailResult = { ok: true } | { ok: false; reason: string };

async function send(to: string, subject: string, html: string): Promise<SendEmailResult> {
  const resend = getResend();
  if (!resend) {
    console.error("[email skipped] RESEND_API_KEY mancante", subject, to);
    return {
      ok: false,
      reason: "Manca RESEND_API_KEY. Senza quella chiave le mail non partono.",
    };
  }
  if (!to) {
    console.error("[email skipped] missing recipient", subject);
    return { ok: false, reason: "Destinatario mancante." };
  }
  try {
    const from = fromAddress();
    const { data, error } = await resend.emails.send({
      from,
      to,
      replyTo: mailboxOf(from),
      subject,
      html,
    });
    if (error) {
      const reason = "message" in error && error.message ? String(error.message) : JSON.stringify(error);
      console.error("[email]", subject, { from, to, error });
      return { ok: false, reason };
    }
    console.info("[email sent]", subject, to, data?.id ?? "");
    return { ok: true };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Invio mail non riuscito.";
    console.error("[email]", subject, error);
    return { ok: false, reason };
  }
}

function hello(name?: string | null) {
  const first = firstName(name);
  return first ? `Ciao ${first},` : "Ciao,";
}

function orderRef(order: OrderEmail) {
  return `<p style="margin:0 0 18px;font-family:ui-sans-serif,system-ui,sans-serif;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#5C2432;">Ordine ${shortOrderId(order.id)}</p>`;
}

function itemsHtml(order: OrderEmail) {
  const rows = order.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:12px 0;border-bottom:1px solid #8A6A72;font-family:Georgia,serif;">
            ${esc(item.name)}<br/>
            <span style="color:#6B3A45;font-size:13px;font-family:ui-sans-serif,system-ui,sans-serif;">${esc(item.size)} · ${esc(item.color)} × ${item.quantity}</span>
          </td>
          <td style="padding:12px 0;border-bottom:1px solid #8A6A72;text-align:right;white-space:nowrap;font-family:Georgia,serif;">${formatPrice(item.unitPriceCents / 100)}</td>
        </tr>`,
    )
    .join("");
  const shipping =
    order.shippingCents > 0
      ? `<tr>
          <td style="padding:12px 0;color:#6B3A45;font-family:ui-sans-serif,system-ui,sans-serif;font-size:14px;">Spedizione</td>
          <td style="padding:12px 0;text-align:right;font-family:Georgia,serif;">${formatPrice(order.shippingCents / 100)}</td>
        </tr>`
      : "";
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0 8px;border-collapse:collapse;">
    ${rows}${shipping}
    <tr>
      <td style="padding:16px 0 4px;font-family:ui-sans-serif,system-ui,sans-serif;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#6B3A45;">Totale</td>
      <td style="padding:16px 0 4px;text-align:right;font-family:Georgia,serif;font-size:22px;">${formatPrice(order.totalCents / 100)}</td>
    </tr>
  </table>`;
}

function accountOrderUrl(id: string) {
  return `${siteUrl()}/account/ordini/${id}`;
}

function adminOrderUrl(id: string) {
  return `${siteUrl()}/admin/ordini/${id}`;
}

export async function sendOrderPaidEmail(order: OrderEmail) {
  const pickup = order.fulfillment === "pickup";
  await send(
    order.email,
    `Ordine confermato · ${storeConfig.name}`,
    haloEmail({
      preheader: pickup
        ? "Pagamento ricevuto. Ti avvisiamo quando i capi sono pronti in negozio."
        : "Pagamento ricevuto. Prepariamo la spedizione in Italia.",
      title: "Grazie, abbiamo ricevuto il pagamento.",
      body: `${orderRef(order)}<p style="margin:0 0 14px;">${hello(order.name)} il pagamento è andato a buon fine.</p>
        <p style="margin:0;">${
          pickup
            ? `Puoi ritirare i capi in ${esc(storeConfig.address.street)}, ${esc(storeConfig.address.city)}. Ti scriviamo quando sono pronti.`
            : "Prepariamo la spedizione in Italia. Riceverai il tracking appena parte il pacco."
        }</p>${itemsHtml(order)}`,
      cta: { href: accountOrderUrl(order.id), label: "Vedi l'ordine" },
      extra: returnsEmailHtml(order.fulfillment),
    }),
  );
}

export async function sendPickupReservedEmail(order: OrderEmail) {
  const when = order.pickupLabel
    ? `<p style="margin:14px 0 0;">Ritiro prenotato: <strong>${esc(order.pickupLabel)}</strong>.</p>`
    : "";
  await send(
    order.email,
    `Ritiro prenotato · ${storeConfig.name}`,
    haloEmail({
      preheader: "Abbiamo messo da parte i capi. Paghi in negozio al ritiro.",
      title: "Ti aspettiamo.",
      body: `${orderRef(order)}<p style="margin:0;">${hello(order.name)} abbiamo messo da parte i capi. Paghi in cassa al ritiro, in ${esc(storeConfig.address.street)}, ${esc(storeConfig.address.city)}.</p>${when}${itemsHtml(order)}
        <p style="margin:8px 0 0;font-family:Georgia,serif;font-size:18px;">Da pagare in cassa ${formatPrice(order.totalCents / 100)}</p>`,
      cta: { href: accountOrderUrl(order.id), label: "Vedi l'ordine" },
      extra: returnsEmailHtml("pickup"),
    }),
  );
}

export async function sendOwnerNewOrderEmail(order: OrderEmail) {
  const owner = process.env.HALO_OWNER_EMAIL;
  if (!owner) return;
  const pickup = order.fulfillment === "pickup";
  await send(
    owner,
    pickup
      ? `Ritiro da incassare ${orderCode(order.id)} · ${formatPrice(order.totalCents / 100)}`
      : `Nuovo ordine ${orderCode(order.id)} · ${formatPrice(order.totalCents / 100)}`,
    haloEmail({
      audience: "owner",
      preheader: `${pickup ? "Ritiro in negozio" : "Spedizione"} · ${order.email}`,
      title: pickup ? "Nuovo ritiro da incassare" : "Nuovo ordine pagato",
      body: `${orderRef(order)}
        <p style="margin:0 0 10px;">${pickup ? "Ritiro in negozio — paga in cassa." : "Spedizione in Italia — già pagato."}</p>
        <p style="margin:0 0 10px;">Cliente: ${esc(order.name || "—")}<br/>${esc(order.email)}</p>
        ${order.pickupLabel ? `<p style="margin:0 0 10px;">Quando: ${esc(order.pickupLabel)}</p>` : ""}
        ${order.note ? `<p style="margin:0 0 10px;">Nota: ${esc(order.note)}</p>` : ""}
        ${itemsHtml(order)}`,
      cta: { href: adminOrderUrl(order.id), label: "Apri in amministrazione" },
    }),
  );
}

export async function sendOrderStatusEmail(order: OrderEmail): Promise<SendEmailResult> {
  const ref = orderRef(order);
  const items = itemsHtml(order);
  const account = { href: accountOrderUrl(order.id), label: "Vedi l'ordine" };

  if (order.status === "preparing") {
    return send(
      order.email,
      `Il tuo ordine è in preparazione · ${storeConfig.name}`,
      haloEmail({
        preheader:
          order.fulfillment === "pickup"
            ? "Stiamo preparando i capi per il ritiro."
            : "Stiamo preparando il pacco.",
        title: "Lo stiamo preparando.",
        body: `${ref}<p style="margin:0;">${hello(order.name)} ${
          order.fulfillment === "pickup"
            ? "stiamo preparando i capi per il ritiro in negozio. Ti avvisiamo appena sono pronti."
            : "stiamo preparando il pacco. Ti mandiamo il tracking appena parte."
        }</p>${items}`,
        cta: account,
      }),
    );
  }

  if (order.status === "ready_for_pickup") {
    return send(
      order.email,
      `Il tuo ordine è pronto in negozio · ${storeConfig.name}`,
      haloEmail({
        preheader: `Passa in ${storeConfig.address.street}. Porta un documento.`,
        title: "È pronto.",
        body: `${ref}<p style="margin:0;">Passa in ${esc(storeConfig.address.street)}, ${esc(storeConfig.address.city)}. Porta un documento. Paghi in cassa al ritiro.</p>${items}
          <p style="margin:8px 0 0;font-family:Georgia,serif;font-size:18px;">Da pagare in cassa ${formatPrice(order.totalCents / 100)}</p>`,
        cta: account,
      }),
    );
  }

  if (order.status === "shipped") {
    const tracking = order.trackingCode
      ? `<p style="margin:14px 0 0;">Tracking${order.trackingCarrier ? ` ${esc(order.trackingCarrier)}` : ""}: <strong>${esc(order.trackingCode)}</strong></p>`
      : "";
    return send(
      order.email,
      `Il tuo ordine è partito · ${storeConfig.name}`,
      haloEmail({
        preheader: order.trackingCode
          ? `Tracking ${order.trackingCode}`
          : "Il pacco è in viaggio.",
        title: "Spedito.",
        body: `${ref}<p style="margin:0;">${hello(order.name)} il pacco è in viaggio verso di te.</p>${tracking}${items}`,
        cta: account,
        extra: returnsEmailHtml("shipping"),
      }),
    );
  }

  if (order.status === "completed") {
    return send(
      order.email,
      `Grazie da ${storeConfig.name}`,
      haloEmail({
        preheader: "Il tuo ordine è chiuso. Se serve un cambio, scrivici.",
        title: "Grazie.",
        body: `${ref}<p style="margin:0;">${hello(order.name)} ${
          order.fulfillment === "pickup"
            ? "grazie per essere passato in negozio."
            : "il tuo ordine è chiuso."
        } Se un capo non va, scrivici: ti diciamo come procedere.</p>${items}`,
        cta: account,
        extra: returnsEmailHtml(order.fulfillment),
      }),
    );
  }

  if (order.status === "cancelled") {
    return send(
      order.email,
      `Ordine annullato · ${storeConfig.name}`,
      haloEmail({
        preheader: "L'ordine è stato annullato.",
        title: "Ordine annullato.",
        body: `${ref}<p style="margin:0;">${hello(order.name)} questo ordine non è più attivo. Se hai già pagato, ti aggiorniamo sul rimborso. Per domande: ${esc(storeConfig.support.email)}.</p>${items}`,
        cta: account,
      }),
    );
  }

  if (order.status === "refunded") {
    return send(
      order.email,
      `Rimborso registrato · ${storeConfig.name}`,
      haloEmail({
        preheader: "Il rimborso è stato registrato.",
        title: "Rimborso in corso.",
        body: `${ref}<p style="margin:0;">${hello(order.name)} abbiamo registrato il rimborso. I tempi dipendono dalla tua banca o dal metodo di pagamento.</p>${items}`,
        cta: account,
      }),
    );
  }

  return { ok: true };
}

export async function sendPaymentFailedEmail(email: string, name?: string | null) {
  await send(
    email,
    `Pagamento non riuscito · ${storeConfig.name}`,
    haloEmail({
      preheader: "Il pagamento non è andato a buon fine. Puoi riprovare dalla cassa.",
      title: "Il pagamento non è andato a buon fine.",
      body: `<p style="margin:0;">${hello(name)} le scorte sono di nuovo disponibili. Puoi riprovare dalla cassa quando vuoi.</p>`,
      cta: { href: `${siteUrl()}/checkout`, label: "Torna alla cassa" },
    }),
  );
}

export async function sendWelcomeEmail(email: string, name?: string | null) {
  await send(
    email,
    `Benvenuto in ${storeConfig.name}`,
    haloEmail({
      preheader: "Account creato. Da qui vedi gli ordini, il ritiro e le novità.",
      title: "Benvenuto.",
      body: `<p style="margin:0 0 14px;">${hello(name)} il tuo account è pronto.</p>
        <p style="margin:0;">Da qui vedi gli ordini e scegli ritiro o spedizione. Per le offerte del negozio, iscriviti alla newsletter dal popup in vetrina: è un consenso a parte, e arriva un codice sconto da usare una volta.</p>`,
      cta: { href: `${siteUrl()}/account`, label: "Vai al tuo account" },
    }),
  );
}

function promoUnsub(email: string) {
  return `<p style="margin-top:28px;font-family:ui-sans-serif,system-ui,sans-serif;font-size:12px;color:#6B3A45;">Ricevi questa mail perché ti sei iscritto alla newsletter di Halo Store. <a href="${esc(unsubscribeUrl(email))}" style="color:#5C2432;">Disiscriviti</a></p>`;
}

export async function sendNewsletterWelcomeEmail(opts: {
  email: string;
  code: string;
  percent: number;
  birthdayPercent: number;
  birthdayCode: string;
}): Promise<SendEmailResult> {
  return send(
    opts.email,
    `Il tuo codice ${opts.code} · ${storeConfig.name}`,
    haloEmail({
      preheader: `Iscrizione confermata. Codice ${opts.code}: ${opts.percent}% una volta sola.`,
      title: "Sei dei nostri.",
      body: `<p style="margin:0 0 14px;">Grazie per esserti iscritto alla newsletter di Halo Store.</p>
        <p style="margin:0 0 18px;">Ecco il codice da usare in cassa, una volta sola, su un ordine:</p>
        <p style="margin:0 0 8px;font-family:ui-sans-serif,system-ui,sans-serif;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#5C2432;">Codice benvenuto</p>
        <p style="margin:0 0 18px;font-family:Georgia,serif;font-size:32px;letter-spacing:.08em;">${esc(opts.code)}</p>
        <p style="margin:0 0 14px;">Sconto <strong>${opts.percent}%</strong> sul subtotale dei capi. Lo stesso codice vale per tutti gli iscritti, ma ciascuno lo può usare una volta.</p>
        <p style="margin:0;">Il giorno del compleanno ti scriviamo di nuovo: codice <strong>${esc(opts.birthdayCode)}</strong>, ${opts.birthdayPercent}% una volta sola, nei giorni intorno alla data che ci hai lasciato.</p>`,
      cta: { href: `${siteUrl()}/catalogo`, label: "Vai al catalogo" },
      extra: promoUnsub(opts.email),
    }),
  );
}

export async function sendBirthdayPromoEmail(opts: {
  email: string;
  code: string;
  percent: number;
  validDays: number;
}): Promise<SendEmailResult> {
  return send(
    opts.email,
    `Buon compleanno · codice ${opts.code}`,
    haloEmail({
      preheader: `Un ${opts.percent}% da usare una volta, valido ${opts.validDays} giorni.`,
      title: "Buon compleanno.",
      body: `<p style="margin:0 0 14px;">Da Halo Store, un capo in più per il tuo giorno.</p>
        <p style="margin:0 0 18px;">Questo codice vale ${opts.percent}% sul subtotale, una volta sola, per ${opts.validDays} giorni dal compleanno:</p>
        <p style="margin:0 0 8px;font-family:ui-sans-serif,system-ui,sans-serif;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#5C2432;">Codice compleanno</p>
        <p style="margin:0 0 18px;font-family:Georgia,serif;font-size:32px;letter-spacing:.08em;">${esc(opts.code)}</p>
        <p style="margin:0;">Inseriscilo in cassa, in ritiro o in spedizione. Non si somma al codice di benvenuto: uno per ordine.</p>`,
      cta: { href: `${siteUrl()}/catalogo`, label: "Scegli un capo" },
      extra: promoUnsub(opts.email),
    }),
  );
}

export async function sendMarketingEmail(to: string, subject: string, htmlBody: string, unsubUrl: string) {
  await send(
    to,
    subject,
    haloEmail({
      eyebrow: "Novità · Halo Store",
      preheader: subject,
      title: subject,
      body: htmlBody,
      extra: `<p style="margin-top:28px;font-family:ui-sans-serif,system-ui,sans-serif;font-size:12px;color:#6B3A45;">Ricevi questa mail perché hai chiesto le novità di Halo Store. <a href="${esc(unsubUrl)}" style="color:#5C2432;">Disiscriviti</a></p>`,
    }),
  );
}

export function statusMailNeeded(status: OrderStatus) {
  return (
    status === "preparing" ||
    status === "ready_for_pickup" ||
    status === "shipped" ||
    status === "completed" ||
    status === "cancelled" ||
    status === "refunded" ||
    status === "paid"
  );
}

export { orderStatusLabel };
