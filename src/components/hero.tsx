"use client";

import { useRef } from "react";
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
            className="h-full w-full object-cover"
          />
        </div>
        <div className="absolute inset-0 md:hidden">
          <SiteMediaView
            key={appearance.heroMobile.url}
            media={appearance.heroMobile}
            alt="Halo Store"
            priority
            className="h-full w-full object-cover"
          />
        </div>
      </motion.div>
    </section>
  );
}
