"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Maximize2, X } from "lucide-react";
import {
  formatPrice,
  getColorLook,
  getGallery,
  findVariant,
  productImageForColor,
  variantAvailable,
  isProductSoldOut,
  type Product,
} from "@/lib/products";
import { useCart } from "@/components/reservation-provider";
import { ProductGallery } from "@/components/product-gallery";
import { SoldOutLabel } from "@/components/sold-out-label";
import { useAuth } from "@clerk/nextjs";

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

  const { add, has, openBag } = useCart();
  const { isSignedIn } = useAuth();
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<string>("");
  const [justAdded, setJustAdded] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [alertSent, setAlertSent] = useState(false);
  const [alertEmail, setAlertEmail] = useState("");
  const [alertError, setAlertError] = useState("");
  const [alertBusy, setAlertBusy] = useState(false);

  useEffect(() => {
    if (!product) return;
    setSize(product.sizes.length === 1 ? product.sizes[0] : null);
    setColor(product.colors[0] ?? "");
    setJustAdded(false);
    setGalleryOpen(false);
    setAlertSent(false);
    setAlertError("");
    setAlertBusy(false);
  }, [product]);

  useEffect(() => {
    if (!product) return;
    const closeOverlays = () => {
      setGalleryOpen(false);
      onClose();
    };
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
        if (galleryOpen) {
          setGalleryOpen(false);
          return;
        }
        onClose();
        return;
      }
      if (galleryOpen || event.key !== "Tab") return;

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
  }, [product, onClose, galleryOpen]);

  const needsSize = Boolean(product && product.sizes.length > 1 && !size);
  const available = product && size ? variantAvailable(product, size, color) : 0;
  const soldOut = Boolean(product && size && available <= 0);
  const alreadyInCart = Boolean(
    product && size && has({ productId: product.id, size, color }),
  );
  const look = getColorLook(color);
  const shots = product ? getGallery(product, color) : [];
  const variant = product && size ? findVariant(product, size, color) : undefined;
  const colorPhoto = product ? productImageForColor(product, color) : "";
  const hasColorPhoto = Boolean(product?.colorImages?.[color]);

  const handleAdd = () => {
    if (!product || !size || soldOut) return;
    add({ productId: product.id, variantId: variant?.id, size, color });
    setJustAdded(true);
  };

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
            className="relative flex h-dvh w-full flex-col overflow-hidden bg-ink-soft md:h-[min(900px,90dvh)] md:max-w-6xl md:rounded-[2rem] md:border md:border-ink-line/70 md:shadow-[0_40px_120px_-48px_rgba(63,21,33,0.55)] lg:flex-row"
          >
            <div className="relative h-[46dvh] min-h-[240px] shrink-0 lg:h-auto lg:min-h-0 lg:w-[48%]">
              <div
                className="absolute inset-0 cursor-zoom-in"
                onClick={() => setGalleryOpen(true)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setGalleryOpen(true);
                  }
                }}
                aria-label="Espandi la foto e vedi le alternative"
              >
                <Image
                  src={colorPhoto}
                  alt={`${product.name}, ${product.subtitle}${color ? `, ${color}` : ""}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 48vw"
                  className="object-cover"
                  style={!hasColorPhoto && look.filter ? { filter: look.filter } : undefined}
                  priority
                />
              </div>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-soft via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-ink-soft" />

              <div className="absolute inset-x-4 top-[max(0.75rem,env(safe-area-inset-top))] z-10 flex items-center justify-between">
                <button
                  ref={closeRef}
                  type="button"
                  onClick={onClose}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-ink-line bg-ink/70 text-ivory backdrop-blur transition-colors hover:border-halo/60 hover:text-halo-bright"
                  aria-label="Chiudi"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => setGalleryOpen(true)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-ink-line bg-ink/70 text-ivory backdrop-blur transition-colors hover:border-halo/60 hover:text-halo-bright"
                  aria-label="Espandi la foto e vedi le alternative"
                >
                  <Maximize2 className="h-4 w-4" aria-hidden />
                </button>
              </div>

              {shots.length > 1 && (
                <p className="absolute bottom-4 left-4 rounded-full border border-ink-line bg-ink/70 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-ivory-dim backdrop-blur">
                  {shots.length} foto
                </p>
              )}
            </div>

            <div className="flex min-h-0 flex-1 flex-col">
              <div className="flex-1 overflow-y-auto px-6 pt-6 pb-5 [scrollbar-width:none] sm:px-10 sm:pt-10 [&::-webkit-scrollbar]:hidden">
                {isProductSoldOut(product) ? <SoldOutLabel className="inline-block" /> : null}

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
                        disabled={variantAvailable(product, option, color) <= 0}
                        className={`min-w-14 rounded-full border px-4 py-2 text-sm transition-colors ${
                          variantAvailable(product, option, color) <= 0
                            ? "cursor-not-allowed border-ink-line text-ivory-dim/40 line-through"
                            : size === option
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
                      {product.colors.map((option) => {
                        const swatch = getColorLook(option);
                        const selected = color === option;
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => {
                              setColor(option);
                              setJustAdded(false);
                            }}
                            aria-pressed={selected}
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition-colors ${
                              selected
                                ? "border-halo bg-halo/15 text-halo-bright"
                                : "border-ink-line text-ivory-dim hover:border-ivory/40 hover:text-ivory"
                            }`}
                          >
                            <span
                              className="h-3.5 w-3.5 rounded-full border border-ivory/20"
                              style={{ backgroundColor: swatch.hex }}
                            />
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {(() => {
                  const details = [
                    ["Tessuto", product.fabric],
                    ["Vestibilità", product.fit],
                    ["Cura", product.care],
                  ].filter(([, value]) => typeof value === "string" && value.trim());
                  if (!details.length) return null;
                  return (
                    <dl className="mt-8 divide-y divide-ink-line border-y border-ink-line text-sm">
                      {details.map(([label, value]) => (
                        <div key={label} className="flex gap-4 py-3">
                          <dt className="w-28 shrink-0 text-ivory-dim">{label}</dt>
                          <dd className="text-ivory">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  );
                })()}

                <p className="mt-5 text-sm text-ivory-dim">
                  {!size
                    ? "Scegli taglia e colore per vedere la disponibilità."
                    : soldOut
                      ? "Questa taglia e colore non sono disponibili."
                      : available <= 1
                        ? "Ne è rimasto uno solo."
                        : `Disponibili ${available} pezzi.`}
                </p>
              </div>

              <div className="border-t border-ink-line px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-8">
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={needsSize || soldOut}
                  className={`flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-medium transition-all duration-300 ${
                    soldOut
                      ? "cursor-not-allowed border border-ink-line text-ivory-dim"
                      : alreadyInCart
                        ? "border border-halo/50 bg-halo/10 text-halo-bright hover:scale-[1.02]"
                        : needsSize
                          ? "cursor-not-allowed border border-ink-line text-ivory-dim"
                          : "bg-ivory text-ink hover:scale-[1.02]"
                  }`}
                >
                  {soldOut ? (
                    "Non disponibile"
                  ) : alreadyInCart ? (
                    <>
                      <Check className="h-4 w-4" aria-hidden />
                      Aggiungi un altro
                    </>
                  ) : (
                    "Aggiungi al carrello"
                  )}
                </button>

                {soldOut && variant?.id && (
                  <div className="mt-3">
                    {alertSent ? (
                      <p className="rounded-full border border-ink-line px-6 py-4 text-center text-sm">
                        Ti avvisiamo noi
                      </p>
                    ) : (
                      <>
                        {!isSignedIn ? (
                          <label className="block">
                            <span className="sr-only">Email per l&apos;avviso</span>
                            <input
                              type="email"
                              autoComplete="email"
                              placeholder="La tua email"
                              value={alertEmail}
                              onChange={(event) => {
                                setAlertEmail(event.target.value);
                                setAlertError("");
                              }}
                              className="mb-3 w-full rounded-full border border-ink-line bg-transparent px-6 py-4 text-sm outline-none placeholder:text-ivory-dim focus:border-halo/60"
                            />
                          </label>
                        ) : null}
                        <button
                          type="button"
                          disabled={alertBusy}
                          onClick={async () => {
                            setAlertBusy(true);
                            setAlertError("");
                            const response = await fetch("/api/stock-alert", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                variantId: variant.id,
                                ...(!isSignedIn ? { email: alertEmail } : {}),
                              }),
                            });
                            setAlertBusy(false);
                            if (!response.ok) {
                              const data = (await response.json().catch(() => null)) as { error?: string } | null;
                              if (data?.error === "email") {
                                setAlertError("Inserisci una email valida.");
                              } else if (data?.error === "available") {
                                setAlertError("Questo capo è già di nuovo disponibile.");
                              } else {
                                setAlertError("Non è stato possibile salvare l'avviso. Riprova.");
                              }
                              return;
                            }
                            setAlertSent(true);
                          }}
                          className="w-full rounded-full border border-ink-line px-6 py-4 text-sm disabled:opacity-60"
                        >
                          {alertBusy ? "Un attimo…" : "Avvisami quando torna"}
                        </button>
                        {alertError ? (
                          <p className="mt-2 text-center text-xs text-red-300">{alertError}</p>
                        ) : (
                          <p className="mt-2 text-center text-xs text-ivory-dim">
                            Ti scriviamo solo quando questa taglia torna in negozio.
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}

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
                      className="mt-3 w-full rounded-full border border-ink-line px-6 py-4 text-sm text-ivory transition-colors hover:border-halo/60 hover:text-halo-bright"
                    >
                      Vai al carrello
                    </motion.button>
                  )}
                </AnimatePresence>

                <p className="mt-3 text-center text-xs leading-relaxed text-ivory-dim">
                  Ritiro in negozio: prenoti e paghi in cassa. Spedizione:
                  paghi sul sito. Le scorte si prenotano alla conferma, non
                  prima.
                </p>
              </div>
            </div>
          </motion.div>

          <AnimatePresence>
            {galleryOpen && (
              <ProductGallery
                product={product}
                color={color}
                onColorChange={(next) => {
                  setColor(next);
                  setJustAdded(false);
                }}
                onClose={() => setGalleryOpen(false)}
              />
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
}
