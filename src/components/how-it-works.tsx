"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { Hand, Store, Shirt } from "lucide-react";
import { Reveal, RevealWords } from "@/components/reveal";
import { useCart } from "@/components/reservation-provider";

const steps = [
  {
    icon: Hand,
    title: "Scegli i capi",
    body: "Apri la scheda, seleziona taglia e colore, aggiungi al carrello. Il catalogo è pubblico: l'account serve per confermare.",
  },
  {
    icon: Store,
    title: "Prenota o spedisci",
    body: "Ritiro in negozio: scegli l'orario e paghi in cassa. Spedizione in Italia: paghi sul sito con i metodi accesi su Stripe.",
  },
  {
    icon: Shirt,
    title: "Ritiro o spedizione",
    body: "Ti scriviamo quando il capo è pronto in Via Castellana, o quando parte il pacco con il tracking.",
  },
];

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { openBag } = useCart();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.8", "center 0.5"],
  });
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-t border-ink-line py-24 sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.34em] text-halo">
              Come funziona
            </p>
          </Reveal>
          <h2 className="mt-6 font-display text-[clamp(2.6rem,6vw,4.6rem)] leading-[0.95] tracking-tight">
            <RevealWords text="Non fartelo" className="block" />
            <RevealWords
              text="scappare"
              className="block italic text-ivory-dim"
              delay={0.1}
            />
          </h2>
          <Reveal delay={0.2}>
            <p className="mt-8 text-lg leading-relaxed text-ivory-dim">
              Molti capi arrivano in pochi pezzi per taglia. Mettili nel
              carrello: per il ritiro te li teniamo da parte, per la spedizione
              paghi sul sito.
            </p>
          </Reveal>
        </div>

        <div className="relative mt-16">
          <motion.div
            aria-hidden
            style={{ scaleX: reduceMotion ? 1 : lineScale }}
            className="absolute left-0 right-0 top-7 hidden h-px origin-left bg-gradient-to-r from-halo/70 via-halo/30 to-transparent md:block"
          />
          <ol className="grid gap-12 md:grid-cols-3 md:gap-8">
            {steps.map((step, index) => (
              <Reveal as="li" key={step.title} delay={index * 0.12}>
                <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-ink-line bg-ink">
                  <step.icon className="h-5 w-5 text-halo" aria-hidden />
                </div>
                <p className="mt-6 text-xs uppercase tracking-[0.2em] text-ivory-dim">
                  Passo {index + 1}
                </p>
                <h3 className="mt-3 font-display text-3xl leading-tight">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-sm leading-relaxed text-ivory-dim">
                  {step.body}
                </p>
              </Reveal>
            ))}
          </ol>
        </div>

        <Reveal delay={0.3}>
          <div className="mt-16 flex flex-wrap items-center gap-4">
            <a
              href="/catalogo"
              className="rounded-full bg-ivory px-7 py-4 text-sm font-medium text-ink transition-transform duration-300 hover:scale-[1.03]"
            >
              Scegli i tuoi capi
            </a>
            <button
              type="button"
              onClick={openBag}
              className="rounded-full border border-ink-line px-7 py-4 text-sm transition-colors hover:border-halo/60 hover:text-halo-bright"
            >
              Apri il carrello
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
