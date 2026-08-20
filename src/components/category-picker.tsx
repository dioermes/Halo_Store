"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown, Plus } from "lucide-react";
import { createCategoryAction } from "@/app/admin/actions";
import { uniqueCategoryId } from "@/lib/categories";
import type { StoreCategory } from "@/lib/products";

export function CategoryPicker({
  categories,
  value,
  onChange,
  onCategoriesChange,
}: {
  categories: StoreCategory[];
  value: string;
  onChange: (id: string) => void;
  onCategoriesChange: (next: StoreCategory[]) => void;
}) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftHint, setDraftHint] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const selected = categories.find((row) => row.id === value);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const addCategory = async () => {
    const label = draftName.trim();
    if (!label) {
      setError("Scrivi il nome della tipologia.");
      return;
    }
    setPending(true);
    setError("");
    try {
      const id = uniqueCategoryId(label, categories);
      const created = await createCategoryAction({
        id,
        label,
        hint: draftHint.trim(),
      });
      if ("error" in created) {
        throw new Error(created.error);
      }
      const next = categories.some((row) => row.id === created.category.id)
        ? categories.map((row) => (row.id === created.category.id ? created.category : row))
        : [...categories, created.category];
      onCategoriesChange(next);
      onChange(created.category.id);
      setDraftName("");
      setDraftHint("");
      setOpen(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPending(false);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((current) => !current)}
        className="mt-2 flex w-full items-center justify-between rounded-xl border border-ink-line bg-ink/60 px-4 py-3 text-left text-ivory outline-none transition-colors hover:border-halo/40 focus:border-halo/50"
      >
        <span>
          <span className="block">{selected?.label ?? "Scegli una tipologia"}</span>
          {selected?.hint ? (
            <span className="mt-0.5 block text-xs text-ivory-dim">{selected.hint}</span>
          ) : null}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-ivory-dim transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {open && (
        <div
          id={listId}
          role="listbox"
          className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-ink-line bg-ink-soft shadow-2xl"
        >
          <ul className="max-h-64 overflow-y-auto py-1">
            {categories.map((row) => {
              const active = row.id === value;
              return (
                <li key={row.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      onChange(row.id);
                      setOpen(false);
                    }}
                    className={`flex w-full items-start justify-between gap-3 px-4 py-3 text-left text-sm transition-colors ${
                      active ? "bg-halo/10 text-halo-bright" : "text-ivory hover:bg-ivory/5"
                    }`}
                  >
                    <span>
                      <span className="block">{row.label}</span>
                      {row.hint ? (
                        <span className="mt-0.5 block text-xs text-ivory-dim">{row.hint}</span>
                      ) : null}
                    </span>
                    {active ? <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> : null}
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="border-t border-ink-line p-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-ivory-dim">
              Nuova tipologia
            </p>
            <input
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void addCategory();
                }
              }}
              placeholder="Es. Maglieria"
              className="mt-2 w-full rounded-xl border border-ink-line bg-ink/60 px-3 py-2 text-sm text-ivory outline-none placeholder:text-ivory-dim/60 focus:border-halo/50"
            />
            <input
              value={draftHint}
              onChange={(event) => setDraftHint(event.target.value)}
              placeholder="Descrizione in vetrina, facoltativa"
              className="mt-2 w-full rounded-xl border border-ink-line bg-ink/60 px-3 py-2 text-sm text-ivory outline-none placeholder:text-ivory-dim/60 focus:border-halo/50"
            />
            {error ? <p className="mt-2 text-xs text-halo">{error}</p> : null}
            <button
              type="button"
              onClick={() => void addCategory()}
              disabled={pending}
              className="mt-2 inline-flex items-center gap-2 rounded-full border border-ink-line px-3 py-1.5 text-xs text-ivory hover:border-halo/60 disabled:opacity-50"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden />
              {pending ? "Aggiungo…" : "Aggiungi"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
