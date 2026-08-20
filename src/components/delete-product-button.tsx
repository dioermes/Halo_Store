"use client";

import { deleteProductAction } from "@/app/admin/actions";

export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  return (
    <form
      action={deleteProductAction}
      onSubmit={(event) => {
        if (!window.confirm(`Eliminare ${name} dal catalogo? Non si può annullare.`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="rounded-full border border-ink-line px-4 py-2 text-sm text-ivory-dim hover:border-red-400/60 hover:text-red-300"
      >
        Elimina
      </button>
    </form>
  );
}
