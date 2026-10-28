"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { CONSENT_CHANGED, hasConsentDecision } from "@/lib/consent";

const KEY = "halo-newsletter-popup-v1";
export const HALO_NEWSLETTER_EVENT = "halo-open-newsletter";
const fieldClass =
  "mt-1.5 w-full rounded-md border border-[#ded8da] bg-white px-2 py-2 text-xs text-[#171717] placeholder:text-[#777] sm:mt-2 sm:rounded-lg sm:px-3 sm:py-2.5 sm:text-sm";

export function requestNewsletterPopup() {
  window.dispatchEvent(new Event(HALO_NEWSLETTER_EVENT));
}
function alreadySeen() {
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return true;
  }
}

function markSeen() {
  try {
    window.localStorage.setItem(KEY, "1");
  } catch {
    // ignore
  }
}

function onlyDigits(value: string, max: number) {
  return value.replace(/\D/g, "").slice(0, max);
}

function toIsoBirthday(day: string, month: string, year: string) {
  if (year.length !== 4 || month.length === 0 || day.length === 0) return "";
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

export function NewsletterPopup({ imageUrl }: { imageUrl: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [percent, setPercent] = useState(10);
  const [birthdayPercent, setBirthdayPercent] = useState(15);
  const [birthdayValidDays, setBirthdayValidDays] = useState(14);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [alreadySubscribed, setAlreadySubscribed] = useState(false);

  const hidden =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up");

  useEffect(() => {
    const loadOffer = () => {
      void fetch("/api/newsletter/subscribe")
        .then((response) => (response.ok ? response.json() : null))
        .then(
          (data: {
            newsletterPercent?: number;
            birthdayPercent?: number;
            birthdayValidDays?: number;
          } | null) => {
            if (typeof data?.newsletterPercent === "number") setPercent(data.newsletterPercent);
            if (typeof data?.birthdayPercent === "number") setBirthdayPercent(data.birthdayPercent);
            if (typeof data?.birthdayValidDays === "number") setBirthdayValidDays(data.birthdayValidDays);
          },
        )
        .catch(() => undefined);
    };

    const openForced = () => {
      setDone(false);
      setAlreadySubscribed(false);
      setError("");
      setOpen(true);
      loadOffer();
    };

    window.addEventListener(HALO_NEWSLETTER_EVENT, openForced);

    if (hidden || alreadySeen()) {
      return () => window.removeEventListener(HALO_NEWSLETTER_EVENT, openForced);
    }

    const tryOpen = () => {
      if (!hasConsentDecision() || alreadySeen()) return;
      setOpen(true);
      loadOffer();
    };

    let timer: number | undefined;
    if (hasConsentDecision()) {
      timer = window.setTimeout(tryOpen, 700);
    }
    window.addEventListener(CONSENT_CHANGED, tryOpen);
    return () => {
      if (timer) window.clearTimeout(timer);
      window.removeEventListener(HALO_NEWSLETTER_EVENT, openForced);
      window.removeEventListener(CONSENT_CHANGED, tryOpen);
    };
  }, [hidden]);

  if (hidden || !open) return null;

  const close = () => {
    markSeen();
    setOpen(false);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    const birthday = toIsoBirthday(day, month, year);
    if (!birthday) {
      setError("Inserisci giorno, mese e un anno di 4 cifre.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, birthday }),
      });
      const payload = (await response.json()) as { error?: string; already?: boolean };
      if (!response.ok) throw new Error(payload.error ?? "Iscrizione non riuscita.");
      setAlreadySubscribed(Boolean(payload.already));
      setDone(true);
      markSeen();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-1 sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="halo-newsletter-title"
        className="relative flex h-[62dvh] min-h-[390px] w-full max-w-none overflow-hidden rounded-xl bg-white text-[#171717] shadow-2xl sm:h-auto sm:max-h-[92dvh] sm:min-h-[520px] sm:max-w-3xl sm:rounded-2xl"
      >
        <div className="relative min-h-0 w-1/2 shrink-0 self-stretch bg-[#171717] sm:min-h-[520px] sm:w-[42%]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
        </div>
        <div className="relative min-w-0 flex-1 overflow-y-auto px-3 pb-3 pt-10 sm:p-8">
          <button
            type="button"
            onClick={close}
            aria-label="Chiudi popup newsletter"
            className="absolute right-2 top-1 z-10 flex h-7 w-7 items-center justify-center text-xl leading-none text-[#171717] hover:text-black sm:right-4 sm:top-4"
          >
            ×
          </button>
          {done ? (
            <>
              <p className="text-[9px] uppercase tracking-[0.18em] text-[#555] sm:text-xs sm:tracking-[0.28em]">
                Halo Store
              </p>
              <h2
                id="halo-newsletter-title"
                className="mt-3 font-display text-2xl leading-none text-[#171717] sm:text-4xl"
              >
                {alreadySubscribed ? "Sei già iscritto." : "È nella tua inbox."}
              </h2>
              <p className="mt-4 text-xs leading-relaxed text-[#555] sm:text-sm">
                {alreadySubscribed
                  ? "Questa email è già iscritta alla newsletter."
                  : "Apri la mail: dentro c'è il codice di benvenuto, da usare una volta in cassa. Il giorno del compleanno ti scriviamo di nuovo, in privato."}
              </p>
              <button
                type="button"
                onClick={close}
                className="mt-6 w-full rounded-md bg-black py-2 text-xs font-medium text-white sm:py-3 sm:text-sm"
              >
                Continua a scegliere
              </button>
            </>
          ) : (
            <form onSubmit={(event) => void submit(event)}>
              <p className="text-[9px] uppercase tracking-[0.18em] text-[#555] sm:text-xs sm:tracking-[0.28em]">
                Halo Newsletter
              </p>
              <h2
                id="halo-newsletter-title"
                className="mt-2 font-display text-[clamp(1.45rem,6.8vw,2.1rem)] uppercase leading-[0.92] text-[#171717] sm:mt-3 sm:text-4xl sm:leading-none"
              >
                Ricevi il {percent}% sul primo ordine
              </h2>
              <p className="mt-2 text-[10px] leading-snug text-[#555] sm:mt-4 sm:text-sm">
                Iscriviti alla newsletter. In più, ricevi un regalo per il compleanno.
              </p>
              <label className="mt-3 block text-xs text-[#333] sm:mt-6 sm:text-sm">
                Email
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  placeholder="Email"
                  className={fieldClass}
                />
              </label>
              <fieldset className="mt-2 sm:mt-4">
                <legend className="text-xs text-[#333] sm:text-sm">Compleanno</legend>
                <div className="grid grid-cols-3 gap-2">
                  <label className="block text-[9px] text-[#333] sm:text-xs">
                    Giorno
                    <input
                      inputMode="numeric"
                      autoComplete="bday-day"
                      required
                      maxLength={2}
                      placeholder="GG"
                      value={day}
                      onChange={(event) => setDay(onlyDigits(event.target.value, 2))}
                      className={fieldClass}
                    />
                  </label>
                  <label className="block text-[9px] text-[#333] sm:text-xs">
                    Mese
                    <input
                      inputMode="numeric"
                      autoComplete="bday-month"
                      required
                      maxLength={2}
                      placeholder="MM"
                      value={month}
                      onChange={(event) => setMonth(onlyDigits(event.target.value, 2))}
                      className={fieldClass}
                    />
                  </label>
                  <label className="block text-[9px] text-[#333] sm:text-xs">
                    Anno
                    <input
                      inputMode="numeric"
                      autoComplete="bday-year"
                      required
                      maxLength={4}
                      placeholder="AAAA"
                      value={year}
                      onChange={(event) => setYear(onlyDigits(event.target.value, 4))}
                      onPaste={(event) => {
                        event.preventDefault();
                        setYear(onlyDigits(event.clipboardData.getData("text"), 4));
                      }}
                      className={fieldClass}
                    />
                  </label>
                </div>
                <p className="mt-1.5 text-[9px] leading-relaxed text-[#666] sm:mt-2 sm:text-xs">
                  Ti invieremo un codice del {birthdayPercent}% valido per {birthdayValidDays}{" "}
                  {birthdayValidDays === 1 ? "giorno" : "giorni"}.
                </p>
              </fieldset>
              {error && <p className="mt-3 text-sm text-halo">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="mt-3 w-full rounded-md bg-black py-2 text-[10px] font-medium text-white disabled:opacity-40 sm:mt-6 sm:py-3 sm:text-sm"
              >
                {loading ? "Un attimo…" : "Voglio il benvenuto"}
              </button>
              <p className="mt-2 text-[9px] leading-relaxed text-[#666] sm:mt-3 sm:text-xs">
                Iscrivendoti acconsenti a ricevere email promozionali. Informativa:{" "}
                <a href="/privacy" className="underline underline-offset-4">
                  Privacy
                </a>
                . Puoi disiscriverti in qualsiasi momento sulle impostazioni del profilo.
              </p>
              <button
                type="button"
                onClick={close}
                className="mt-1.5 w-full py-1 text-[10px] text-[#444] underline underline-offset-4 sm:mt-3 sm:py-2 sm:text-sm"
              >
                Continua senza
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
