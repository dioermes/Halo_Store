"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type CookiePrefs = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  decidedAt: string;
};

const KEY = "halo-cookie-consent-v1";

function readPrefs(): CookiePrefs | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CookiePrefs;
    if (parsed?.necessary) return parsed;
  } catch {
    // ignore
  }
  return null;
}

function writePrefs(prefs: CookiePrefs) {
  window.localStorage.setItem(KEY, JSON.stringify(prefs));
  window.dispatchEvent(new Event("halo-consent-changed"));
}

export function CookieBanner() {
  const [open, setOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    setOpen(!readPrefs());
  }, []);

  if (!open) return null;

  const save = (next: { analytics: boolean; marketing: boolean }) => {
    writePrefs({
      necessary: true,
      analytics: next.analytics,
      marketing: next.marketing,
      decidedAt: new Date().toISOString(),
    });
    setOpen(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-[90] p-4 md:p-6">
      <div className="mx-auto max-w-3xl rounded-3xl border border-ink-line bg-ink-soft/95 p-5 shadow-2xl backdrop-blur-xl sm:p-6">
        <p className="text-xs uppercase tracking-[0.28em] text-halo">Cookie</p>
        <p className="mt-3 font-display text-3xl leading-none">Il sito, con misura.</p>
        <p className="mt-3 text-sm leading-relaxed text-ivory-dim">
          I cookie tecnici (sessione, carrello, sicurezza) restano sempre attivi.
          Analytics e pubblicità solo se li accendi tu. Questa scelta{" "}
          <strong className="font-medium text-ivory">non iscrive</strong> alla
          newsletter: quella sta in account, a parte.{" "}
          <Link href="/cookie" className="text-halo-bright underline underline-offset-4">
            Informativa cookie
          </Link>
          .
        </p>

        <div className="mt-5 space-y-3 text-sm">
          <label className="flex items-start gap-3 text-ivory-dim">
            <input type="checkbox" checked disabled className="mt-1 accent-halo" />
            Necessari — sempre on
          </label>
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={analytics}
              onChange={(event) => setAnalytics(event.target.checked)}
              className="mt-1 accent-halo"
            />
            <span>
              Statistiche
              <span className="block text-ivory-dim">Capire come si muove il catalogo, senza pubblicità.</span>
            </span>
          </label>
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={marketing}
              onChange={(event) => setMarketing(event.target.checked)}
              className="mt-1 accent-halo"
            />
            <span>
              Marketing
              <span className="block text-ivory-dim">Annunci e retargeting. Off di default.</span>
            </span>
          </label>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => save({ analytics: true, marketing: true })}
            className="rounded-full bg-ivory px-5 py-3 text-sm font-medium text-ink"
          >
            Accetta tutti
          </button>
          <button
            type="button"
            onClick={() => save({ analytics, marketing })}
            className="rounded-full border border-ink-line px-5 py-3 text-sm hover:border-halo/60"
          >
            Salva la scelta
          </button>
          <button
            type="button"
            onClick={() => save({ analytics: false, marketing: false })}
            className="rounded-full px-5 py-3 text-sm text-ivory-dim hover:text-ivory"
          >
            Solo necessari
          </button>
        </div>
      </div>
    </div>
  );
}
