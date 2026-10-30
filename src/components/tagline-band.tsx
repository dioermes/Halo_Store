"use client";

import { motion, useReducedMotion } from "motion/react";
import { RevealWords } from "@/components/reveal";

const condensed = { fontFamily: "var(--font-bebas-neue), 'Bebas Neue', Impact, sans-serif" };

export function TaglineBand({ text }: { text: string }) {
  const reduceMotion = useReducedMotion();
  const words = text.trim().split(/\s+/);
  const last = words.length > 1 ? words.pop()! : "";
  const lead = words.join(" ");

  return (
    <section aria-label="Frase del negozio" className="bg-ink px-4 py-4">
      <div className="mx-auto max-w-5xl '@container'">
        <div className="relative mx-auto w-[67%]">
          <motion.div
            initial={{ clipPath: reduceMotion ? "inset(-20% -20% -20% -20%)" : "inset(-20% 100% -20% -20%)" }}
            whileInView={{ clipPath: "inset(-20% -20% -20% -20%)" }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1.3, ease: [0.65, 0, 0.35, 1] }}
          >
          <svg viewBox="0 0 154 70" aria-hidden className="block h-auto w-full select-none overflow-visible">
            <defs>
              <mask id="tagline-gap" maskUnits="userSpaceOnUse" x="-20" y="-20" width="194" height="120">
                <rect x="-20" y="-20" width="194" height="120" fill="white" />
                <rect x="-20" y="35" width="194" height="10.5" fill="black" />
              </mask>
            </defs>
            <text
              mask="url(#tagline-gap)"
              x="0"
              y="70"
              textLength="154"
              lengthAdjust="spacingAndGlyphs"
              fontSize="100"
              fill="none"
              className="stroke-[#cdd2d6] stroke-[1.25] sm:stroke-[#d9dde1] sm:stroke-1"
              strokeLinejoin="round"
              textRendering="geometricPrecision"
              vectorEffect="non-scaling-stroke"
              style={condensed}
            >
              HALO
            </text>
          </svg>
          </motion.div>
          <p
            className="absolute left-1/2 top-[60%] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-center text-[5.8cqw] uppercase leading-none tracking-[0.01em] text-[#231f20]"
            style={condensed}
          >
            <RevealWords text={lead || text} className="inline text-[#A3B18F]" delay={1} />
            {last ? (
              <>
                {" "}
                <RevealWords text={last} className="inline text-[#5e1730]" delay={1.5} />
              </>
            ) : null}
          </p>
        </div>
      </div>
    </section>
  );
}
