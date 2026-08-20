"use client";

import { useState } from "react";
import Link from "next/link";

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
          Voglio ricevere email su offerte, nuovi capi e scorte in esaurimento.
          Non è spuntata di default: è un consenso a parte dai cookie.{" "}
          <Link href="/account/preferenze" className="text-halo-bright underline underline-offset-4">
            Preferenze
          </Link>
        </span>
      </label>
      {saved && <p className="mt-2 text-xs text-halo-bright">Preferenza salvata.</p>}
      {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
    </div>
  );
}
