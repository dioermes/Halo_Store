"use client";

import { useState } from "react";
import { saveSiteAppearanceAction, saveSiteMediaSlotAction } from "@/app/admin/actions";
import { uploadAdminFile } from "@/lib/admin-upload";
import { merchKindFromFile, type SiteAppearance } from "@/lib/site";
import type { Product } from "@/lib/products";

const fieldClass =
  "mt-2 w-full rounded-xl border border-ink-line bg-ink/60 px-4 py-3 text-ivory outline-none";

async function uploadMedia(file: File) {
  const url = await uploadAdminFile(file);
  return { url, kind: merchKindFromFile(file) };
}

function MediaFields({
  prefix,
  label,
  hint,
  appearance,
}: {
  prefix: "heroDesktop" | "heroMobile" | "interlude";
  label: string;
  hint: string;
  appearance: SiteAppearance;
}) {
  const initial = appearance[prefix];
  const [url, setUrl] = useState(initial.url);
  const [kind, setKind] = useState(initial.kind);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [saved, setSaved] = useState(false);

  return (
    <fieldset className="grid gap-3 rounded-2xl border border-ink-line bg-ink/40 p-5">
      <legend className="px-1 font-display text-2xl">{label}</legend>
      <p className="text-sm text-ivory-dim">
        {hint} Video fino a 50 MB. Il caricamento salva da solo: non serve il tasto in fondo.
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
        {busy ? "Carico…" : "Carica foto o video"}
        <input
          type="file"
          accept="image/*,video/*"
          className="sr-only"
          disabled={busy}
          onChange={async (event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;
            setBusy(true);
            setError("");
            try {
              const uploaded = await uploadMedia(file);
              await saveSiteMediaSlotAction(prefix, uploaded.url, uploaded.kind);
              setUrl(uploaded.url);
              setKind(uploaded.kind);
              setSaved(true);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Caricamento non riuscito");
            } finally {
              setBusy(false);
            }
          }}
        />
      </label>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      {saved ? <p className="text-sm text-halo">Salvato. Lo vedi in home dopo un refresh.</p> : null}
    </fieldset>
  );
}

function FeatureSlots({
  name,
  label,
  products = [],
  selected = [],
  tag,
}: {
  name: string;
  label: string;
  products?: Product[];
  selected?: string[];
  tag: "nuovo arrivo" | "best seller";
}) {
  const list = Array.isArray(products) ? products : [];
  const tagged = list.filter((product) =>
    tag === "nuovo arrivo" ? product.isNewArrival : product.isBestseller,
  );
  const optionId = (product: Product) => product.uuid || product.id;
  const matches = (product: Product, id: string) =>
    Boolean(id) && (product.uuid === id || product.id === id);
  const initial = [0, 1, 2, 3].map((index) => {
    const wanted = selected[index] ?? "";
    const hit = tagged.find((product) => matches(product, wanted));
    return hit ? optionId(hit) : "";
  });
  const [slots, setSlots] = useState(() => {
    const unique: string[] = [];
    for (const id of initial) {
      if (id && !unique.includes(id)) unique.push(id);
    }
    return [0, 1, 2, 3].map((index) => unique[index] ?? "");
  });

  const choose = (index: number, value: string) => {
    setSlots((current) =>
      current.map((slot, slotIndex) => {
        if (slotIndex === index) return value;
        if (value && slot === value) return "";
        return slot;
      }),
    );
  };

  return (
    <fieldset className="grid gap-3 rounded-2xl border border-ink-line bg-ink/40 p-5">
      <legend className="px-1 font-display text-2xl">{label}</legend>
      <p className="text-sm text-ivory-dim">
        Solo i capi con il tag {tag}. Scegli fino a quattro per la home, ciascuno una sola volta, oppure
        lascia vuoto per l&apos;ordine del catalogo.
      </p>
      {tagged.length === 0 ? (
        <>
          {[0, 1, 2, 3].map((index) => (
            <input key={index} type="hidden" name={`${name}${index + 1}`} value={selected[index] ?? ""} />
          ))}
          <p className="rounded-xl border border-ink-line bg-ink/50 px-4 py-3 text-sm text-ivory-dim">
            Nessun capo con questo tag. Aprilo nel catalogo, spunta {tag} e salva: poi ricompare qui.
          </p>
        </>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {[0, 1, 2, 3].map((index) => (
            <label key={index} className="text-sm text-ivory-dim">
              Posto {index + 1}
              <input type="hidden" name={`${name}${index + 1}`} value={slots[index]} />
              <select
                value={slots[index]}
                onChange={(event) => choose(index, event.target.value)}
                className={fieldClass}
              >
                <option value="">Nessuno</option>
                {tagged.map((product) => {
                  const id = optionId(product);
                  const taken = slots.some((slot, slotIndex) => slotIndex !== index && slot === id);
                  if (taken) return null;
                  return (
                    <option key={id} value={id}>
                      {product.name}
                    </option>
                  );
                })}
              </select>
            </label>
          ))}
        </div>
      )}
    </fieldset>
  );
}

export function SiteEditor({
  appearance,
  products = [],
}: {
  appearance: SiteAppearance;
  products?: Product[];
}) {
  return (
    <form action={saveSiteAppearanceAction} className="grid max-w-2xl gap-10">
      <div>
        <h2 className="font-display text-3xl">Modifica sito</h2>
        <p className="mt-3 text-sm leading-relaxed text-ivory-dim">
          Qui si cambiano hero, il passaggio visivo e i quattro capi in evidenza.
          Altre impostazioni di vetrina arriveranno in questa stessa pagina.
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
      <MediaFields
        prefix="interlude"
        label="Passaggio visivo"
        hint="Tra i nuovi arrivi e i best seller."
        appearance={appearance}
      />
      <FeatureSlots
        name="featuredNew"
        label="Nuovi arrivi in evidenza"
        products={products}
        selected={appearance.featuredNewIds}
        tag="nuovo arrivo"
      />
      <FeatureSlots
        name="featuredBest"
        label="Best seller in evidenza"
        products={products}
        selected={appearance.featuredBestIds}
        tag="best seller"
      />

      <button type="submit" className="rounded-full bg-ivory py-3 text-sm font-medium text-ink">
        Salva il sito
      </button>
    </form>
  );
}
