import Link from "next/link";
import { CookieSettingsButton } from "@/components/cookie-banner";
import { storeConfig } from "@/lib/store-config";

export const metadata = {
  title: "Cookie",
  description: "Quali cookie e tracciatori usa Halo Store e come sceglierli.",
};

export default function CookiePage() {
  return (
    <article className="mx-auto max-w-2xl px-5 py-24 leading-relaxed text-ivory-dim">
      <h1 className="font-display text-5xl text-ivory">Cookie</h1>
      <p className="mt-3 text-sm">Ultimo aggiornamento: 31 agosto 2026</p>
      <p className="mt-6">
        Titolare: {storeConfig.legalName}. Questa pagina elenca i cookie e i tracciatori
        usati su halostore.it, in linea con il GDPR e le indicazioni del Garante Privacy.
      </p>

      <h2 className="mt-10 font-display text-3xl text-ivory">Come scegli</h2>
      <p className="mt-4">
        Al primo ingresso compare il banner. «Accetta» abilita la mappa Google
        incorporata. «Solo necessari» lascia attivi solo i cookie tecnici. I caratteri
        dei titoli sono sul sito e non dipendono da questa scelta. Puoi cambiare in
        qualsiasi momento:{" "}
        <CookieSettingsButton className="text-halo-bright underline underline-offset-4" />.
      </p>
      <p className="mt-4">
        Accettare i cookie non iscrive alla newsletter: quello è il popup, con un
        consenso a parte. Informativa:{" "}
        <Link href="/privacy" className="text-halo-bright underline underline-offset-4">
          Privacy
        </Link>
        .
      </p>

      <h2 className="mt-10 font-display text-3xl text-ivory">Cookie tecnici (sempre attivi)</h2>
      <p className="mt-4">
        Servono al sito: senza di essi non funzionano carrello, accesso e pagamento.
        Non richiedono consenso (art. 122 Codice Privacy, cookie strettamente necessari).
      </p>
      <ul className="mt-4 list-disc space-y-3 pl-5">
        <li>
          <strong className="text-ivory">Scelta cookie</strong> —{" "}
          <code>halo_cookie_consent</code> e memoria locale <code>halo-cookie-consent-v3</code>.
          Durata 12 mesi. Ricorda Accetta / Solo necessari.
        </li>
        <li>
          <strong className="text-ivory">Carrello</strong> — memoria locale del browser.
          Tiene i capi scelti su questo dispositivo.
        </li>
        <li>
          <strong className="text-ivory">Newsletter (solo «già visto»)</strong> — memoria
          locale, per non rimostrare il popup. Non è un tracciatore pubblicitario.
        </li>
        <li>
          <strong className="text-ivory">Account (Clerk)</strong> — cookie di sessione e
          sicurezza per entrare e restare collegato. Durata: sessione o secondo le
          impostazioni di Clerk.
        </li>
        <li>
          <strong className="text-ivory">Pagamento (Stripe)</strong> — solo quando paghi
          la spedizione, per completare il checkout. Necessari all&apos;esecuzione del
          contratto.
        </li>
      </ul>

      <h2 className="mt-10 font-display text-3xl text-ivory">Contenuti di terzi (solo col consenso)</h2>
      <p className="mt-4">
        Restano bloccati finché non clicchi Accetta, «Carica la mappa» o non li
        riattivi da Gestisci cookie. Se scegli Solo necessari non partono.
      </p>
      <ul className="mt-4 list-disc space-y-3 pl-5">
        <li>
          <strong className="text-ivory">Google Maps</strong> — iframe della mappa in
          «Dove siamo». Google (terza parte) può impostare cookie e ricevere il tuo
          IP. In alternativa: link «Apri su Google Maps» (esci dal sito).
        </li>
      </ul>
      <p className="mt-4">
        Non installiamo Google Analytics, Meta Pixel, YouTube incorporati né altri
        strumenti di statistica o pubblicità.
      </p>

      <h2 className="mt-10 font-display text-3xl text-ivory">Come revocare</h2>
      <p className="mt-4">
        Usa Gestisci cookie e scegli Solo necessari. Puoi anche cancellare i cookie
        dal browser: al prossimo ingresso rivedrai il banner.
      </p>
    </article>
  );
}
