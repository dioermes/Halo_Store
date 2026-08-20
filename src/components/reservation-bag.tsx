"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Show, SignInButton } from "@clerk/nextjs";
import { AnimatePresence, motion } from "motion/react";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "@/components/reservation-provider";
import { formatPrice, productImageForColor } from "@/lib/products";

const FOCUSABLE =
  'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function ReservationBag() {
  const {
    items,
    count,
    total,
    isOpen,
    openBag,
    closeBag,
    remove,
    setQuantity,
    clear,
    productById,
  } = useCart();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isOpen) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    window.setTimeout(() => closeRef.current?.focus(), 60);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeBag();
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
    };
  }, [isOpen, closeBag]);

  const goCheckout = () => {
    closeBag();
    router.push("/checkout");
  };

  return (
    <>
      <AnimatePresence>
        {count > 0 && !isOpen && (
          <motion.button
            type="button"
            initial={{ y: 90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 90, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={openBag}
            className="fixed inset-x-4 bottom-4 z-40 flex items-center justify-between gap-4 rounded-full border border-halo/40 bg-ink-soft/95 px-5 py-4 text-left backdrop-blur-xl md:hidden"
          >
            <span className="flex items-center gap-3">
              <ShoppingBag className="h-4 w-4 text-halo" aria-hidden />
              <span className="text-sm">
                {count} {count === 1 ? "capo" : "capi"} nel carrello
              </span>
            </span>
            <span className="text-sm text-halo-bright">{formatPrice(total)}</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <div
            className="fixed inset-0 z-[80] flex justify-end"
            role="dialog"
            aria-modal="true"
            aria-labelledby="carrello-titolo"
          >
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={closeBag}
              aria-label="Chiudi il carrello"
              className="absolute inset-0 cursor-default bg-ink/80 backdrop-blur-md"
            />

            <motion.div
              ref={panelRef}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 32 }}
              className="relative flex h-full w-full max-w-md flex-col border-l border-ink-line bg-ink-soft"
            >
              <div className="flex items-center justify-between border-b border-ink-line px-6 py-5">
                <div>
                  <h2 id="carrello-titolo" className="font-display text-3xl leading-none">
                    Il tuo carrello
                  </h2>
                  <p className="mt-2 text-sm text-ivory-dim">
                    {count === 0
                      ? "Nessun capo selezionato"
                      : `${count} ${count === 1 ? "capo" : "capi"} · ${formatPrice(total)}`}
                  </p>
                </div>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={closeBag}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-line transition-colors hover:border-halo/60 hover:text-halo-bright"
                  aria-label="Chiudi"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6">
                {count === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <span className="flex h-16 w-16 items-center justify-center rounded-full border border-ink-line">
                      <ShoppingBag className="h-6 w-6 text-ivory-dim" aria-hidden />
                    </span>
                    <p className="mt-6 max-w-xs leading-relaxed text-ivory-dim">
                      Scegli i capi dal catalogo: li paghi qui e li ritiri in negozio
                      oppure te li spediamo in Italia.
                    </p>
                    <button
                      type="button"
                      onClick={closeBag}
                      className="mt-8 rounded-full border border-ink-line px-6 py-3 text-sm transition-colors hover:border-halo/60 hover:text-halo-bright"
                    >
                      Torna al catalogo
                    </button>
                  </div>
                ) : (
                  <>
                    <ul className="space-y-4">
                      <AnimatePresence initial={false}>
                        {items.map((item) => {
                          const product = productById(item.productId);
                          if (!product) return null;
                          return (
                            <motion.li
                              key={`${item.productId}-${item.size}-${item.color}`}
                              layout
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 30, height: 0 }}
                              className="flex gap-4"
                            >
                              <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl border border-ink-line">
                                <Image
                                  src={productImageForColor(product, item.color)}
                                  alt=""
                                  fill
                                  sizes="80px"
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex flex-1 flex-col justify-center">
                                <p className="font-display text-xl leading-none">
                                  {product.name}
                                </p>
                                <p className="mt-1.5 text-xs text-ivory-dim">
                                  Taglia {item.size}
                                  {item.color ? ` · ${item.color}` : ""}
                                </p>
                                <p className="mt-1.5 text-sm text-halo-bright">
                                  {formatPrice(product.price * item.quantity)}
                                </p>
                                <div className="mt-2 flex items-center gap-2">
                                  <button
                                    type="button"
                                    className="flex h-7 w-7 items-center justify-center rounded-full border border-ink-line"
                                    onClick={() => setQuantity(item, item.quantity - 1)}
                                    aria-label="Diminuisci quantità"
                                  >
                                    <Minus className="h-3 w-3" />
                                  </button>
                                  <span className="w-6 text-center text-sm">{item.quantity}</span>
                                  <button
                                    type="button"
                                    className="flex h-7 w-7 items-center justify-center rounded-full border border-ink-line"
                                    onClick={() => setQuantity(item, item.quantity + 1)}
                                    aria-label="Aumenta quantità"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => remove(item)}
                                className="self-start rounded-full p-2 text-ivory-dim transition-colors hover:text-ivory"
                                aria-label={`Togli ${product.name} dal carrello`}
                              >
                                <Trash2 className="h-4 w-4" aria-hidden />
                              </button>
                            </motion.li>
                          );
                        })}
                      </AnimatePresence>
                    </ul>
                    <button
                      type="button"
                      onClick={clear}
                      className="mt-5 text-xs text-ivory-dim underline underline-offset-4 transition-colors hover:text-ivory"
                    >
                      Svuota il carrello
                    </button>
                  </>
                )}
              </div>

              {count > 0 && (
                <div className="border-t border-ink-line px-6 py-5">
                  <Show when="signed-in">
                    <button
                      type="button"
                      onClick={goCheckout}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-ivory px-6 py-4 text-sm font-medium text-ink transition-transform duration-300 hover:scale-[1.02]"
                    >
                      Vai alla cassa
                    </button>
                  </Show>
                  <Show when="signed-out">
                    <SignInButton mode="modal" forceRedirectUrl="/checkout">
                      <button
                        type="button"
                        className="flex w-full items-center justify-center rounded-full bg-ivory px-6 py-4 text-sm font-medium text-ink"
                      >
                        Accedi per continuare
                      </button>
                    </SignInButton>
                  </Show>
                  <p className="mt-3 text-center text-xs text-ivory-dim">
                    Ritiro: prenoti e paghi in cassa. Spedizione: paghi sul sito.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
