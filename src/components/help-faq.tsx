import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Reveal, RevealWords } from "@/components/reveal";

const faqs: { question: string; answers: string[] }[] = [
  {
    question: "Quali sono i metodi di pagamento?",
    answers: [
      "Online paghi in modo sicuro con carta di credito o debito e con i portafogli digitali disponibili al momento del pagamento (come Apple Pay e Google Pay). I dati della carta non passano da noi.",
      "Se scegli il ritiro in negozio, prenoti il capo sul sito e paghi direttamente in cassa, dopo averlo provato.",
    ],
  },
  {
    question: "È possibile effettuare un reso?",
    answers: [
      "Certo! Puoi effettuare un reso entro e non oltre 14 giorni dalla consegna del pacco. Prima di spedire, scrivici o chiamaci: ti confermiamo come procedere e l'indirizzo a cui inviare il reso.",
      "Affinché il reso sia accettato, il capo non deve mai essere stato indossato, deve avere il cartellino con cui è stato consegnato e deve essere riposto nell'imballaggio originale.",
      "Le spese di spedizione del reso sono a carico del cliente, salvo difetto o errore nostro.",
    ],
  },
  {
    question: "In quanto tempo riceverò il rimborso?",
    answers: [
      "Il rimborso viene evaso dopo il controllo della merce resa. Se tutto è in ordine, procediamo con il riaccredito sul metodo di pagamento che hai usato per l'acquisto.",
      "Dopo l'esito positivo del controllo, il riaccredito impiega dai 5 ai 10 giorni lavorativi, a seconda del tuo operatore bancario.",
    ],
  },
  {
    question: "In quanto tempo sarà evaso il mio ordine?",
    answers: [
      "Salvo imprevisti, ogni pacco viene evaso in 24/48 ore lavorative, escluse domeniche e festività. I tempi di consegna dipendono poi dal corriere scelto al checkout.",
    ],
  },
];

export function HelpFaq() {
  return (
    <section
      id="aiuto"
      className="halo-section relative scroll-mt-28 border-t border-ink-line/45"
    >
      <div className="halo-shell">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <p className="text-center text-xs uppercase tracking-[0.38em] text-halo">Assistenza</p>
          </Reveal>
          <h2 className="halo-display halo-section-title mt-7 text-center text-[clamp(2.75rem,6.4vw,5rem)]">
            <RevealWords text="Hai bisogno di aiuto?" className="block" />
          </h2>

          <Reveal delay={0.15}>
            <div className="mt-14 divide-y divide-ink-line border-y border-ink-line">
              {faqs.map((item) => (
                <details key={item.question} className="group py-1">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left text-lg text-ivory marker:hidden [&::-webkit-details-marker]:hidden">
                    {item.question}
                    <ChevronDown
                      className="h-5 w-5 shrink-0 text-halo transition-transform duration-300 group-open:rotate-180"
                      aria-hidden
                    />
                  </summary>
                  <div className="space-y-3 pb-6 text-sm leading-relaxed text-ivory-dim sm:text-base">
                    {item.answers.map((answer) => (
                      <p key={answer}>{answer}</p>
                    ))}
                  </div>
                </details>
              ))}
            </div>
            <p className="mt-8 text-center text-sm text-ivory-dim">
              Altre domande? Leggi{" "}
              <Link href="/termini" className="text-halo-bright underline underline-offset-4">
                Vendite e recesso
              </Link>{" "}
              o contattaci dalla sezione qui sopra.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
