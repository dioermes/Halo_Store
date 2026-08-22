"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { Reveal, RevealWords } from "@/components/reveal";
import { ambientImages } from "@/lib/products";

const pillars = [
  {
    number: "01",
    title: "Selezione, non magazzino",
    body: "Ogni capo entra in negozio perché qualcuno lo ha scelto, provato e voluto. Niente muri di taglie identiche: quello che vedi è quello che vale la pena portare a casa.",
  },
  {
    number: "02",
    title: "Il tessuto prima del logo",
    body: "Cotoni pettinati, denim pesanti, lane che non pizzicano. Si sente al tatto in due secondi, e si vede dopo due anni di lavaggi.",
  },
  {
    number: "03",
    title: "Prezzi che puoi guardare in faccia",
    body: "Nessun rincaro da vetrina. Il prezzo è quello giusto per quel capo, e se hai dubbi te lo spieghiamo pezzo per pezzo.",
  },
];

const marqueeItems = [
  "Capi che non trovi ovunque",
  "Alta qualità dei tessuti",
  "Prezzi onesti",
  "Consiglio su misura",
  "Abbigliamento uomo",
  "Via Castellana, Conversano",
];

export function Manifesto() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? ["0%", "0%"] : ["-8%", "8%"],
  );

  return (
    <section
      ref={sectionRef}
      id="manifesto"
      className="relative overflow-hidden border-t border-ink-line py-24 sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <Reveal>
              <p className="text-xs uppercase tracking-[0.34em] text-halo">
                Il negozio
              </p>
            </Reveal>
            <h2 className="mt-6 font-display text-[clamp(2.6rem,6vw,4.6rem)] leading-[0.95] tracking-tight">
              <RevealWords text="Un negozio piccolo" className="block" />
              <RevealWords
                text="con le idee larghe"
                className="block italic text-ivory-dim"
                delay={0.12}
              />
            </h2>
            <Reveal delay={0.2}>
              <p className="mt-8 max-w-md text-lg leading-relaxed text-ivory-dim">
                Halo Store nasce in Via Castellana con una convinzione semplice:
                per vestirsi bene non serve andare lontano, serve qualcuno che
                sappia scegliere. Entri, ti guardi intorno, e qualcuno ti dice
                davvero come ti sta.
              </p>
            </Reveal>

            <Reveal delay={0.3}>
              <div className="mt-10 flex items-center gap-4 border-l border-halo/40 pl-5">
                <p className="text-sm leading-relaxed text-ivory-dim">
                  <span className="text-ivory">
                    &laquo;Trovi quello che cerchi e non trovi ovunque.&raquo;
                  </span>
                  <br />
                  Dalla prima recensione lasciata sul negozio.
                </p>
              </div>
            </Reveal>
          </div>

          <div>
            <motion.div
              style={{ y: imageY }}
              className="relative mb-14 aspect-[16/11] w-full overflow-hidden rounded-3xl border border-ink-line"
            >
              <Image
                src={ambientImages.leather}
                alt="Giacche in pelle appese a un muro di mattoni"
                fill
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
            </motion.div>

            <ul className="space-y-px overflow-hidden rounded-2xl border border-ink-line">
              {pillars.map((pillar, index) => (
                <Reveal
                  as="li"
                  key={pillar.number}
                  delay={index * 0.1}
                  className="group relative bg-ink-soft/40 p-7 transition-colors duration-500 hover:bg-ink-soft/90 sm:p-9"
                >
                  <span
                    aria-hidden
                    className="absolute left-0 top-0 h-full w-px bg-halo/0 transition-all duration-500 group-hover:bg-halo/70"
                  />
                  <div className="flex items-baseline gap-5">
                    <span className="font-display text-2xl text-halo/70">
                      {pillar.number}
                    </span>
                    <div>
                      <h3 className="font-display text-2xl leading-snug sm:text-3xl">
                        {pillar.title}
                      </h3>
                      <p className="mt-3 max-w-xl leading-relaxed text-ivory-dim">
                        {pillar.body}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="relative mt-24 flex overflow-hidden border-y border-ink-line py-6">
        <div className="animate-marquee flex shrink-0 items-center gap-10 pr-10">
          {[...marqueeItems, ...marqueeItems].map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="flex shrink-0 items-center gap-10 font-display text-2xl whitespace-nowrap text-ivory-dim sm:text-3xl"
            >
              {item}
              <span className="h-1.5 w-1.5 rounded-full bg-halo" aria-hidden />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
