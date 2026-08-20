"use client";

import Image from "next/image";
import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { ArrowDown, MapPin } from "lucide-react";
import { OpenBadge } from "@/components/open-badge";
import { ambientImages } from "@/lib/products";
import { fullAddress, storeConfig } from "@/lib/store-config";

const title = "Halo";
const letters = title.split("");

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const smooth = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    mass: 0.4,
  });
  const imageY = useTransform(smooth, [0, 1], ["0%", reduceMotion ? "0%" : "18%"]);
  const textY = useTransform(smooth, [0, 1], ["0%", reduceMotion ? "0%" : "-12%"]);
  const glowScale = useTransform(smooth, [0, 1], [1, reduceMotion ? 1 : 1.4]);
  const fade = useTransform(smooth, [0, 0.8], [1, reduceMotion ? 1 : 0]);

  return (
    <section
      ref={sectionRef}
      className="grain relative isolate flex min-h-[100svh] flex-col justify-center overflow-hidden pt-24 pb-16 sm:pt-28"
    >
      <motion.div
        aria-hidden
        style={{ scale: glowScale }}
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[820px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(162,178,159,0.22)_0%,rgba(162,178,159,0.06)_42%,transparent_70%)] animate-halo-pulse"
      />

      <div className="mx-auto grid w-full max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <motion.div style={{ y: textY, opacity: fade }} className="relative">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="flex items-center gap-2 text-xs uppercase tracking-[0.34em] text-ivory-dim"
          >
            <MapPin className="h-3.5 w-3.5 text-halo" aria-hidden />
            Conversano · Puglia
          </motion.p>

          <h1 className="mt-6 font-display text-[clamp(5rem,17vw,13rem)] leading-[0.82] tracking-[-0.03em]">
            <span className="mask-reveal">
              <span className="flex">
                {letters.map((letter, index) => (
                  <motion.span
                    key={`${letter}-${index}`}
                    initial={{ y: reduceMotion ? 0 : "110%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      duration: 1.1,
                      delay: 0.25 + index * 0.08,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="inline-block"
                  >
                    {letter}
                  </motion.span>
                ))}
              </span>
            </span>
            <span className="mask-reveal">
              <motion.span
                initial={{
                  y: reduceMotion ? 0 : "110%",
                  opacity: reduceMotion ? 0 : 1,
                }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="block text-[clamp(1.5rem,4.4vw,3rem)] italic leading-tight tracking-normal text-ivory-dim"
              >
                Store
              </motion.span>
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.85 }}
            className="mt-8 max-w-md text-balance-display text-lg leading-relaxed text-ivory-dim"
          >
            Capi che non trovi ovunque, scelti uno per uno. Guardali qui, mettili
            da parte, poi vieni a provarli con calma.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1 }}
            className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center"
          >
            <a
              href="#catalogo"
              className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full bg-ivory px-7 py-4 text-sm font-medium text-ink transition-transform duration-300 hover:scale-[1.03]"
            >
              <span className="absolute inset-0 -translate-x-full bg-halo transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0" />
              <span className="relative">Esplora il catalogo</span>
              <ArrowDown
                className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5"
                aria-hidden
              />
            </a>
            <a
              href={storeConfig.maps.directions}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-ink-line px-7 py-4 text-sm text-ivory transition-colors hover:border-halo/60 hover:text-halo-bright"
            >
              Come arrivare
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 1.15 }}
            className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-3"
          >
            <OpenBadge />
            <span className="text-sm text-ivory-dim">{fullAddress}</span>
          </motion.div>
        </motion.div>

        <div className="relative">
          <motion.div
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ y: imageY }}
            className="relative aspect-[4/5] max-h-[62svh] w-full overflow-hidden rounded-[2rem] border border-ink-line sm:aspect-[3/2] lg:aspect-[4/5] lg:max-h-[70svh]"
          >
            <Image
              src={ambientImages.interior}
              alt="Interno del negozio Halo Store con i capi appesi alle stampelle"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 46vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <p className="font-display text-2xl">Via Castellana, 18A</p>
              <p className="mt-1 text-sm text-ivory-dim">
                A due passi dal centro di Conversano
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30, rotate: -6 }}
            animate={{ opacity: 1, y: 0, rotate: -6 }}
            transition={{ duration: 1.2, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="absolute -bottom-8 -right-4 hidden w-40 overflow-hidden rounded-2xl border border-ink-line shadow-2xl sm:block lg:-right-8 lg:w-48"
          >
            <div className="relative aspect-[3/4]">
              <Image
                src={ambientImages.rack}
                alt="Camicie appese a un appendiabiti in negozio"
                fill
                sizes="200px"
                className="object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <motion.a
        href="#manifesto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.4 }}
        style={{ opacity: fade }}
        className="mx-auto mt-14 flex w-fit flex-col items-center gap-2 text-xs uppercase tracking-[0.3em] text-ivory-dim transition-colors hover:text-halo lg:mt-20"
      >
        Scorri
        <motion.span
          animate={reduceMotion ? undefined : { y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="block h-10 w-px bg-gradient-to-b from-halo to-transparent"
        />
      </motion.a>
    </section>
  );
}
