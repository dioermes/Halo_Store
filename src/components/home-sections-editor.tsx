"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { createCatalogTagAction, saveHomeSectionInterludeAction } from "@/app/admin/actions";
import { uploadAdminFile } from "@/lib/admin-upload";
import {
  homeSectionSourceOptions,
  merchKindFromFile,
  productsForHomeSection,
  uniqueHomeSectionId,
  type CatalogTag,
  type HomeSection,
  type HomeSectionSource,
  type SiteMedia,
} from "@/lib/site";
import type { Product } from "@/lib/products";

const fieldClass =
  "mt-2 w-full rounded-xl border border-ink-line bg-ink/60 px-4 py-3 text-ivory outline-none";

function optionId(product: Product) {
  return product.uuid || product.id;
}

function FeaturedSlots({
  pool,
  selected,
  onChange,
}: {
  pool: Product[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const slots = [0, 1, 2, 3].map((index) => selected[index] ?? "");

  const choose = (index: number, value: string) => {
    const next = [...slots];
    next[index] = value;
    for (let i = 0; i < next.length; i += 1) {
      if (i !== index && value && next[i] === value) next[i] = "";
    }
    onChange(next.filter(Boolean));
  };

  if (pool.length === 0) {
    return (
      <p className="rounded-xl border border-ink-line bg-ink/50 px-4 py-3 text-sm text-ivory-dim">
        Quando ci sono capi in questa sezione, qui scegli fino a quattro da mettere in evidenza.
      </p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {[0, 1, 2, 3].map((index) => (
        <label key={index} className="text-sm text-ivory-dim">
          Posto {index + 1}
          <select
            value={slots[index]}
            onChange={(event) => choose(index, event.target.value)}
            className={fieldClass}
          >
            <option value="">Nessuno</option>
            {pool.map((product) => {
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
  );
}

function SectionInterlude({
  sectionId,
  media,
  onChange,
}: {
  sectionId: string;
  media: SiteMedia | null;
  onChange: (media: SiteMedia | null) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const enabled = Boolean(media);

  return (
    <div className="grid gap-3">
      <label className="flex items-center gap-3 text-sm text-ivory">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(event) => {
            onChange(event.target.checked ? media ?? { url: "", kind: "image" } : null);
          }}
        />
        Passaggio visivo dopo questa sezione
      </label>
      {enabled ? (
        <>
          <p className="text-sm text-ivory-dim">
            Foto o video a tutto schermo, come tra i nuovi arrivi e i best seller. Si carica da solo.
          </p>
          {media?.url ? (
            <div className="relative aspect-video overflow-hidden rounded-xl border border-ink-line bg-ink">
              {media.kind === "video" ? (
                <video src={media.url} className="h-full w-full object-cover" muted playsInline controls />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={media.url} alt="" className="h-full w-full object-cover" />
              )}
            </div>
          ) : null}
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
                  const url = await uploadAdminFile(file);
                  const kind = merchKindFromFile(file);
                  onChange({ url, kind });
                  await saveHomeSectionInterludeAction(sectionId, url, kind);
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Caricamento non riuscito");
                } finally {
                  setBusy(false);
                }
              }}
            />
          </label>
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
        </>
      ) : null}
    </div>
  );
}

export function HomeSectionsEditor({
  sections: initial,
  products,
  tags: initialTags = [],
}: {
  sections: HomeSection[];
  products: Product[];
  tags?: CatalogTag[];
}) {
  const [sections, setSections] = useState(initial);
  const [tags, setTags] = useState(initialTags);
  const [newTagLabel, setNewTagLabel] = useState("");
  const [tagBusy, setTagBusy] = useState(false);
  const list = Array.isArray(products) ? products : [];

  const update = (id: string, patch: Partial<HomeSection>) => {
    setSections((current) =>
      current.map((section) => (section.id === id ? { ...section, ...patch } : section)),
    );
  };

  const move = (index: number, direction: -1 | 1) => {
    setSections((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const addSection = () => {
    setSections((current) => {
      const id = uniqueHomeSectionId("Collezione", current.map((section) => section.id));
      return [
        ...current,
        {
          id,
          title: "Nuova sezione",
          source: "picks" as const,
          tagId: "",
          productIds: [],
          featuredIds: [],
          interlude: null,
        },
      ];
    });
  };

  const remove = (id: string) => {
    if (!window.confirm("Elimini questa sezione dalla home?")) return;
    setSections((current) => current.filter((section) => section.id !== id));
  };

  return (
    <div className="grid gap-6">
      <input type="hidden" name="homeSections" value={JSON.stringify(sections)} />
      <div>
        <h3 className="font-display text-2xl">Sezioni della home</h3>
        <p className="mt-2 text-sm leading-relaxed text-ivory-dim">
          Crea collezioni, togli una sezione fuori stagione o spostala in alto. L&apos;ordine qui è
          quello che vede chi apre il sito. Puoi anche creare un tag nuovo e usarlo come fonte della
          sezione: poi lo assegni ai capi nel catalogo.
        </p>
      </div>

      <div className="grid gap-3 rounded-2xl border border-ink-line bg-ink/40 p-5">
        <p className="font-display text-xl">Tag personalizzati</p>
        <p className="text-sm text-ivory-dim">
          Servono per una sezione futura, tipo collezione estate. Dopo aver creato il tag, sceglilo
          in «Cosa mostrare» e spuntalo sui capi nel catalogo.
        </p>
        {tags.length ? (
          <p className="text-sm text-ivory">
            {tags.map((tag) => tag.label).join(" · ")}
          </p>
        ) : (
          <p className="text-sm text-ivory-dim">Nessun tag extra per ora.</p>
        )}
        <div className="flex flex-wrap gap-2">
          <input
            value={newTagLabel}
            onChange={(event) => setNewTagLabel(event.target.value)}
            placeholder="Nome tag, es. Collezione estate"
            className={`${fieldClass} mt-0 min-w-[12rem] flex-1`}
          />
          <button
            type="button"
            disabled={tagBusy || !newTagLabel.trim()}
            onClick={async () => {
              const label = newTagLabel.trim();
              if (!label) return;
              setTagBusy(true);
              try {
                const tag = await createCatalogTagAction(label);
                setTags((current) =>
                  current.some((row) => row.id === tag.id) ? current : [...current, tag],
                );
                setNewTagLabel("");
              } finally {
                setTagBusy(false);
              }
            }}
            className="rounded-full border border-ink-line px-4 py-2 text-sm disabled:opacity-40"
          >
            {tagBusy ? "Creo…" : "Crea tag"}
          </button>
        </div>
      </div>

      {sections.length === 0 ? (
        <p className="rounded-2xl border border-ink-line bg-ink/40 px-4 py-3 text-sm text-ivory-dim">
          Nessuna sezione. Aggiungine una e scegli i capi da mostrare.
        </p>
      ) : null}

      {sections.map((section, index) => {
        const sourceMeta = homeSectionSourceOptions.find((option) => option.id === section.source);
        const pool = productsForHomeSection(section, list);
        const sourceValue =
          section.source === "tag" && section.tagId ? `tag:${section.tagId}` : section.source;
        const sourceHint =
          section.source === "tag"
            ? `Mostra i capi con il tag «${tags.find((tag) => tag.id === section.tagId)?.label ?? "…"}».`
            : sourceMeta?.hint;

        return (
          <fieldset key={section.id} className="grid gap-4 rounded-2xl border border-ink-line bg-ink/40 p-5">
            <legend className="px-1 font-display text-2xl">
              {index + 1}. {section.title || "Sezione"}
            </legend>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                className="inline-flex items-center gap-1 rounded-full border border-ink-line px-3 py-1.5 text-xs uppercase tracking-[0.14em] disabled:opacity-40"
              >
                <ArrowUp className="h-3.5 w-3.5" aria-hidden />
                Su
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === sections.length - 1}
                className="inline-flex items-center gap-1 rounded-full border border-ink-line px-3 py-1.5 text-xs uppercase tracking-[0.14em] disabled:opacity-40"
              >
                <ArrowDown className="h-3.5 w-3.5" aria-hidden />
                Giù
              </button>
              <button
                type="button"
                onClick={() => remove(section.id)}
                className="inline-flex items-center gap-1 rounded-full border border-ink-line px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-red-300"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden />
                Elimina
              </button>
            </div>

            <label className="text-sm text-ivory-dim">
              Titolo
              <input
                value={section.title}
                onChange={(event) => update(section.id, { title: event.target.value })}
                className={fieldClass}
                placeholder="Collezione estate"
              />
            </label>

            <label className="text-sm text-ivory-dim">
              Cosa mostrare
              <select
                value={sourceValue}
                onChange={(event) => {
                  const value = event.target.value;
                  if (value.startsWith("tag:")) {
                    update(section.id, { source: "tag", tagId: value.slice(4) });
                    return;
                  }
                  update(section.id, { source: value as HomeSectionSource, tagId: "" });
                }}
                className={fieldClass}
              >
                {homeSectionSourceOptions
                  .filter((option) => option.id !== "tag")
                  .map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                {tags.map((tag) => (
                  <option key={tag.id} value={`tag:${tag.id}`}>
                    Tag: {tag.label}
                  </option>
                ))}
              </select>
            </label>
            <p className="text-sm text-ivory-dim">{sourceHint}</p>

            {section.source === "picks" ? (
              <div className="max-h-64 overflow-y-auto rounded-xl border border-ink-line bg-ink/50 p-3">
                {list.length === 0 ? (
                  <p className="text-sm text-ivory-dim">Nessun capo in catalogo.</p>
                ) : (
                  <ul className="grid gap-2">
                    {list.map((product) => {
                      const id = optionId(product);
                      const checked = section.productIds.includes(id);
                      return (
                        <li key={id}>
                          <label className="flex items-center gap-3 text-sm text-ivory">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(event) => {
                                const productIds = event.target.checked
                                  ? [...section.productIds, id]
                                  : section.productIds.filter((item) => item !== id);
                                update(section.id, {
                                  productIds,
                                  featuredIds: section.featuredIds.filter((item) =>
                                    productIds.includes(item),
                                  ),
                                });
                              }}
                            />
                            {product.name}
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            ) : null}

            <p className="text-sm text-ivory-dim">Fino a quattro capi in evidenza sulla home.</p>
            <FeaturedSlots
              pool={pool}
              selected={section.featuredIds}
              onChange={(featuredIds) => update(section.id, { featuredIds })}
            />

            <SectionInterlude
              sectionId={section.id}
              media={section.interlude}
              onChange={(interlude) => update(section.id, { interlude })}
            />
          </fieldset>
        );
      })}

      <button
        type="button"
        onClick={addSection}
        className="inline-flex w-fit items-center gap-2 rounded-full border border-ink-line px-5 py-2.5 text-sm"
      >
        <Plus className="h-4 w-4" aria-hidden />
        Aggiungi una sezione
      </button>
    </div>
  );
}
