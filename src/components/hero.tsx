"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { armBackgroundVideo } from "@/components/site-media";
import type { SiteAppearance } from "@/lib/site";

export function Hero({
  appearance,
  children,
  isVideo,
}: {
  appearance: SiteAppearance;
  children: ReactNode;
  isVideo: boolean;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.4 });
  const mediaY = useTransform(smooth, [0, 1], ["0%", reduceMotion || isVideo ? "0%" : "12%"]);
  const destination = (button: SiteAppearance["heroButtons"]["shopNow"]) =>
    button.destinationType === "tag"
      ? `/catalogo?tag=${encodeURIComponent(button.destination)}`
      : button.destination;

  useEffect(() => {
    if (!isVideo) return;
    const video = sectionRef.current?.querySelector("video");
    if (!video) return;

    const desktopSrc = video.dataset.desktopSrc;
    if (desktopSrc && window.matchMedia("(min-width: 768px)").matches) {
      const current = video.currentSrc || video.src;
      if (!current.includes(desktopSrc.split("#")[0])) {
        video.src = desktopSrc;
      }
    }

    const release = armBackgroundVideo(video);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void video.play().catch(() => undefined);
        else video.pause();
      },
      { threshold: 0 },
    );
    observer.observe(video);

    return () => {
      observer.disconnect();
      release();
    };
  }, [isVideo]);

  return (
    <section
      ref={sectionRef}
      className="relative isolate min-h-svh overflow-hidden bg-ink"
      aria-label="Halo Store"
    >
      <h1 className="sr-only">Halo Store</h1>
      {isVideo ? (
        <div className="absolute inset-0">{children}</div>
      ) : (
        <motion.div style={{ y: mediaY }} className="absolute inset-0">
          {children}
        </motion.div>
      )}
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
