"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CONSENT_CHANGED,
  CONSENT_OPEN,
  embedsAllowed,
  hasConsentDecision,
  openCookieBanner,
  writeConsent,
} from "@/lib/consent";

export function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button type="button" onClick={() => openCookieBanner()} className={className}>
      Gestisci cookie
    </button>
  );
}

export function CookieBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sync = () => setOpen(!hasConsentDecision());
    sync();
    const reopen = () => setOpen(true);
    window.addEventListener(CONSENT_OPEN, reopen);
    window.addEventListener(CONSENT_CHANGED, sync);
    return () => {
      window.removeEventListener(CONSENT_OPEN, reopen);
      window.removeEventListener(CONSENT_CHANGED, sync);
    };
  }, []);

  if (!open) return null;

  const choose = (embeds: boolean) => {
    writeConsent(embeds);
    setOpen(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-[110] p-4 md:p-6">
      <div className="mx-auto max-w-3xl rounded-3xl border border-ink-line bg-ink-soft/95 p-5 shadow-2xl backdrop-blur-xl sm:p-6">
        <p className="text-xs uppercase tracking-[0.28em] text-halo">Cookie</p>
        <p className="mt-3 font-display text-3xl leading-none">La tua scelta sui cookie</p>
        <p className="mt-3 text-sm leading-relaxed text-ivory-dim">
          I cookie tecnici (account, carrello, sicurezza, pagamento in cassa) partono sempre:
          servono al sito. La mappa Google si carica solo se accetti i contenuti di terzi. I
          caratteri dei titoli sono già sul sito, non passano da Google. Non usiamo Analytics
          né pixel pubblicitari. La newsletter è un consenso a parte.{" "}
          <Link href="/cookie" className="text-halo-bright underline underline-offset-4">
            Informativa cookie
          </Link>
          {" · "}
          <Link href="/privacy" className="text-halo-bright underline underline-offset-4">
            Privacy
          </Link>
          .
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => choose(true)}
            className="rounded-full bg-ivory px-5 py-3 text-sm font-medium text-ink"
          >
            Accetta
          </button>
          <button
            type="button"
            onClick={() => choose(false)}
            className="rounded-full border border-ink-line px-5 py-3 text-sm"
          >
            Solo necessari
          </button>
        </div>
      </div>
    </div>
  );
}

export function useEmbedsAllowed() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const sync = () => setAllowed(embedsAllowed());
    sync();
    window.addEventListener(CONSENT_CHANGED, sync);
    return () => window.removeEventListener(CONSENT_CHANGED, sync);
  }, []);

  return allowed;
}
