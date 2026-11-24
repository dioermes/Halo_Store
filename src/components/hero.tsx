"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { SiteMediaView } from "@/components/site-media";
import type { SiteAppearance } from "@/lib/site";

function useDesktop() {
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const sync = () => setDesktop(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  return desktop;
}

export function Hero({ appearance }: { appearance: SiteAppearance }) {
  const sectionRef = useRef<HTMLElement>(null);
  const desktop = useDesktop();
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const desktopMedia = appearance.heroDesktop;
  const mobileMedia = appearance.heroMobile;
  const videoHero = desktopMedia.kind === "video" || mobileMedia.kind === "video";
  const media = desktop ? desktopMedia : mobileMedia;
  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.4 });
  const mediaY = useTransform(smooth, [0, 1], ["0%", reduceMotion || videoHero ? "0%" : "12%"]);
  const destination = (button: SiteAppearance["heroButtons"]["shopNow"]) =>
    button.destinationType === "tag"
      ? `/catalogo?tag=${encodeURIComponent(button.destination)}`
      : button.destination;

  return (
    <section
      ref={sectionRef}
      className="relative isolate min-h-svh overflow-hidden bg-ink"
      aria-label="Halo Store"
    >
      <h1 className="sr-only">Halo Store</h1>
      <motion.div style={{ y: mediaY }} className="absolute inset-0">
        <SiteMediaView
          key={media.url}
          media={media}
          alt="Halo Store"
          priority
          className="h-full w-full object-cover"
        />
      </motion.div>
      <div className="absolute bottom-[clamp(1.5rem,5vw,3.5rem)] left-[clamp(1.25rem,4vw,2.5rem)] z-10 flex gap-[clamp(0.75rem,1.6vw,1.1rem)]">
        <Link
          href={destination(appearance.heroButtons.shopNow)}
          className="flex min-h-[clamp(2.75rem,4.2vw,3.35rem)] items-center justify-center border border-[#C5CEBC] bg-[#C5CEBC] px-[clamp(1.5rem,2.8vw,2.25rem)] text-[clamp(0.7rem,1.15vw,0.85rem)] font-semibold tracking-[0.18em] text-ivory transition-colors hover:border-ivory hover:bg-ivory hover:text-white"
        >
          {appearance.heroButtons.shopNow.label}
        </Link>
        <Link
          href={destination(appearance.heroButtons.newIn)}
          className="flex min-h-[clamp(2.75rem,4.2vw,3.35rem)] items-center justify-center border border-ivory bg-transparent px-[clamp(1.5rem,2.8vw,2.25rem)] text-[clamp(0.7rem,1.15vw,0.85rem)] font-semibold tracking-[0.18em] text-ivory transition-colors duration-500 hover:border-[#C5CEBC] hover:bg-[#C5CEBC] hover:text-ivory"
        >
          {appearance.heroButtons.newIn.label}
        </Link>
      </div>
    </section>
  );
}
