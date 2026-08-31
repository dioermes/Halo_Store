"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  DEFAULT_DISPLAY_FONT,
  displayFontGroups,
  displayFonts,
  displayFontStack,
  resolveDisplayFont,
  type DisplayFontGroup,
} from "@/lib/display-fonts";

const GROUP_LABEL: Record<DisplayFontGroup, string> = {
  Serif: "Serif",
  Sans: "Sans",
  Script: "Script",
};

export function DisplayFontPicker({ initialId }: { initialId: string }) {
  const [id, setId] = useState(initialId || DEFAULT_DISPLAY_FONT);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const font = resolveDisplayFont(id);
  const stack = useMemo(() => displayFontStack(id), [id]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <fieldset className="grid gap-3 rounded-2xl border border-ink-line bg-ink/40 p-5">
      <legend className="px-1 font-display text-2xl">Carattere dei titoli</legend>
      <p className="text-sm leading-relaxed text-ivory-dim">
        Vale per le scritte grandi della vetrina: sezioni della home (Nuovi arrivi, I più
        venduti, Saldi), catalogo, e in generale i titoli in corsivo/serif del sito. Il
        testo normale resta com&apos;è. I quindici caratteri sono già sul sito: cambiarli
        non richiede Google né i cookie.
      </p>
      <input type="hidden" name="displayFont" value={font.id} />
      <div ref={rootRef} className="relative">
        <p className="text-sm text-ivory-dim">Famiglia</p>
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="mt-2 flex w-full items-center justify-between gap-3 rounded-xl border border-ink-line bg-ink/60 px-4 py-3 text-left text-ivory"
        >
          <span className="min-w-0 truncate text-2xl leading-none" style={{ fontFamily: stack }}>
            {font.label}
          </span>
          <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
        </button>
        {open ? (
          <div
            role="listbox"
            aria-label="Caratteri"
            className="halo-scrollbar absolute z-30 mt-2 max-h-80 w-full overflow-y-auto rounded-xl border border-ink-line bg-ink py-2 shadow-xl"
          >
            {displayFontGroups.map((group) => (
              <div key={group} className="px-1">
                <p className="px-3 pb-1 pt-3 text-[11px] uppercase tracking-[0.22em] text-ivory-dim">
                  {GROUP_LABEL[group]}
                </p>
                {displayFonts
                  .filter((row) => row.group === group)
                  .map((row) => {
                    const selected = row.id === font.id;
                    return (
                      <button
                        key={row.id}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        onClick={() => {
                          setId(row.id);
                          setOpen(false);
                        }}
                        className={`flex w-full items-baseline justify-between gap-3 px-3 py-2.5 text-left ${
                          selected ? "bg-ivory/10" : "hover:bg-ivory/10"
                        }`}
                      >
                        <span
                          className="text-[1.65rem] leading-tight text-ivory"
                          style={{ fontFamily: displayFontStack(row.id) }}
                        >
                          {row.label}
                        </span>
                        {selected ? (
                          <span className="shrink-0 text-[10px] uppercase tracking-[0.18em] text-halo-bright">
                            in uso
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
              </div>
            ))}
          </div>
        ) : null}
      </div>
      <p className="rounded-xl border border-ink-line bg-ink/30 px-4 py-6 text-center text-ivory">
        <span className="block text-xs uppercase tracking-[0.28em] text-ivory-dim">Anteprima</span>
        <span className="mt-3 block text-[clamp(2rem,6vw,3.4rem)] leading-none" style={{ fontFamily: stack }}>
          Nuovi arrivi
        </span>
        <span className="mt-3 block text-2xl" style={{ fontFamily: stack }}>
          I più venduti
        </span>
      </p>
    </fieldset>
  );
}
