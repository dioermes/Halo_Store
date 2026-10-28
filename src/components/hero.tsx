"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { SiteMediaView } from "@/components/site-media";
import type { SiteAppearance } from "@/lib/site";

export function Hero({ appearance }: { appearance: SiteAppearance }) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.4 });
  const mediaY = useTransform(smooth, [0, 1], ["0%", reduceMotion ? "0%" : "12%"]);
  const destination = (button: SiteAppearance["heroButtons"]["shopNow"]) =>
    button.destinationType === "tag"
      ? `/catalogo?tag=${encodeURIComponent(button.destination)}`
      : button.destination;

  return (
    <section
      ref={sectionRef}
      className="relative isolate min-h-[100svh] overflow-hidden bg-ink"
      aria-label="Halo Store"
    >
      <h1 className="sr-only">Halo Store</h1>
      <motion.div style={{ y: mediaY }} className="absolute inset-0">
        <div className="absolute inset-0 hidden md:block">
          <SiteMediaView
            key={appearance.heroDesktop.url}
            media={appearance.heroDesktop}
            alt="Halo Store"
            priority
            samplePixels
            className="h-full w-full object-cover"
          />
        </div>
        <div className="absolute inset-0 md:hidden">
          <SiteMediaView
            key={appearance.heroMobile.url}
            media={appearance.heroMobile}
            alt="Halo Store"
            priority
            samplePixels
            className="h-full w-full object-cover"
          />
        </div>
      </motion.div>
      <div className="absolute bottom-10 left-5 z-10 flex gap-3 sm:bottom-14 sm:left-10 sm:gap-4">
        <Link
          href={destination(appearance.heroButtons.shopNow)}
          className="flex min-h-11 items-center justify-center border border-[#C5CEBC] bg-[#C5CEBC] px-6 text-xs font-semibold tracking-[0.18em] text-ivory transition-colors hover:border-ivory hover:bg-ivory hover:text-white sm:px-8"
        >
          {appearance.heroButtons.shopNow.label}
        </Link>
        <Link
          href={destination(appearance.heroButtons.newIn)}
          className="flex min-h-11 items-center justify-center border border-ivory bg-ivory px-6 text-xs font-semibold tracking-[0.18em] text-white transition-colors hover:border-[#C5CEBC] hover:bg-[#C5CEBC] hover:text-ivory sm:px-8"
        >
          {appearance.heroButtons.newIn.label}
        </Link>
      </div>
    </section>
  );
}
