import { storeConfig } from "@/lib/store-config";
import { whatsappReturnsHref } from "@/lib/returns";

export default function TermsPage() {
  const whatsapp = whatsappReturnsHref();

  return (
    <article className="mx-auto max-w-2xl px-5 py-24 leading-relaxed text-ivory-dim">
      <h1 className="font-display text-5xl text-ivory">Vendite e recesso</h1>
      <p className="mt-6">
        {storeConfig.legalName}, {storeConfig.address.street}, {storeConfig.address.postalCode}{" "}
        {storeConfig.address.city}.
      </p>

      <h2 className="mt-10 font-display text-3xl text-ivory">Spedizione</h2>
      <p className="mt-4">
        Per gli acquisti online con consegna a domicilio hai 14 giorni dalla
        ricezione del pacco per recedere, nei limiti di legge (capi indossati o
        usati, motivi di igiene, personalizzazioni). I capi vanno restituiti non
        usati, con etichette e nella confezione originale se possibile.
      </p>
      <p className="mt-4">
        Non spedire il reso in autonomia. Prima scrivi o chiama il servizio
        clienti: ti confermiamo se il recesso è possibile, come imballare e
        l&apos;indirizzo a cui spedire. Le spese di reso sono a tuo carico, salvo
        difetto o errore nostro. Il rimborso parte dopo il controllo del capo.
      </p>

      <h2 className="mt-10 font-display text-3xl text-ivory">Ritiro in negozio</h2>
      <p className="mt-4">
        I capi si prenotano sul sito e si pagano in cassa al ritiro, in{" "}
        {storeConfig.address.street}, {storeConfig.address.city}. Puoi provarli in
        negozio prima di pagare. Se non puoi passare o cambi idea prima del
        ritiro, avvisaci: togliamo la prenotazione.
      </p>

      <h2 className="mt-10 font-display text-3xl text-ivory">Servizio clienti</h2>
      <p className="mt-4">
        Per reso, cambio o un problema sull&apos;ordine indica il numero ordine
        (lo trovi in email e nel tuo account).
      </p>
      <p className="mt-4">
        Email:{" "}
        <a href={storeConfig.support.emailHref} className="text-halo-bright hover:underline">
          {storeConfig.support.email}
        </a>
      </p>
      <p className="mt-2">
        Telefono:{" "}
        <a href={storeConfig.phone.href} className="text-halo-bright hover:underline">
          {storeConfig.phone.display}
        </a>
      </p>
      {whatsapp ? (
        <p className="mt-2">
          WhatsApp:{" "}
          <a href={whatsapp} className="text-halo-bright hover:underline" target="_blank" rel="noreferrer">
            {storeConfig.phone.display}
          </a>
        </p>
      ) : null}
    </article>
  );
}
