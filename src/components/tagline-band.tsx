import { RevealWords } from "@/components/reveal";

const condensed = { fontFamily: "var(--font-bebas-neue), 'Bebas Neue', Impact, sans-serif" };

export function TaglineBand({ text }: { text: string }) {
  const words = text.trim().split(/\s+/);
  const last = words.length > 1 ? words.pop()! : "";
  const lead = words.join(" ");

  return (
    <section aria-label="Frase del negozio" className="bg-ink px-4 py-4">
      <div className="mx-auto max-w-5xl [container-type:inline-size]">
        <div className="relative mx-auto w-[67%]">
          <svg viewBox="0 0 154 70" aria-hidden className="block h-auto w-full select-none overflow-visible">
            <text
              x="0"
              y="70"
              textLength="154"
              lengthAdjust="spacingAndGlyphs"
              fontSize="100"
              fill="none"
              className="stroke-[#cdd2d6] [stroke-width:1.25] sm:stroke-[#d9dde1] sm:[stroke-width:1]"
              strokeLinejoin="round"
              textRendering="geometricPrecision"
              vectorEffect="non-scaling-stroke"
              style={condensed}
            >
              HALO
            </text>
          </svg>
          <p
            className="absolute left-1/2 top-[60%] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-center text-[5.8cqw] uppercase leading-none tracking-[0.01em] text-[#231f20]"
            style={condensed}
          >
            <RevealWords text={lead || text} className="inline text-[#A3B18F]" />
            {last ? (
              <>
                {" "}
                <RevealWords text={last} className="inline text-[#5e1730]" delay={0.25} />
              </>
            ) : null}
          </p>
        </div>
      </div>
    </section>
  );
}
