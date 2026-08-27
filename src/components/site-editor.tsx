"use client";

import { useState } from "react";
import { saveSiteAppearanceAction, saveSiteMediaSlotAction } from "@/app/admin/actions";
import { uploadAdminFile } from "@/lib/admin-upload";
import { merchKindFromFile, type CatalogTag, type SiteAppearance } from "@/lib/site";
import { DisplayFontPicker } from "@/components/display-font-picker";
import { HomeSectionsEditor } from "@/components/home-sections-editor";
import type { Product } from "@/lib/products";

const fieldClass =
  "mt-2 w-full rounded-xl border border-ink-line bg-ink/60 px-4 py-3 text-ivory outline-none";

async function uploadMedia(file: File, onStatus?: (message: string) => void) {
  const url = await uploadAdminFile(file, onStatus);
  return { url, kind: merchKindFromFile(file) };
}

function MediaFields({
  prefix,
  label,
  hint,
  appearance,
}: {
  prefix: "heroDesktop" | "heroMobile";
  label: string;
  hint: string;
  appearance: SiteAppearance;
}) {
  const initial = appearance[prefix];
  const [url, setUrl] = useState(initial.url);
  const [kind, setKind] = useState(initial.kind);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const [saved, setSaved] = useState(false);

  return (
    <fieldset className="grid gap-3 rounded-2xl border border-ink-line bg-ink/40 p-5">
      <legend className="px-1 font-display text-2xl">{label}</legend>
      <p className="text-sm text-ivory-dim">
        {hint} Comprimiamo foto e video da soli in caricamento. Si salva da solo: non serve il tasto
        in fondo.
      </p>
      {url ? (
        <div className="relative aspect-video overflow-hidden rounded-xl border border-ink-line bg-ink">
          {kind === "video" ? (
            <video src={url} className="h-full w-full object-cover" muted playsInline controls />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="h-full w-full object-cover" />
          )}
        </div>
      ) : null}
      <input type="hidden" name={`${prefix}Url`} value={url} />
      <input type="hidden" name={`${prefix}Kind`} value={kind} />
      <label className="text-sm text-ivory-dim">
        Indirizzo file
        <input
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          className={fieldClass}
          placeholder="https://… oppure carica sotto"
        />
      </label>
      <label className="text-sm text-ivory-dim">
        Tipo
        <select
          value={kind}
          onChange={(event) => setKind(event.target.value === "video" ? "video" : "image")}
          className={fieldClass}
        >
          <option value="image">Immagine</option>
          <option value="video">Video</option>
        </select>
      </label>
      <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-full border border-ink-line px-4 py-2 text-sm">
        {busy || "Carica foto o video"}
        <input
          type="file"
          accept="image/*,video/*"
          className="sr-only"
          disabled={Boolean(busy)}
          onChange={async (event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;
            setBusy("Comprimo…");
            setError("");
            try {
              const uploaded = await uploadMedia(file, setBusy);
              await saveSiteMediaSlotAction(prefix, uploaded.url, uploaded.kind);
              setUrl(uploaded.url);
              setKind(uploaded.kind);
              setSaved(true);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Caricamento non riuscito");
            } finally {
              setBusy("");
            }
          }}
        />
      </label>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      {saved ? <p className="text-sm text-halo">Salvato. Lo vedi in home dopo un refresh.</p> : null}
    </fieldset>
  );
}

function ColorField({
  name,
  label,
  value,
  onChange,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const pickerValue = /^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000";

  return (
    <label className="text-sm text-ivory-dim">
      {label}
      <span className="mt-2 flex items-center gap-3">
        <input
          type="color"
          value={pickerValue}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-14 cursor-pointer rounded-lg border border-ink-line bg-ink/60 p-1"
        />
        <input
          name={name}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`${fieldClass} mt-0`}
          pattern="^#([0-9A-Fa-f]{6})$"
          placeholder="#dc2626"
        />
      </span>
    </label>
  );
}

function SoldOutColorFields({ appearance }: { appearance: SiteAppearance }) {
  const [bg, setBg] = useState(appearance.soldOutBadgeBg);
  const [fg, setFg] = useState(appearance.soldOutBadgeFg);

  return (
    <fieldset className="grid gap-4 rounded-2xl border border-ink-line bg-ink/40 p-5">
      <legend className="px-1 font-display text-2xl">Etichetta Esaurito</legend>
      <p className="text-sm text-ivory-dim">
        Colori della scritta che compare sulle card quando un capo è esaurito.
      </p>
      <div className="flex items-center gap-3">
        <span
          className="rounded-full px-3 py-1.5 text-xs uppercase tracking-[0.16em]"
          style={{ backgroundColor: bg, color: fg }}
        >
          Esaurito
        </span>
        <span className="text-xs text-ivory-dim">Anteprima</span>
      </div>
      <ColorField name="soldOutBadgeBg" label="Sfondo" value={bg} onChange={setBg} />
      <ColorField name="soldOutBadgeFg" label="Testo" value={fg} onChange={setFg} />
    </fieldset>
  );
}

export function SiteEditor({
  appearance,
  products = [],
  tags = [],
}: {
  appearance: SiteAppearance;
  products?: Product[];
  tags?: CatalogTag[];
}) {
  return (
    <form action={saveSiteAppearanceAction} className="grid max-w-2xl gap-10">
      <div>
        <h2 className="font-display text-3xl">Modifica sito</h2>
        <p className="mt-3 text-sm leading-relaxed text-ivory-dim">
          Qui si cambiano hero, il carattere dei titoli, le sezioni della home e i colori
          dell&apos;etichetta Esaurito.
        </p>
      </div>

      <MediaFields
        prefix="heroDesktop"
        label="Hero desktop"
        hint="Formato orizzontale, a tutto schermo sul computer."
        appearance={appearance}
      />
      <MediaFields
        prefix="heroMobile"
        label="Hero telefono"
        hint="Formato verticale, a tutto schermo sul telefono."
        appearance={appearance}
      />
      <DisplayFontPicker initialId={appearance.displayFont} />
      <HomeSectionsEditor sections={appearance.homeSections} products={products} tags={tags} />

      <SoldOutColorFields appearance={appearance} />

      <button type="submit" className="rounded-full bg-ivory py-3 text-sm font-medium text-ink">
        Salva il sito
      </button>
    </form>
  );
}
