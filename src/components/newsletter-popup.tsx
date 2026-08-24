"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const KEY = "halo-newsletter-popup-v1";
const fieldClass =
  "mt-2 w-full rounded-xl border border-ink-line bg-ink/60 px-3 py-3 text-ivory";

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

export function NewsletterPopup() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [percent, setPercent] = useState(10);
  const [birthdayPercent, setBirthdayPercent] = useState(15);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const hidden =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up");

  useEffect(() => {
    if (hidden || alreadySeen()) return;
    const timer = window.setTimeout(() => setOpen(true), 700);
    void fetch("/api/newsletter/subscribe")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { newsletterPercent?: number; birthdayPercent?: number } | null) => {
        if (typeof data?.newsletterPercent === "number") setPercent(data.newsletterPercent);
        if (typeof data?.birthdayPercent === "number") setBirthdayPercent(data.birthdayPercent);
      })
      .catch(() => undefined);
    return () => window.clearTimeout(timer);
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
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Iscrizione non riuscita.");
      setDone(true);
      markSeen();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#3f1521]/35 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="halo-newsletter-title"
        className="w-full max-w-md rounded-[2rem] border border-ink-line bg-ink-soft p-6 shadow-2xl sm:p-8"
      >
        {done ? (
          <>
            <p className="text-xs uppercase tracking-[0.28em] text-halo">Halo Store</p>
            <h2 id="halo-newsletter-title" className="mt-3 font-display text-4xl leading-none">
              È nella tua inbox.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-ivory-dim">
              Apri la mail: dentro c&apos;è il codice di benvenuto, da usare una volta in cassa.
              Il giorno del compleanno ti scriviamo di nuovo, in privato.
            </p>
            <button
              type="button"
              onClick={close}
              className="mt-6 w-full rounded-full bg-ivory py-3 text-sm font-medium text-ink"
            >
              Continua a scegliere
            </button>
          </>
        ) : (
          <form onSubmit={(event) => void submit(event)}>
            <p className="text-xs uppercase tracking-[0.28em] text-halo">Halo Newsletter</p>
            <h2 id="halo-newsletter-title" className="mt-3 font-display text-4xl leading-none">
              Resta aggiornato con le nostre novità,per te un codice sconto iniziale.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-ivory-dim">
              Iscriviti e ricevi: {percent}% sul primo ordine e se inserisci la data del tuo
              compleanno il regalo te lo facciamo noi! Riceverai un&apos;ulteriore codice sconto
              del {birthdayPercent}%, da utilizzare entro 14 giorni dal rilascio.
            </p>
            <label className="mt-6 block text-sm text-ivory-dim">
              Email
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                className="mt-2 w-full rounded-xl border border-ink-line bg-ink/60 px-4 py-3 text-ivory"
              />
            </label>
            <fieldset className="mt-4">
              <legend className="text-sm text-ivory-dim">Compleanno</legend>
              <div className="grid grid-cols-3 gap-2">
                <label className="block text-xs text-ivory-dim">
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
                <label className="block text-xs text-ivory-dim">
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
                <label className="block text-xs text-ivory-dim">
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
              <p className="mt-2 text-xs leading-relaxed text-ivory-dim">
                Lo usiamo solo per l&apos;augurio. Non lo mostriamo a nessuno.
              </p>
            </fieldset>
            {error && <p className="mt-3 text-sm text-halo">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-full bg-ivory py-3 text-sm font-medium text-ink disabled:opacity-40"
            >
              {loading ? "Un attimo…" : "Voglio il benvenuto"}
            </button>
            <button
              type="button"
              onClick={close}
              className="mt-3 w-full py-2 text-sm text-ivory-dim underline underline-offset-4"
            >
              Continua senza
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
