"use client";

import Link from "next/link";
import type { SiteAppearance } from "@/lib/site";

export function HeroButtons({ appearance }: { appearance: SiteAppearance }) {
  const destination = (button: SiteAppearance["heroButtons"]["shopNow"]) =>
    button.destinationType === "tag"
      ? `/catalogo?tag=${encodeURIComponent(button.destination)}`
      : button.destination;

  return (
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
  );
}
