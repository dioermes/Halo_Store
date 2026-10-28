import Link from "next/link";

export default function GiftCardConfirmationPage() {
  return (
    <section className="mx-auto flex min-h-[65vh] max-w-2xl flex-col items-center justify-center px-5 py-24 text-center">
      <p className="text-xs uppercase tracking-[0.34em] text-halo">Gift card</p>
      <h1 className="mt-4 font-display text-5xl text-balance-display">
        Grazie per il tuo acquisto.
      </h1>
      <p className="mt-5 max-w-xl text-ivory-dim">
        Ti invieremo via email la gift card con il codice regalo, pronta da inoltrare. Se non la
        trovi, controlla anche la cartella spam.
      </p>
      <div className="mt-9 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
        <Link
          href="/"
          className="rounded-full border border-ink-line px-7 py-4 text-sm transition-colors hover:border-halo/60 hover:text-halo-bright"
        >
          Torna alla home
        </Link>
        <Link
          href="/account"
          className="rounded-full bg-ivory px-7 py-4 text-sm font-medium text-ink transition-colors hover:bg-halo-bright"
        >
          Vedi i miei ordini
        </Link>
      </div>
    </section>
  );
}
