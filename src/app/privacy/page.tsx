import Link from "next/link";
import { CookieSettingsButton } from "@/components/cookie-banner";
import { fiscalLine, fullAddress, storeConfig } from "@/lib/store-config";

export const metadata = {
  title: "Privacy",
  description: "Informativa sul trattamento dei dati personali di Halo Store, Conversano.",
};

export default function PrivacyPage() {
  const { legalName, support, phone } = storeConfig;
  const fiscal = fiscalLine();

  return (
    <article className="mx-auto max-w-2xl px-5 py-24 leading-relaxed text-ivory-dim">
      <h1 className="font-display text-5xl text-ivory">Privacy</h1>
      <p className="mt-3 text-sm">Ultimo aggiornamento: 31 agosto 2026</p>

      <h2 className="mt-10 font-display text-3xl text-ivory">Titolare del trattamento</h2>
      <p className="mt-4">
        {legalName}, {fullAddress}.
        {fiscal ? ` ${fiscal}.` : " Impresa individuale."}
      </p>
      {!fiscal ? (
        <p className="mt-4">
          P.IVA e codice fiscale sono quelli dell&apos;impresa individuale. Per i
          dati completi di fatturazione scrivi a {support.email}.
        </p>
      ) : null}
      <p className="mt-4">
        Non è nominato un DPO. Per esercitare i tuoi diritti o per qualsiasi domanda
        sui dati:{" "}
        <a href={support.emailHref} className="text-ivory hover:text-halo-bright">
          {support.email}
        </a>
        {" · "}
        <a href={phone.href} className="text-ivory hover:text-halo-bright">
          {phone.display}
        </a>
        .
      </p>

      <h2 className="mt-10 font-display text-3xl text-ivory">Quali dati trattiamo</h2>
      <p className="mt-4">
        Dati che ci dai tu: nome, email, telefono, indirizzo di consegna, data di compleanno
        (solo se ti iscrivi alla newsletter), note sull&apos;ordine, contenuti che ci scrivi.
      </p>
      <p className="mt-4">
        Dati dell&apos;account: identificativo di accesso, email, eventuale nome del profilo.
      </p>
      <p className="mt-4">
        Dati dell&apos;ordine: capi, taglie, colori, importi, ritiro o spedizione, stato,
        tracking, eventuali codici sconto.
      </p>
      <p className="mt-4">
        Dati tecnici: sessione, carrello, sicurezza, scelta sui cookie. Non usiamo
        Google Analytics né pixel pubblicitari. I caratteri dei titoli sono ospitati
        sul sito. Se accetti i contenuti di terzi (o carichi la mappa), Google riceve
        l&apos;indirizzo IP e cookie propri della mappa.
      </p>
      <p className="mt-4">
        Se chiedi l&apos;avviso «è tornato il capo», teniamo l&apos;email e la
        variante finché il capo torna disponibile; poi ti scriviamo e cancelliamo
        la richiesta.
      </p>

      <h2 className="mt-10 font-display text-3xl text-ivory">Perché e su quale base</h2>
      <p className="mt-4">
        Esecuzione del contratto (art. 6.1.b GDPR): creare l&apos;account, confermare
        ritiro o spedizione, pagare (solo per la spedizione), evadere l&apos;ordine,
        assistenza, resi e rimborsi.
      </p>
      <p className="mt-4">
        Obblighi di legge (art. 6.1.c): fatturazione, contabilità, diritti di garanzia
        e recesso.
      </p>
      <p className="mt-4">
        Consenso (art. 6.1.a): newsletter, offerte, codice di benvenuto e codice
        compleanno; cookie e contenuti non necessari (mappa Google incorporata).
        Il consenso newsletter si dà nel popup o da Account → Preferenze. Il consenso
        cookie si dà dal banner o da «Gestisci cookie». Puoi revocare in ogni momento.
      </p>
      <p className="mt-4">
        Interesse legittimo (art. 6.1.f): sicurezza del sito, prevenzione abusi,
        miglioramento del servizio nei limiti di legge.
      </p>

      <h2 className="mt-10 font-display text-3xl text-ivory">Quanto li teniamo</h2>
      <p className="mt-4">
        Dati dell&apos;ordine e fiscali: per il tempo richiesto dalla legge. Account: finché
        resta attivo e per un periodo successivo utile a chiudere eventuali pratiche.
        Newsletter: finché resti iscritto, poi cessiamo gli invii promozionali.
        Avvisi di disponibilità: fino all&apos;invio della mail o alla cancellazione
        della richiesta. Scelta cookie: 12 mesi, poi la richiediamo di nuovo.
      </p>

      <h2 className="mt-10 font-display text-3xl text-ivory">A chi li comunichiamo</h2>
      <p className="mt-4">
        Fornitori che ci servono per far funzionare il negozio, ciascuno per il proprio
        compito (responsabili o titolari autonomi secondo il servizio):
      </p>
      <ul className="mt-4 list-disc space-y-2 pl-5">
        <li>Clerk — accesso all&apos;account</li>
        <li>Supabase — database e file</li>
        <li>Stripe — pagamenti online della spedizione</li>
        <li>Resend — invio email (ordini, newsletter, avvisi)</li>
        <li>Vercel — hosting del sito</li>
        <li>Packlink — etichette e tracking delle spedizioni</li>
        <li>Google — solo se acconsenti: mappa incorporata</li>
      </ul>
      <p className="mt-4">
        Non vendiamo i tuoi dati. Alcuni fornitori possono trattare dati anche fuori
        dallo Spazio economico europeo, con le garanzie previste dalla normativa
        (tra cui clausole contrattuali tipo e, ove applicabile, il Data Privacy Framework).
      </p>

      <h2 className="mt-10 font-display text-3xl text-ivory">Cookie</h2>
      <p className="mt-4">
        I dettagli (nome, finalità, durata) sono nella{" "}
        <Link href="/cookie" className="text-halo-bright underline underline-offset-4">
          informativa cookie
        </Link>
        . Puoi cambiare idea in qualsiasi momento:{" "}
        <CookieSettingsButton className="text-halo-bright underline underline-offset-4" />.
      </p>

      <h2 className="mt-10 font-display text-3xl text-ivory">I tuoi diritti</h2>
      <p className="mt-4">
        Puoi chiedere accesso, rettifica, cancellazione, limitazione, portabilità e
        opporti al trattamento, nei casi previsti dal Regolamento (UE) 2016/679. Puoi
        revocare il consenso in qualsiasi momento, senza pregiudicare i trattamenti già
        svolti. Hai diritto di proporre reclamo al Garante per la protezione dei dati
        personali (
        <a
          href="https://www.garanteprivacy.it"
          className="text-halo-bright underline underline-offset-4"
          target="_blank"
          rel="noreferrer"
        >
          garanteprivacy.it
        </a>
        ).
      </p>
      <p className="mt-4">
        Per una richiesta scrivi a {support.email} indicando un documento o altro elemento
        che ci consenta di riconoscerti.
      </p>

      <h2 className="mt-10 font-display text-3xl text-ivory">Minori</h2>
      <p className="mt-4">
        Il sito è destinato all&apos;acquisto di abbigliamento e non è rivolto a chi ha meno
        di 16 anni. Non raccogliamo consapevolmente dati di minori.
      </p>

      <h2 className="mt-10 font-display text-3xl text-ivory">Aggiornamenti</h2>
      <p className="mt-4">
        Se questa informativa cambia in modo sostanziale, la pubblichiamo su questo sito e,
        se serve, te lo comunichiamo.
      </p>
    </article>
  );
}
