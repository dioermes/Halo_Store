"use client";

import { useEffect, useState } from "react";
import { MapPin, Navigation, Phone } from "lucide-react";
import { InstagramGlyph } from "@/components/icons";
import { Reveal, RevealWords } from "@/components/reveal";
import { OpenBadge } from "@/components/open-badge";
import { formatSlots, weekSchedule } from "@/lib/opening-hours";
import { fullAddress, storeConfig } from "@/lib/store-config";

export function StoreInfo() {
  const [today, setToday] = useState<number | null>(null);

  useEffect(() => {
    setToday(new Date().getDay());
  }, []);

  return (
    <section
      id="dove-siamo"
      className="relative border-t border-ink-line py-24 sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div>
            <Reveal>
              <p className="text-xs uppercase tracking-[0.34em] text-halo">
                Dove siamo
              </p>
            </Reveal>
            <h2 className="mt-6 font-display text-[clamp(2.6rem,6vw,4.6rem)] leading-[0.95] tracking-tight">
              <RevealWords text="Ti aspettiamo" className="block" />
              <RevealWords
                text="in Via Castellana"
                className="block italic text-ivory-dim"
                delay={0.1}
              />
            </h2>

            <Reveal delay={0.2}>
              <div className="mt-10 space-y-6">
                <a
                  href={storeConfig.maps.place}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-3 text-lg transition-colors hover:text-halo-bright"
                >
                  <MapPin className="mt-1 h-5 w-5 shrink-0 text-halo" aria-hidden />
                  <span>{fullAddress}</span>
                </a>

                <a
                  href={storeConfig.phone.href}
                  className="flex items-center gap-3 text-lg transition-colors hover:text-halo-bright"
                >
                  <Phone className="h-5 w-5 shrink-0 text-halo" aria-hidden />
                  <span>{storeConfig.phone.display}</span>
                </a>

                <div>
                  <OpenBadge />
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.3}>
              <ul className="mt-10 divide-y divide-ink-line border-y border-ink-line">
                {weekSchedule.map((entry) => {
                  const isToday = today === entry.day;
                  const closed = entry.slots.length === 0;
                  return (
                    <li
                      key={entry.day}
                      className={`flex items-baseline justify-between gap-6 py-3 text-sm transition-colors ${
                        isToday ? "text-ivory" : "text-ivory-dim"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {isToday && (
                          <span
                            className="h-1.5 w-1.5 rounded-full bg-halo"
                            aria-hidden
                          />
                        )}
                        {entry.label}
                        {isToday && (
                          <span className="sr-only">(oggi)</span>
                        )}
                      </span>
                      <span className={closed ? "text-ivory-dim/60" : undefined}>
                        {formatSlots(entry)}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-4 text-xs text-ivory-dim">
                Orari indicativi: confermali con il negozio prima di fare
                strada.
              </p>
            </Reveal>

            <Reveal delay={0.4}>
              <div className="mt-10 flex flex-wrap gap-3">
                <a
                  href={storeConfig.phone.href}
                  className="inline-flex items-center gap-2 rounded-full bg-ivory px-6 py-3.5 text-sm font-medium text-ink transition-transform duration-300 hover:scale-[1.03]"
                >
                  <Phone className="h-4 w-4" aria-hidden />
                  Chiama
                </a>
                <a
                  href={storeConfig.maps.directions}
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center gap-2 rounded-full border border-ink-line px-6 py-3.5 text-sm transition-colors hover:border-halo/60 hover:text-halo-bright"
                >
                  <Navigation className="h-4 w-4" aria-hidden />
                  Indicazioni stradali
                </a>
                <a
                  href={storeConfig.instagram.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-ink-line px-6 py-3.5 text-sm transition-colors hover:border-halo/60 hover:text-halo-bright"
                >
                  <InstagramGlyph className="h-4 w-4" />
                  Guarda gli arrivi su Instagram
                </a>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.15}>
            <div className="relative h-full min-h-[420px] overflow-hidden rounded-3xl border border-ink-line">
              <iframe
                title="Mappa di Halo Store in Via Castellana 18A a Conversano"
                src={storeConfig.maps.embed}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full w-full grayscale-[0.65] contrast-[1.1] invert-[0.92] hue-rotate-180"
                allowFullScreen
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-ink-line"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
