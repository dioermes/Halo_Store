"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { RevealWords } from "@/components/reveal";
import { resolveTaglineColors, taglineWords } from "@/lib/tagline";

const condensed = { fontFamily: "var(--font-bebas-neue), 'Bebas Neue', Impact, sans-serif" };
const VIEW_WIDTH = 154;

export function TaglineBand({ text, colors }: { text: string; colors?: string[] }) {
  const reduceMotion = useReducedMotion();
  const words = taglineWords(text);
  const phrase = words.join(" ");
  const wordColors = resolveTaglineColors(text, colors);
  const boxRef = useRef<HTMLDivElement>(null);
  const phraseRef = useRef<HTMLParagraphElement>(null);
  // Taglio nella scritta HALO, in unità del viewBox, identico al riquadro delle maiuscole della frase.
  const [gap, setGap] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  useEffect(() => {
    const box = boxRef.current;
    const el = phraseRef.current;
    if (!box || !el) return;
    const measure = () => {
      const word = el.querySelector<HTMLElement>(".mask-reveal");
      if (!word) return;
      const boxRect = box.getBoundingClientRect();
      const textRect = el.getBoundingClientRect();
      const wordRect = word.getBoundingClientRect();
      if (!boxRect.width || !textRect.width) return;
      const style = getComputedStyle(el);
      const ctx = document.createElement("canvas").getContext("2d");
      if (!ctx) return;
      ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      const m = ctx.measureText("H");
      const capHeight = m.actualBoundingBoxAscent;
      const fontHeight = m.fontBoundingBoxAscent + m.fontBoundingBoxDescent;
      if (!capHeight || !fontHeight) return;
      // Le parole stanno in contenitori overflow:hidden: la linea di base va ricavata dentro il contenitore
      const baseline = wordRect.top + (wordRect.height - fontHeight) / 2 + m.fontBoundingBoxAscent;
      const scale = VIEW_WIDTH / boxRect.width;
      const x = (textRect.left - boxRect.left) * scale;
      const width = textRect.width * scale;
      const y = (baseline - capHeight - boxRect.top) * scale;
      setGap(width >= VIEW_WIDTH ? null : { x, y, width, height: capHeight * scale });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    observer.observe(el);
    void document.fonts?.ready.then(measure);
    return () => observer.disconnect();
  }, [phrase]);

  return (
    <section aria-label="Frase del negozio" className="bg-ink px-4 py-4">
      <div className="mx-auto max-w-5xl @container">
        <div ref={boxRef} className="relative mx-auto w-[67%]">
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
                <rect
                  x={gap ? gap.x : -20}
                  y={gap ? gap.y : 35}
                  width={gap ? gap.width : 194}
                  height={gap ? gap.height : 10.5}
                  fill="black"
                />
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
            ref={phraseRef}
            className="absolute left-1/2 top-[61%] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-center text-[5.8cqw] uppercase leading-none tracking-[0.01em] text-[#231f20]"
            style={condensed}
          >
            <RevealWords text={phrase} wordColors={wordColors} className="inline" delay={1} />
          </p>
        </div>
      </div>
    </section>
  );
}
