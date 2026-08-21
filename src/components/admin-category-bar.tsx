"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { createCategoryAction, deleteCategoryAction, updateCategoryAction } from "@/app/admin/actions";
import { uniqueCategoryId } from "@/lib/categories";
import type { StoreCategory } from "@/lib/products";

export function AdminCategoryBar({
  categories,
  active,
}: {
  categories: StoreCategory[];
  active: string;
}) {
  const router = useRouter();
  const [dialog, setDialog] = useState<"new" | StoreCategory | null>(null);
  const [label, setLabel] = useState("");
  const [hint, setHint] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const creating = dialog === "new";

  useEffect(() => {
    if (!dialog) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDialog(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [dialog]);

  const openEdit = (category: StoreCategory) => {
    setDialog(category);
    setLabel(category.label);
    setHint(category.hint);
    setError("");
  };

  const openNew = () => {
    setDialog("new");
    setLabel("");
    setHint("");
    setError("");
  };

  const save = async () => {
    if (!dialog) return;
    setBusy(true);
    setError("");
    const result = creating
      ? await createCategoryAction({
          id: uniqueCategoryId(label, categories),
          label,
          hint,
        })
      : await updateCategoryAction({
          id: dialog.id,
          label,
          hint,
        });
    setBusy(false);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    setDialog(null);
    router.refresh();
  };

  const remove = async (category: StoreCategory) => {
    if (!window.confirm(`Eliminare la tipologia «${category.label}»?`)) return;
    setError("");
    const result = await deleteCategoryAction(category.id);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    if (active === category.id) router.push("/admin/catalogo");
    else router.refresh();
  };

  const pill = (selected: boolean) =>
    `inline-flex items-center gap-0.5 rounded-full border py-1 pl-3 pr-1 text-sm transition-colors ${
      selected
        ? "border-halo bg-halo/10 text-halo-bright"
        : "border-ink-line text-ivory-dim hover:border-halo/60 hover:text-ivory"
    }`;

  const iconBtn = "rounded-full p-1.5 hover:bg-ivory/10";

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Filtra per tipologia">
        <Link
          href="/admin/catalogo"
          scroll={false}
          role="tab"
          aria-selected={active === "tutti"}
          className={`rounded-full border px-3 py-2 text-sm transition-colors sm:px-4 ${
            active === "tutti"
              ? "border-halo bg-halo/10 text-halo-bright"
              : "border-ink-line text-ivory-dim hover:border-halo/60 hover:text-ivory"
          }`}
        >
          Tutti
        </Link>
        {categories.map((category) => {
          const selected = active === category.id;
          return (
            <span key={category.id} className={pill(selected)}>
              <Link
                href={`/admin/catalogo?tipo=${category.id}`}
                scroll={false}
                role="tab"
                aria-selected={selected}
                className="py-1 pr-1"
              >
                {category.label}
              </Link>
              <button
                type="button"
                className={iconBtn}
                aria-label={`Modifica ${category.label}`}
                onClick={() => openEdit(category)}
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden />
              </button>
              <button
                type="button"
                className={`${iconBtn} hover:text-red-300`}
                aria-label={`Elimina ${category.label}`}
                onClick={() => void remove(category)}
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden />
              </button>
            </span>
          );
        })}
        <button
          type="button"
          onClick={openNew}
          aria-label="Nuova tipologia"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-line text-ivory-dim hover:border-halo/60 hover:text-ivory"
        >
          <Plus className="h-4 w-4" aria-hidden />
        </button>
      </div>
      {error && !dialog ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}

      {dialog ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 px-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) setDialog(null);
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-ink-line bg-ink p-5"
            role="dialog"
            aria-labelledby="category-dialog-title"
          >
            <h3 id="category-dialog-title" className="font-display text-2xl">
              {creating ? "Nuova tipologia" : "Modifica tipologia"}
            </h3>
            <label className="mt-4 block text-sm text-ivory-dim">
              Nome
              <input
                value={label}
                onChange={(event) => setLabel(event.target.value)}
                className="mt-2 w-full rounded-xl border border-ink-line bg-ink/60 px-4 py-3 text-ivory outline-none"
              />
            </label>
            <label className="mt-3 block text-sm text-ivory-dim">
              Descrizione in vetrina
              <input
                value={hint}
                onChange={(event) => setHint(event.target.value)}
                className="mt-2 w-full rounded-xl border border-ink-line bg-ink/60 px-4 py-3 text-ivory outline-none"
              />
            </label>
            {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-full border border-ink-line px-4 py-2 text-sm"
                onClick={() => setDialog(null)}
              >
                Annulla
              </button>
              <button
                type="button"
                disabled={busy}
                className="rounded-full bg-ivory px-4 py-2 text-sm text-ink disabled:opacity-50"
                onClick={() => void save()}
              >
                {busy ? "Salvo…" : creating ? "Crea" : "Salva"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
