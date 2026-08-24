"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Search, X } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { ProductDialog } from "@/components/product-dialog";
import { useReservation } from "@/components/reservation-provider";
import { matchesProductQuery } from "@/lib/search";
import type { Product } from "@/lib/products";

export function SiteSearch({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { products } = useReservation();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 40);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const results = useMemo(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return [];
    return products.filter((product) => matchesProductQuery(product, trimmed)).slice(0, 24);
  }, [products, query]);

  return (
    <>
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-ink/95 backdrop-blur-xl"
            role="dialog"
            aria-modal="true"
            aria-label="Cerca nel catalogo"
          >
            <div className="mx-auto flex max-w-3xl items-center gap-3 px-5 pt-20 sm:px-8">
              <Search className="h-5 w-5 shrink-0 text-halo" aria-hidden />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cerca un capo, una taglia, denim, nuovo arrivo…"
                className="w-full bg-transparent py-3 text-lg text-ivory outline-none placeholder:text-ivory-dim/70"
              />
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-line"
                aria-label="Chiudi la ricerca"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <div className="mx-auto max-h-[calc(100svh-8rem)] max-w-7xl overflow-y-auto px-5 py-10 sm:px-8">
              {query.trim().length < 2 ? (
                <p className="text-sm text-ivory-dim">
                  Prova parole come jeans, maglietta, bomber, nero, nuovo, più venduti.
                </p>
              ) : results.length === 0 ? (
                <p className="text-ivory-dim">Nessun capo per “{query.trim()}”.</p>
              ) : (
                <div className="grid grid-cols-1 items-stretch gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
                  {results.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={index}
                      onOpen={(item) => {
                        setSelected(item);
                        onClose();
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <ProductDialog product={selected} onClose={() => setSelected(null)} />
    </>
  );
}
