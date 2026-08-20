"use client";

import { motion } from "motion/react";
import { Star } from "lucide-react";
import { Reveal, RevealWords } from "@/components/reveal";
import { storeConfig } from "@/lib/store-config";

const review = {
  author: "Giovanni Porfido",
  meta: "9 recensioni · Google Maps",
  body: "Un'ottima esperienza, negozio di abbigliamento davvero eccezionale dove puoi trovare quello che cerchi e non trovi ovunque. Prezzi onesti e alta qualità dei tessuti, titolare educato e a modo. Lo consiglio, ci ritornerò per ogni evento.",
};

export function Reviews() {
  return (
    <section
      id="recensioni"
      className="relative overflow-hidden border-t border-ink-line py-24 sm:py-32"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[900px] -translate-x-1/2 rounded-full bg-halo/8 blur-3xl"
      />

      <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.34em] text-halo">
            Chi ci è già passato
          </p>
        </Reveal>

        <div className="mt-10 flex flex-col items-center">
          <div className="flex items-center gap-1.5" aria-hidden>
            {Array.from({ length: 5 }).map((_, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, scale: 0.4, rotate: -25 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: index * 0.09,
                  type: "spring",
                  stiffness: 260,
                  damping: 16,
                }}
              >
                <Star className="h-6 w-6 fill-halo text-halo" />
              </motion.span>
            ))}
          </div>
          <p className="sr-only">
            Valutazione {storeConfig.rating.value} su 5 basata su{" "}
            {storeConfig.rating.count} recensione
          </p>
          <Reveal delay={0.3}>
            <p className="mt-6 font-display text-7xl leading-none sm:text-8xl">
              5,0
            </p>
            <p className="mt-3 text-sm text-ivory-dim">
              su Google, {storeConfig.rating.count} recensione verificata dai
              clienti del negozio
            </p>
          </Reveal>
        </div>

        <blockquote className="mt-16">
          <h2 className="font-display text-[clamp(1.7rem,3.6vw,2.6rem)] leading-snug tracking-tight text-balance-display">
            <RevealWords text="&laquo;Trovi quello che cerchi e non trovi ovunque." />{" "}
            <RevealWords
              text="Prezzi onesti e alta qualità dei tessuti.&raquo;"
              className="italic text-ivory-dim"
              delay={0.15}
            />
          </h2>
          <Reveal delay={0.35}>
            <p className="mt-10 leading-relaxed text-ivory-dim">
              {review.body}
            </p>
            <footer className="mt-8">
              <p className="text-ivory">{review.author}</p>
              <p className="mt-1 text-sm text-ivory-dim">{review.meta}</p>
            </footer>
          </Reveal>
        </blockquote>

        <Reveal delay={0.45}>
          <a
            href={storeConfig.maps.place}
            target="_blank"
            rel="noreferrer"
            className="mt-12 inline-flex items-center gap-2 rounded-full border border-ink-line px-6 py-3.5 text-sm transition-colors hover:border-halo/60 hover:text-halo-bright"
          >
            Leggi le recensioni su Google
          </a>
        </Reveal>
      </div>
    </section>
  );
}
