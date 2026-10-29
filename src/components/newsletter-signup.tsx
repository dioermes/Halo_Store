"use client";

import { useState } from "react";
import { InstagramGlyph, TikTokGlyph } from "@/components/icons";
import { storeConfig } from "@/lib/store-config";

export function NewsletterSignup({
  imageUrl,
  percent,
}: {
  imageUrl: string;
  percent: number;
}) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "footer" }),
      });
      const payload = (await response.json()) as { error?: string; already?: boolean };
      if (!response.ok) throw new Error(payload.error ?? "Iscrizione non riuscita.");
      setMessage(
        payload.already
          ? "Questa email è già iscritta alla newsletter."
          : "Iscrizione completata. Controlla la tua email per il codice di benvenuto.",
      );
      setEmail("");
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Iscrizione non riuscita.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <section
      aria-labelledby="newsletter-signup-title"
      className="relative isolate overflow-hidden bg-[#171717] px-5 py-20 text-white sm:py-24"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,.68), rgba(0,0,0,.72)), url("${imageUrl}")`,
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <div className="mx-auto max-w-2xl text-center">
        <h2
          id="newsletter-signup-title"
          className="font-display text-3xl tracking-[0.08em] sm:text-4xl"
        >
          ENTRA NEL MONDO DI HALO
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-xs uppercase leading-relaxed tracking-wide text-white/90 sm:text-sm">
          Iscriviti alla nostra newsletter e ricevi il {percent}% di sconto sul tuo primo
          ordine. Accesso esclusivo a drop, restock e promo riservate.
        </p>

        <form onSubmit={(event) => void submit(event)} className="mx-auto mt-8 max-w-xl">
          <div className="flex flex-col sm:flex-row">
            <label htmlFor="newsletter-signup-email" className="sr-only">
              La tua email
            </label>
            <input
              id="newsletter-signup-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="LA TUA EMAIL"
              className="min-w-0 flex-1 border border-white/55 bg-black/25 px-4 py-4 text-sm text-white outline-none placeholder:text-white/70 focus:border-white"
            />
            <button
              type="submit"
              disabled={busy}
              className="bg-white px-8 py-4 text-xs font-semibold tracking-[0.22em] text-black transition-colors hover:bg-white/85 disabled:opacity-60"
            >
              {busy ? "UN ATTIMO…" : "ISCRIVITI"}
            </button>
          </div>
          <label className="mt-3 flex items-start justify-center gap-2 text-xs leading-relaxed text-white/90">
            <input type="checkbox" required className="mt-0.5 accent-white" />
            <span>
              Iscrivendoti accetti l&apos;
              <a href="/privacy" className="underline underline-offset-2">
                informativa privacy
              </a>{" "}
              e di ricevere comunicazioni promozionali. Puoi disiscriverti in ogni momento.
            </span>
          </label>
          {message ? (
            <p role="status" className="mt-4 text-sm text-white">
              {message}
            </p>
          ) : null}
          {error ? (
            <p role="alert" className="mt-4 text-sm text-red-200">
              {error}
            </p>
          ) : null}
        </form>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          <a
            href={storeConfig.instagram.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-white hover:text-white/75"
          >
            <InstagramGlyph className="h-5 w-5" />
            SEGUICI SU INSTAGRAM
          </a>
          <a
            href={storeConfig.tiktok.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-white hover:text-white/75"
          >
            <TikTokGlyph className="h-5 w-5" />
            SEGUICI SU TIKTOK
          </a>
        </div>
      </div>
    </section>
  );
}
