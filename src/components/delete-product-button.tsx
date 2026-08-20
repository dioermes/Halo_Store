"use client";

import { deleteProductAction } from "@/app/admin/actions";

export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  return (
    <form
      action={deleteProductAction}
      className="min-w-0 flex-1 sm:flex-none"
      onSubmit={(event) => {
        if (!window.confirm(`Eliminare ${name} dal catalogo? Non si può annullare.`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="w-full rounded-full border border-ink-line px-3 py-2 text-xs text-ivory-dim hover:border-red-400/60 hover:text-red-300 sm:w-auto sm:px-4 sm:text-sm"
      >
        Elimina
      </button>
    </form>
  );
}
