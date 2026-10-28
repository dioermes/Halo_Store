"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import {
  createCatalogTagAction,
  deleteCatalogTagAction,
  saveHomeSectionInterludeAction,
} from "@/app/admin/actions";
import { uploadAdminFile } from "@/lib/admin-upload";
import { ambientImages } from "@/lib/products";
import {
  merchKindFromFile,
  uniqueHomeSectionId,
  type CatalogTag,
  type HomeSection,
  type SiteMedia,
} from "@/lib/site";

const fieldClass =
  "mt-2 w-full rounded-xl border border-ink-line bg-ink/60 px-4 py-3 text-ivory outline-none";

function sectionAssignment(section: HomeSection) {
  if (section.source === "tag" && section.tagId) return `tag:${section.tagId}`;
  if (["newArrival", "bestseller", "sale"].includes(section.source)) return section.source;
  return "";
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
  const [busy, setBusy] = useState("");
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
        Mostra una foto o un video per questa sezione
      </label>
      {enabled ? (
        <>
          <p className="text-sm text-ivory-dim">
            Questo media sarà la copertina cliccabile della sezione. Comprimiamo automaticamente i
            file caricati.
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
                  const url = await uploadAdminFile(file, setBusy);
                  const kind = merchKindFromFile(file);
                  onChange({ url, kind });
                  await saveHomeSectionInterludeAction(sectionId, url, kind);
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Caricamento non riuscito");
                } finally {
                  setBusy("");
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
  tags: initialTags = [],
  onTagCreated,
  onTagDeleted,
}: {
  sections: HomeSection[];
  tags?: CatalogTag[];
  onTagCreated?: (tag: CatalogTag) => void;
  onTagDeleted?: (tagId: string) => void;
}) {
  const [sections, setSections] = useState(initial);
  const [tags, setTags] = useState(initialTags);
  const [newTagLabel, setNewTagLabel] = useState("");
  const [tagBusy, setTagBusy] = useState(false);
  const [deletingTag, setDeletingTag] = useState<string | null>(null);
  const [tagError, setTagError] = useState("");

  const availableTag = tags.find(
    (tag) => !sections.some((section) => sectionAssignment(section) === `tag:${tag.id}`),
  );
  const availableSource = (["newArrival", "bestseller", "sale"] as const).find(
    (source) => !sections.some((section) => sectionAssignment(section) === source),
  );
  const canAddSection = sections.length < 4 && Boolean(availableTag || availableSource);

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
    if (!canAddSection) return;
    setSections((current) => {
      const id = uniqueHomeSectionId("Collezione", current.map((section) => section.id));
      const nextTag = tags.find(
        (tag) => !current.some((section) => sectionAssignment(section) === `tag:${tag.id}`),
      );
      const nextSource = (["newArrival", "bestseller", "sale"] as const).find(
        (source) => !current.some((section) => sectionAssignment(section) === source),
      );
      const source = nextTag ? "tag" : nextSource ?? "picks";
      const title =
        nextTag?.label ??
        (nextSource
          ? {
              newArrival: "Nuovi arrivi",
              bestseller: "I più venduti",
              sale: "Saldi",
            }[nextSource]
          : "Nuova sezione");
      return [
        ...current,
        {
          id,
          title,
          source,
          tagId: nextTag?.id ?? "",
          productIds: [],
          featuredIds: [],
          interlude: { url: ambientImages.interior, kind: "image" },
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
          Scegli fino a quattro tag da mostrare come copertine nella home. Ogni copertina apre il
          catalogo filtrato per quel tag. Puoi cambiare titolo, immagine o video e ordine.
        </p>
      </div>

      <div className="grid gap-3 rounded-2xl border border-ink-line bg-ink/40 p-5">
        <p className="font-display text-xl">Tag personalizzati</p>
        <p className="text-sm text-ivory-dim">
          Crea un tag, assegnalo ai capi nel catalogo e poi selezionalo in una delle quattro
          copertine qui sotto.
        </p>
        {tags.length ? (
          <ul className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <li
                key={tag.id}
                className="inline-flex items-center gap-2 rounded-full border border-ink-line px-3 py-1.5 text-sm"
              >
                <span>{tag.label}</span>
                <button
                  type="button"
                  aria-label={`Elimina il tag ${tag.label}`}
                  title={`Elimina il tag ${tag.label}`}
                  disabled={deletingTag !== null}
                  onClick={async () => {
                    if (
                      !window.confirm(
                        `Eliminare il tag «${tag.label}»? Verrà rimosso dai capi e dalle sezioni della home che lo usano.`,
                      )
                    ) {
                      return;
                    }
                    setDeletingTag(tag.id);
                    setTagError("");
                    try {
                      await deleteCatalogTagAction(tag.id);
                      setTags((current) => current.filter((row) => row.id !== tag.id));
                      setSections((current) =>
                        current.filter(
                          (section) => section.source !== "tag" || section.tagId !== tag.id,
                        ),
                      );
                      onTagDeleted?.(tag.id);
                    } catch (error) {
                      setTagError(
                        error instanceof Error ? error.message : "Impossibile eliminare il tag.",
                      );
                      setDeletingTag(null);
                    }
                  }}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-ivory-dim transition-colors hover:bg-red-100 hover:text-red-700 disabled:opacity-40"
                >
                  {deletingTag === tag.id ? (
                    <span className="text-xs">…</span>
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  )}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ivory-dim">Nessun tag extra per ora.</p>
        )}
        {tagError ? <p className="text-sm text-red-700">{tagError}</p> : null}
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
                onTagCreated?.(tag);
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
          Nessuna sezione visibile. Aggiungine una per scegliere un tag e il relativo media.
        </p>
      ) : null}

      {sections.map((section, index) => {
        const sourceValue = sectionAssignment(section);

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
              Quali capi mostrare?
              <select
                value={sourceValue}
                onChange={(event) => {
                  const value = event.target.value;
                  if (value.startsWith("tag:")) {
                    const tag = tags.find((row) => row.id === value.slice(4));
                    update(section.id, {
                      source: "tag",
                      tagId: value.slice(4),
                      title: tag?.label ?? section.title,
                    });
                    return;
                  }
                  update(section.id, {
                    source: value as "newArrival" | "bestseller" | "sale",
                    tagId: "",
                    title:
                      value === "newArrival"
                        ? "Nuovi arrivi"
                        : value === "bestseller"
                          ? "I più venduti"
                          : "Saldi",
                  });
                }}
                className={fieldClass}
              >
                <option value="" disabled>
                  Seleziona un tag
                </option>
                <option
                  value="newArrival"
                  disabled={sections.some(
                    (row) => row.id !== section.id && sectionAssignment(row) === "newArrival",
                  )}
                >
                  Nuovi arrivi
                </option>
                <option
                  value="bestseller"
                  disabled={sections.some(
                    (row) => row.id !== section.id && sectionAssignment(row) === "bestseller",
                  )}
                >
                  I più venduti
                </option>
                <option
                  value="sale"
                  disabled={sections.some(
                    (row) => row.id !== section.id && sectionAssignment(row) === "sale",
                  )}
                >
                  Saldi
                </option>
                {tags.map((tag) => {
                  const tagValue = `tag:${tag.id}`;
                  return (
                    <option
                      key={tag.id}
                      value={tagValue}
                      disabled={sections.some(
                        (row) => row.id !== section.id && sectionAssignment(row) === tagValue,
                      )}
                    >
                      {tag.label}
                    </option>
                  );
                })}
              </select>
            </label>

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
        disabled={!canAddSection}
        className="inline-flex w-fit items-center gap-2 rounded-full border border-ink-line px-5 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Plus className="h-4 w-4" aria-hidden />
        {sections.length >= 4
          ? "Limite di 4 sezioni raggiunto"
          : canAddSection
            ? "Aggiungi una sezione"
            : "Non ci sono altri tag disponibili"}
      </button>
    </div>
  );
}
