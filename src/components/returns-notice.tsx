import Link from "next/link";
import { storeConfig } from "@/lib/store-config";
import { whatsappReturnsHref } from "@/lib/returns";

export function ReturnsNotice({
  fulfillment,
}: {
  fulfillment?: "pickup" | "shipping";
}) {
  const whatsapp = whatsappReturnsHref();
  const shipping = fulfillment !== "pickup";
  const pickup = fulfillment !== "shipping";

  return (
    <aside className="mt-10 rounded-2xl border border-ink-line bg-ink/40 px-5 py-5 text-left text-sm leading-relaxed text-ivory-dim">
      <p className="text-xs uppercase tracking-[0.2em] text-halo">Reso e servizio clienti</p>
      {shipping ? (
        <p className="mt-3">
          Per gli acquisti spediti hai 14 giorni dalla consegna per il recesso. I capi
          devono essere non usati, con etichette. Non spedire nulla prima di averci
          scritto: ti diciamo come procedere. Le spese di reso restano a tuo carico,
          salvo difetto o errore nostro.
        </p>
      ) : null}
      {pickup ? (
        <p className="mt-3">
          Per il ritiro in negozio: se cambi idea prima di passare, chiamaci e
          liberiamo i capi. In negozio puoi provarli prima di pagare.
        </p>
      ) : null}
      <p className="mt-3 text-ivory">
        Assistenza:{" "}
        <a href={storeConfig.support.emailHref} className="text-halo-bright hover:underline">
          {storeConfig.support.email}
        </a>
        {" · "}
        <a href={storeConfig.phone.href} className="text-halo-bright hover:underline">
          {storeConfig.phone.display}
        </a>
        {whatsapp ? (
          <>
            {" · "}
            <a href={whatsapp} className="text-halo-bright hover:underline" target="_blank" rel="noreferrer">
              WhatsApp
            </a>
          </>
        ) : null}
      </p>
      <p className="mt-2">
        <Link href="/termini" className="text-halo-bright underline underline-offset-4">
          Vendite e recesso
        </Link>
      </p>
    </aside>
  );
}
