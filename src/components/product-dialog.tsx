"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, X } from "lucide-react";
import { formatPrice, type Product } from "@/lib/products";
import { useReservation } from "@/components/reservation-provider";

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

  const { add, has, openBag } = useReservation();
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (!product) return;
    setSize(product.sizes.length === 1 ? product.sizes[0] : null);
    setColor(product.colors[0] ?? "");
    setJustAdded(false);
  }, [product]);

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

  const needsSize = Boolean(product && product.sizes.length > 1 && !size);
  const alreadyReserved = Boolean(
    product && size && has({ productId: product.id, size, color: color ?? "" }),
  );

  const handleReserve = () => {
    if (!product || !size) return;
    add({ productId: product.id, size, color: color ?? "" });
    setJustAdded(true);
  };

  return (
    <AnimatePresence>
      {product && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6"
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
            className="absolute inset-0 cursor-default bg-ink/80 backdrop-blur-md"
          />

          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.98 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex max-h-[92svh] w-full max-w-5xl flex-col overflow-hidden rounded-t-3xl border border-ink-line bg-ink-soft sm:max-h-[86svh] sm:rounded-3xl lg:flex-row"
          >
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-ink-line bg-ink/70 text-ivory backdrop-blur transition-colors hover:border-halo/60 hover:text-halo-bright"
              aria-label="Chiudi"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>

            <div className="relative aspect-[4/3] max-h-[38svh] shrink-0 sm:aspect-[16/10] lg:aspect-auto lg:max-h-none lg:w-[46%]">
              <motion.div
                layoutId={`media-${product.id}`}
                className="absolute inset-0"
              >
                <Image
                  src={product.image}
                  alt={`${product.name}, ${product.subtitle}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 46vw"
                  className="object-cover"
                />
              </motion.div>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-soft via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-ink-soft" />
            </div>

            <div className="flex-1 overflow-y-auto p-6 sm:p-9">
              {product.badge && (
                <span className="inline-block rounded-full border border-halo/40 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-halo-bright">
                  {product.badge}
                </span>
              )}

              <h3
                id="dettaglio-capo-titolo"
                className="mt-4 font-display text-5xl leading-none"
              >
                {product.name}
              </h3>
              <p className="mt-3 text-ivory-dim">{product.subtitle}</p>

              <div className="mt-5 flex items-baseline gap-3">
                <span className="font-display text-3xl text-halo-bright">
                  {formatPrice(product.price)}
                </span>
                {product.compareAt && (
                  <span className="text-sm text-ivory-dim line-through">
                    {formatPrice(product.compareAt)}
                  </span>
                )}
              </div>

              <p className="mt-6 leading-relaxed text-ivory-dim">
                {product.description}
              </p>

              <div className="mt-8">
                <div className="flex items-baseline justify-between">
                  <p className="text-xs uppercase tracking-[0.2em] text-ivory-dim">
                    Taglia
                  </p>
                  {needsSize && (
                    <p className="text-xs text-halo">Scegli una taglia</p>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.sizes.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setSize(option);
                        setJustAdded(false);
                      }}
                      aria-pressed={size === option}
                      className={`min-w-14 rounded-full border px-4 py-2 text-sm transition-colors ${
                        size === option
                          ? "border-halo bg-halo/15 text-halo-bright"
                          : "border-ink-line text-ivory-dim hover:border-ivory/40 hover:text-ivory"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {product.colors.length > 1 && (
                <div className="mt-6">
                  <p className="text-xs uppercase tracking-[0.2em] text-ivory-dim">
                    Colore
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {product.colors.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          setColor(option);
                          setJustAdded(false);
                        }}
                        aria-pressed={color === option}
                        className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                          color === option
                            ? "border-halo bg-halo/15 text-halo-bright"
                            : "border-ink-line text-ivory-dim hover:border-ivory/40 hover:text-ivory"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <dl className="mt-8 divide-y divide-ink-line border-y border-ink-line text-sm">
                {[
                  ["Tessuto", product.fabric],
                  ["Vestibilità", product.fit],
                  ["Cura", product.care],
                ].map(([label, value]) => (
                  <div key={label} className="flex gap-4 py-3">
                    <dt className="w-28 shrink-0 text-ivory-dim">{label}</dt>
                    <dd className="text-ivory">{value}</dd>
                  </div>
                ))}
              </dl>

              <p className="mt-5 text-sm text-ivory-dim">
                {product.stock <= 1
                  ? "Ne è rimasto uno solo in negozio."
                  : `Disponibili ${product.stock} pezzi in negozio.`}
              </p>

              <div className="mt-7 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleReserve}
                  disabled={needsSize || alreadyReserved}
                  className={`flex items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-medium transition-all duration-300 ${
                    alreadyReserved
                      ? "cursor-default border border-halo/50 bg-halo/10 text-halo-bright"
                      : needsSize
                        ? "cursor-not-allowed border border-ink-line text-ivory-dim"
                        : "bg-ivory text-ink hover:scale-[1.02]"
                  }`}
                >
                  {alreadyReserved ? (
                    <>
                      <Check className="h-4 w-4" aria-hidden />
                      Già nella tua lista
                    </>
                  ) : (
                    "Tienimelo da parte"
                  )}
                </button>

                <AnimatePresence>
                  {justAdded && (
                    <motion.button
                      type="button"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      onClick={() => {
                        onClose();
                        openBag();
                      }}
                      className="rounded-full border border-ink-line px-6 py-4 text-sm text-ivory transition-colors hover:border-halo/60 hover:text-halo-bright"
                    >
                      Vai alle prenotazioni
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              <p className="mt-4 text-xs leading-relaxed text-ivory-dim">
                Prenotare non costa nulla e non impegna: passi in negozio, provi
                il capo e decidi con calma.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
