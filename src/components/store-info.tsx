"use client";

import { useEffect, useState } from "react";
import { MapPin, Navigation, Phone } from "lucide-react";
import { InstagramGlyph, TikTokGlyph } from "@/components/icons";
import { Reveal, RevealWords } from "@/components/reveal";
import { OpenBadge } from "@/components/open-badge";
import { useEmbedsAllowed } from "@/components/cookie-banner";
import { formatSlots } from "@/lib/opening-hours";
import { useStoreContact } from "@/components/store-contact-provider";
import { writeConsent } from "@/lib/consent";
import { fullAddress, storeConfig } from "@/lib/store-config";

export function StoreInfo() {
  const { phone, hours } = useStoreContact();
  const [today, setToday] = useState<number | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setToday(new Date().getDay()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <section
      id="dove-siamo"
      className="halo-section relative scroll-mt-28 border-t border-ink-line/45"
    >
      <div className="halo-shell">
        <div className="grid gap-16 lg:grid-cols-[1fr_1.05fr] lg:gap-24">
          <div>
            <Reveal>
              <p className="text-xs uppercase tracking-[0.38em] text-halo">
                Dove siamo
              </p>
            </Reveal>
            <h2 className="halo-display mt-7 text-[clamp(2.75rem,6.4vw,5rem)]">
              <RevealWords text="Ti aspettiamo" className="block" />
              <RevealWords
                text="in Via Castellana"
                className="block italic text-ivory-dim"
                delay={0.1}
              />
            </h2>

            <Reveal delay={0.3}>
              <div className="mt-10"><OpenBadge /></div>
              <ul className="mt-5 divide-y divide-ink-line border-y border-ink-line">
                {hours.map((entry) => {
                  const isToday = today === entry.day;
                  const closed = entry.slots.length === 0;
                  return (
                    <li
                      key={entry.day}
                      className={`flex items-baseline justify-between gap-6 py-3.5 text-sm transition-colors ${
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
            </Reveal>

            <Reveal delay={0.2}>
              <div className="mt-10 space-y-7">
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
                  href={phone.href}
                  className="flex items-center gap-3 text-lg transition-colors hover:text-halo-bright"
                >
                  <Phone className="h-5 w-5 shrink-0 text-halo" aria-hidden />
                  <span>{phone.display}</span>
                </a>

              </div>
            </Reveal>

            <Reveal delay={0.4}>
              <div className="mt-10 flex flex-wrap gap-3">
                <a
                  href={phone.href}
                  className="inline-flex items-center gap-2 rounded-md bg-ivory px-6 py-3.5 text-sm font-medium text-ink transition-transform duration-300 hover:scale-[1.03]"
                >
                  <Phone className="h-4 w-4" aria-hidden />
                  Chiama
                </a>
                <a
                  href={storeConfig.maps.directions}
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center gap-2 rounded-md border border-ink-line px-6 py-3.5 text-sm transition-colors hover:border-halo/60 hover:text-halo-bright"
                >
                  <Navigation className="h-4 w-4" aria-hidden />
                  Indicazioni stradali
                </a>
                <a
                  href={storeConfig.instagram.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-md border border-ink-line px-6 py-3.5 text-sm transition-colors hover:border-halo/60 hover:text-halo-bright"
                >
                  <InstagramGlyph className="h-4 w-4" />
                  Seguici su Instagram
                </a>
                <a
                  href={storeConfig.tiktok.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-md border border-ink-line px-6 py-3.5 text-sm transition-colors hover:border-halo/60 hover:text-halo-bright"
                >
                  <TikTokGlyph className="h-4 w-4" />
                  Seguici su TikTok
                </a>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.15} className="lg:self-center">
            <StoreMap />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function StoreMap() {
  const allowed = useEmbedsAllowed();

  if (!allowed) {
    return (
      <div className="relative flex h-[340px] flex-col items-start justify-end overflow-hidden rounded-3xl border border-ink-line bg-ink-soft p-8 sm:h-[360px]">
        <p className="font-display text-3xl leading-none text-ivory">Mappa Google</p>
        <p className="mt-4 max-w-sm text-sm leading-relaxed text-ivory-dim">
          La mappa è un contenuto di Google: si carica solo se accetti i cookie non
          necessari, oppure se la attivi qui.
        </p>
        <button
          type="button"
          onClick={() => writeConsent(true)}
          className="mt-6 rounded-md bg-ivory px-6 py-3 text-sm font-medium text-ink"
        >
          Carica la mappa
        </button>
        <a
          href={storeConfig.maps.place}
          target="_blank"
          rel="noreferrer"
          className="mt-3 text-sm text-halo-bright underline underline-offset-4"
        >
          Apri su Google Maps
        </a>
      </div>
    );
  }

  return (
    <div className="relative h-[340px] overflow-hidden rounded-3xl border border-ink-line sm:h-[360px]">
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
  );
}
