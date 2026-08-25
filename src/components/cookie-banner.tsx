"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const KEY = "halo-cookie-consent-v2";

function hasDecision() {
  try {
    return Boolean(window.localStorage.getItem(KEY));
  } catch {
    return true;
  }
}

export function CookieBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(!hasDecision());
  }, []);

  if (!open) return null;

  const accept = () => {
    try {
      window.localStorage.setItem(
        KEY,
        JSON.stringify({ necessary: true, decidedAt: new Date().toISOString() }),
      );
    } catch {
      // ignore
    }
    setOpen(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-[90] p-4 md:p-6">
      <div className="mx-auto max-w-3xl rounded-3xl border border-ink-line bg-ink-soft/95 p-5 shadow-2xl backdrop-blur-xl sm:p-6">
        <p className="text-xs uppercase tracking-[0.28em] text-halo">Cookie</p>
        <p className="mt-3 font-display text-3xl leading-none">Solo i cookie necessari.</p>
        <p className="mt-3 text-sm leading-relaxed text-ivory-dim">
          Usiamo solo cookie tecnici: sessione, carrello, sicurezza. Non misuriamo
          visite e non usiamo pubblicità. L&apos;iscrizione alla newsletter è a parte,
          nel popup al primo ingresso.{" "}
          <Link href="/cookie" className="text-halo-bright underline underline-offset-4">
            Informativa cookie
          </Link>
          .
        </p>
        <div className="mt-6">
          <button
            type="button"
            onClick={accept}
            className="rounded-full bg-ivory px-5 py-3 text-sm font-medium text-ink"
          >
            Ho capito
          </button>
        </div>
      </div>
    </div>
  );
}
