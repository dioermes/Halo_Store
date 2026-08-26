"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { orderStatusLabel, type OrderStatus } from "@/lib/orders";

const hints: Partial<Record<OrderStatus, string>> = {
  preparing: "Stai mettendo da parte i capi.",
  ready_for_pickup: "Il cliente può venire in negozio.",
  shipped: "Il pacco è partito. Corriere e tracking arrivano da Packlink; la cliente riceve la mail.",
  completed: "Ordine chiuso.",
  cancelled: "Annulla questo ordine.",
  refunded: "Segna il rimborso.",
  paid: "Pagato online, da preparare.",
  pending_payment: "In attesa del pagamento.",
};

export function OrderStatusSelect({
  current,
  options,
}: {
  current: OrderStatus;
  options: OrderStatus[];
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(current);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const choices = [current, ...options.filter((status) => status !== current)];
  const locked = options.length === 0;

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

  return (
    <div ref={rootRef} className="relative">
      <input type="hidden" name="status" value={value} />
      <p className="mb-2 text-xs uppercase tracking-[0.2em] text-ivory-dim">Stato dell&apos;ordine</p>
      <button
        type="button"
        disabled={locked}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((next) => !next)}
        className="flex w-full items-center justify-between gap-3 rounded-2xl border border-ink-line bg-ink/60 px-4 py-3.5 text-left transition-colors hover:border-halo/50 disabled:cursor-default disabled:opacity-70"
      >
        <span>
          <span className="block font-display text-2xl leading-none">{orderStatusLabel[value]}</span>
          {hints[value] ? (
            <span className="mt-1.5 block text-xs text-ivory-dim">{hints[value]}</span>
          ) : null}
        </span>
        {!locked && (
          <ChevronDown
            className={`h-5 w-5 shrink-0 text-halo-bright transition-transform ${open ? "rotate-180" : ""}`}
            aria-hidden
          />
        )}
      </button>

      {open && !locked && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Scegli lo stato"
          className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-ink-line bg-ink-soft shadow-2xl"
        >
          {choices.map((status) => {
            const selected = status === value;
            return (
              <li key={status} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => {
                    setValue(status);
                    setOpen(false);
                  }}
                  className={`flex w-full flex-col items-start px-4 py-3 text-left transition-colors ${
                    selected
                      ? "bg-halo/15 text-halo-bright"
                      : "text-ivory hover:bg-ink/80"
                  }`}
                >
                  <span className="font-display text-xl leading-none">{orderStatusLabel[status]}</span>
                  {hints[status] ? (
                    <span className="mt-1 text-xs text-ivory-dim">{hints[status]}</span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
