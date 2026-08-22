import { storeConfig } from "@/lib/store-config";

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-2xl px-5 py-24 leading-relaxed text-ivory-dim">
      <h1 className="font-display text-5xl text-ivory">Privacy</h1>
      <p className="mt-6">
        Halo Store di Buonsante Miriana tratta i dati per eseguire gli ordini,
        l&apos;account e gli obblighi di legge. Il testo legale definitivo è del
        titolare: questa pagina è il contenitore del sito.
      </p>
      <p className="mt-4">
        Le email promozionali partono solo con opt-in esplicito, separato dai
        cookie. Puoi disiscriverti da ogni mail o da Account → Preferenze.
      </p>
      <p className="mt-4">
        Per domande:{" "}
        <a href={storeConfig.support.emailHref} className="text-ivory hover:text-halo-bright">
          {storeConfig.support.email}
        </a>
        {" · "}
        <a href={storeConfig.phone.href} className="text-ivory hover:text-halo-bright">
          {storeConfig.phone.display}
        </a>
        .
      </p>
    </article>
  );
}
