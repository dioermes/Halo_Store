"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  bodyFonts,
  DEFAULT_BODY_FONT,
  DEFAULT_DISPLAY_FONT,
  displayFontGroups,
  displayFonts,
  displayFontStack,
  resolveBodyFont,
  resolveDisplayFont,
  type DisplayFontGroup,
} from "@/lib/display-fonts";

const GROUP_LABEL: Record<DisplayFontGroup, string> = {
  Serif: "Serif",
  Sans: "Sans",
  Script: "Script",
};

export function DisplayFontPicker({
  initialId,
  variant = "title",
}: {
  initialId: string;
  variant?: "title" | "section" | "product" | "body";
}) {
  const isBody = variant === "body";
  const optional = variant === "section" || variant === "product";
  const fonts = isBody ? bodyFonts : displayFonts;
  const resolve = isBody ? resolveBodyFont : resolveDisplayFont;
  const [id, setId] = useState(optional ? initialId : initialId || (isBody ? DEFAULT_BODY_FONT : DEFAULT_DISPLAY_FONT));
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const inherited = optional && !id;
  const font = resolve(inherited ? DEFAULT_DISPLAY_FONT : id);
  const stack = useMemo(() => (inherited ? "var(--font-display)" : displayFontStack(id)), [id, inherited]);
  const fieldName = isBody ? "bodyFont" : variant === "section" ? "sectionTitleFont" : variant === "product" ? "productNameFont" : "displayFont";
  const legend = isBody ? "Carattere dei testi" : variant === "section" ? "Carattere dei titoli delle sezioni" : variant === "product" ? "Carattere dei nomi dei prodotti" : "Carattere dei titoli";
  const sample = variant === "product" ? "Camicia in lino" : "Nuovi arrivi";

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
      <legend className="px-1 font-display text-2xl">
        {legend}
      </legend>
      <p className="text-sm leading-relaxed text-ivory-dim">
        {variant === "section"
          ? "Vale solo per i titoli delle sezioni della home (Nuovi arrivi, I più venduti, Saldi) e il catalogo. Se scegli «Come i titoli» usa il carattere dei titoli generali."
          : variant === "product"
          ? "Vale solo per il nome dei capi: schede prodotto, pagina del capo e carrello. Se scegli «Come i titoli» usa il carattere dei titoli generali."
          : isBody
          ? "Vale per il testo normale del sito: descrizioni, menu, pulsanti, moduli e paragrafi. I titoli hanno la loro scelta separata."
          : "Vale per le scritte grandi della vetrina: sezioni della home (Nuovi arrivi, I più venduti, Saldi), catalogo, e in generale i titoli del sito. Il testo normale ha la sua scelta separata."}{" "}
        I caratteri sono già sul sito: cambiarli non richiede Google né i cookie.
      </p>
      <input type="hidden" name={fieldName} value={inherited ? "" : font.id} />
      <div ref={rootRef} className="relative">
        <p className="text-sm text-ivory-dim">Famiglia</p>
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="mt-2 flex w-full items-center justify-between gap-3 rounded-xl border border-ink-line bg-ink/60 px-4 py-3 text-left text-ivory"
        >
          <span className="min-w-0 truncate text-2xl leading-none" style={{ fontFamily: stack, fontWeight: font.weight }}>
            {inherited ? "Come i titoli" : font.label}
          </span>
          <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
        </button>
        {open ? (
          <div
            role="listbox"
            aria-label="Caratteri"
            className="halo-scrollbar absolute z-30 mt-2 max-h-80 w-full overflow-y-auto rounded-xl border border-ink-line bg-ink py-2 shadow-xl"
          >
            {optional ? (
              <button
                type="button"
                role="option"
                aria-selected={inherited}
                onClick={() => {
                  setId("");
                  setOpen(false);
                }}
                className={`flex w-full items-baseline justify-between gap-3 px-4 py-2.5 text-left text-lg text-ivory ${
                  inherited ? "bg-ivory/10" : "hover:bg-ivory/10"
                }`}
              >
                Come i titoli
                {inherited ? (
                  <span className="shrink-0 text-[10px] uppercase tracking-[0.18em] text-halo-bright">in uso</span>
                ) : null}
              </button>
            ) : null}
            {displayFontGroups.filter((group) => fonts.some((row) => row.group === group)).map((group) => (
              <div key={group} className="px-1">
                <p className="px-3 pb-1 pt-3 text-[11px] uppercase tracking-[0.22em] text-ivory-dim">
                  {GROUP_LABEL[group]}
                </p>
                {fonts
                  .filter((row) => row.group === group)
                  .map((row) => {
                    const selected = !inherited && row.id === font.id;
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
                          style={{ fontFamily: displayFontStack(row.id), fontWeight: row.weight }}
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
        <span
          className={`mt-3 block leading-none ${isBody ? "text-lg" : "text-[clamp(2rem,6vw,3.4rem)]"}`}
          style={{ fontFamily: stack, fontWeight: font.weight }}
        >
          {isBody ? "Capi scelti uno per uno, ritiro in negozio o spedizione in Italia." : sample}
        </span>
        {isBody || variant === "product" ? null : (
          <span className="mt-3 block text-2xl" style={{ fontFamily: stack, fontWeight: font.weight }}>
            I più venduti
          </span>
        )}
      </p>
    </fieldset>
  );
}
