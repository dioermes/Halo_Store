import { storeConfig } from "@/lib/store-config";

export function whatsappReturnsHref() {
  if (!storeConfig.whatsapp.isConfigured) return null;
  const text = encodeURIComponent(
    "Ciao Halo Store, vorrei assistenza per un reso / cambio. Numero ordine: ",
  );
  return `https://wa.me/${storeConfig.whatsapp.number}?text=${text}`;
}

export function returnsEmailHtml(fulfillment?: "pickup" | "shipping") {
  const phone = storeConfig.phone.display;
  const email = storeConfig.support.email;
  const shipping =
    fulfillment !== "pickup"
      ? `<p>Per gli acquisti spediti hai 14 giorni dalla consegna per il recesso. I capi devono essere non usati, con etichette. Non spedire nulla prima di averci scritto: ti confermiamo come procedere e l'indirizzo del reso. Le spese di spedizione del reso restano a tuo carico, salvo difetto o errore nostro.</p>`
      : "";
  const pickup =
    fulfillment !== "shipping"
      ? `<p>Per il ritiro in negozio: se cambi idea prima di passare, chiamaci e liberiamo i capi. In negozio puoi provarli prima di pagare.</p>`
      : "";
  return `<div style="margin-top:28px;padding-top:22px;border-top:1px solid #8A6A72;">
    <p style="margin:0 0 12px;font-family:ui-sans-serif,system-ui,sans-serif;letter-spacing:.2em;text-transform:uppercase;font-size:11px;color:#5C2432;">Reso e servizio clienti</p>
    ${shipping}${pickup}
    <p style="margin:12px 0 0;">Scrivi a <a href="${storeConfig.support.emailHref}" style="color:#5C2432;text-decoration:none;">${email}</a> oppure chiama / WhatsApp <a href="${storeConfig.phone.href}" style="color:#5C2432;text-decoration:none;">${phone}</a>. Indica il numero ordine e cosa vuoi rendere o cambiare.</p>
  </div>`;
}
