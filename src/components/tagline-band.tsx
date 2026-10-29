"use client";

import { motion, useReducedMotion } from "motion/react";
import { RevealWords } from "@/components/reveal";

export function TaglineBand({ text }: { text: string }) {
  const reduceMotion = useReducedMotion();
  const words = text.trim().split(/\s+/);
  const last = words.length > 1 ? words.pop()! : "";
  const lead = words.join(" ");

  return (
    <section aria-label="Frase del negozio" className="bg-ink px-6 py-10 text-center sm:py-14">
      <p className="mx-auto max-w-4xl text-[clamp(1.9rem,5.2vw,3.75rem)] leading-[1.08] text-ivory">
        <RevealWords text={lead || text} className="halo-display uppercase tracking-[0.02em]" />
        {last ? (
          <>
            {" "}
            <span className="relative inline-block">
              <RevealWords text={last} className="halo-display italic text-halo-bright" delay={0.25} />
              <svg
                viewBox="0 0 200 12"
                preserveAspectRatio="none"
                aria-hidden
                className="absolute -bottom-2 left-0 h-2.5 w-full text-[#C5CEBC]"
              >
                <motion.path
                  d="M2 8 C 40 2, 90 11, 130 5 S 190 4, 198 7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  initial={{ pathLength: reduceMotion ? 1 : 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.9, delay: 1.1, ease: [0.22, 1, 0.36, 1] }}
                />
              </svg>
            </span>
          </>
        ) : null}
      </p>
    </section>
  );
}
