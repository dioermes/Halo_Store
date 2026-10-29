"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ProductDetail } from "@/components/product-detail";
import type { Product } from "@/lib/products";

const FOCUSABLE =
  'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function ProductDialog({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!product) return;
    const closeOverlays = () => onClose();
    window.addEventListener("hashchange", closeOverlays);
    return () => window.removeEventListener("hashchange", closeOverlays);
  }, [product, onClose]);

  useEffect(() => {
    if (!product) return;

    previouslyFocused.current = document.activeElement as HTMLElement;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    window.setTimeout(() => closeRef.current?.focus(), 60);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const nodes = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!nodes || nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
      previouslyFocused.current?.focus?.();
    };
  }, [product, onClose]);

  return (
    <AnimatePresence>
      {product && (
        <div
          className="fixed inset-0 z-[120] flex items-stretch justify-center md:items-center md:p-5 lg:p-8"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dettaglio-capo-titolo"
        >
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            aria-label="Chiudi la scheda del capo"
            className="absolute inset-0 hidden cursor-default bg-ink/55 backdrop-blur-xl md:block"
          />

          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full md:max-w-6xl"
          >
            <ProductDetail key={product.id} product={product} layout="dialog" closeRef={closeRef} onClose={onClose} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
