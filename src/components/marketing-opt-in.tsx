"use client";

import { useState } from "react";

export function MarketingOptIn({ initial }: { initial: boolean }) {
  const [on, setOn] = useState(initial);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const save = async (next: boolean) => {
    const previous = on;
    setOn(next);
    setSaved(false);
    setError("");
    const response = await fetch("/api/account/consents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email_marketing: next }),
    });
    if (!response.ok) {
      setOn(previous);
      setError("Non è stato possibile salvare. Riprova.");
      return;
    }
    setSaved(true);
  };

  return (
    <div className="mt-4">
      <label className="flex items-start gap-3 text-sm leading-relaxed">
        <input
          type="checkbox"
          checked={on}
          onChange={(event) => void save(event.target.checked)}
          className="mt-1 accent-halo"
        />
        <span>
          Voglio ricevere email su offerte, nuovi capi, scorte in esaurimento e
          i codici sconto (benvenuto e compleanno). È un consenso a parte dai
          cookie.
        </span>
      </label>
      {saved && <p className="mt-2 text-xs text-halo-bright">Preferenza salvata.</p>}
      {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
    </div>
  );
}
