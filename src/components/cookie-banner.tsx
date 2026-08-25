"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEYS = ["halo-cookie-consent-v1", "halo-cookie-consent-v2"] as const;
const COOKIE = "halo_cookie_ok";
const YEAR = 60 * 60 * 24 * 365;

function readCookie(name: string) {
  return document.cookie.split(";").some((part) => part.trim().startsWith(`${name}=`));
}

function hasDecision() {
  try {
    if (STORAGE_KEYS.some((key) => window.localStorage.getItem(key))) return true;
    if (readCookie(COOKIE)) return true;
  } catch {
    return true;
  }
  return false;
}

function remember() {
  const payload = JSON.stringify({ necessary: true, decidedAt: new Date().toISOString() });
  try {
    for (const key of STORAGE_KEYS) window.localStorage.setItem(key, payload);
  } catch {
    // ignore
  }
  try {
    document.cookie = `${COOKIE}=1; Max-Age=${YEAR}; Path=/; SameSite=Lax`;
  } catch {
    // ignore
  }
}

export function CookieBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (hasDecision()) {
      remember();
      setOpen(false);
      return;
    }
    setOpen(true);
  }, []);

  if (!open) return null;

  const accept = () => {
    remember();
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
