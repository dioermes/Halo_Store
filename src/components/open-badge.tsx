"use client";

import { useEffect, useState } from "react";
import { getOpenState, type OpenState } from "@/lib/opening-hours";

/**
 * Stato di apertura calcolato sul fuso dell'utente.
 * Renderizzato solo dopo il mount per evitare disallineamenti fra server e client.
 */
export function OpenBadge({ compact = false }: { compact?: boolean }) {
  const [state, setState] = useState<OpenState | null>(null);

  useEffect(() => {
    const update = () => setState(getOpenState());
    update();
    const interval = window.setInterval(update, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  if (!state) {
    return (
      <span
        className={`inline-flex items-center gap-2 rounded-full border border-ink-line px-3 py-1.5 text-xs text-ivory-dim ${
          compact ? "" : "text-sm"
        }`}
      >
        <span className="h-2 w-2 rounded-full bg-ink-line" />
        Orari in aggiornamento
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 ${
        state.isOpen
          ? "border-halo/40 bg-halo/10 text-halo-bright"
          : "border-ink-line bg-ink-soft/60 text-ivory-dim"
      } ${compact ? "text-xs" : "text-sm"}`}
    >
      <span className="relative flex h-2 w-2">
        {state.isOpen && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-halo opacity-70" />
        )}
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${
            state.isOpen ? "bg-halo" : "bg-ivory-dim/50"
          }`}
        />
      </span>
      <span className="font-medium">{state.isOpen ? "Aperto ora" : "Chiuso"}</span>
      <span aria-hidden className="text-ivory-dim/60">
        ·
      </span>
      <span className="text-ivory-dim">{state.detail}</span>
    </span>
  );
}
