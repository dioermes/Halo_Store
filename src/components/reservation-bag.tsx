"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Copy, ShoppingBag, Trash2, X } from "lucide-react";
import { useReservation } from "@/components/reservation-provider";
import { formatPrice, getProduct } from "@/lib/products";
import { getUpcomingOpenDays } from "@/lib/opening-hours";
import { storeConfig } from "@/lib/store-config";
import { buildReservationMessage, buildWhatsappUrl } from "@/lib/whatsapp";

const FOCUSABLE =
  'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function ReservationBag() {
  const { items, count, total, isOpen, openBag, closeBag, remove, clear } =
    useReservation();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [day, setDay] = useState("");
  const [note, setNote] = useState("");
  const [touched, setTouched] = useState(false);
  const [copied, setCopied] = useState(false);

  const openDays = useMemo(() => getUpcomingOpenDays(6), []);

  useEffect(() => {
    if (!day && openDays.length > 0) setDay(openDays[0].value);
  }, [day, openDays]);

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

  const nameIsValid = name.trim().length >= 2;
  const message = buildReservationMessage(items, { name, phone, day, note });

  const handleSend = () => {
    setTouched(true);
    if (!nameIsValid || count === 0) return;
    window.open(buildWhatsappUrl(message), "_blank", "noopener,noreferrer");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
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
                {count} {count === 1 ? "capo" : "capi"} da parte
              </span>
            </span>
            <span className="text-sm text-halo-bright">
              {formatPrice(total)}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <div
            className="fixed inset-0 z-[80] flex justify-end"
            role="dialog"
            aria-modal="true"
            aria-labelledby="prenotazioni-titolo"
          >
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={closeBag}
              aria-label="Chiudi le prenotazioni"
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
                  <h2
                    id="prenotazioni-titolo"
                    className="font-display text-3xl leading-none"
                  >
                    Da parte per te
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
                      Scegli i capi dal catalogo e li teniamo pronti in camerino
                      fino al tuo arrivo.
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
                          const product = getProduct(item.productId);
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
                                  src={product.image}
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
                                  {formatPrice(product.price)}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => remove(item)}
                                className="self-start rounded-full p-2 text-ivory-dim transition-colors hover:text-ivory"
                                aria-label={`Togli ${product.name} taglia ${item.size} dalla lista`}
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
                      Svuota la lista
                    </button>

                    <div className="mt-8 space-y-4 border-t border-ink-line pt-8">
                      <div>
                        <label
                          htmlFor="prenotazione-nome"
                          className="text-xs uppercase tracking-[0.2em] text-ivory-dim"
                        >
                          Il tuo nome
                        </label>
                        <input
                          id="prenotazione-nome"
                          value={name}
                          onChange={(event) => setName(event.target.value)}
                          onBlur={() => setTouched(true)}
                          placeholder="Come ti chiamiamo quando arrivi"
                          className="mt-2 w-full rounded-xl border border-ink-line bg-ink/60 px-4 py-3 text-sm text-ivory outline-none transition-colors placeholder:text-ivory-dim/50 focus:border-halo/60"
                          aria-invalid={touched && !nameIsValid}
                          aria-describedby="prenotazione-nome-errore"
                        />
                        {touched && !nameIsValid && (
                          <p
                            id="prenotazione-nome-errore"
                            className="mt-2 text-xs text-halo"
                          >
                            Scrivi almeno il nome, così sappiamo per chi tenere i capi.
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="prenotazione-telefono"
                          className="text-xs uppercase tracking-[0.2em] text-ivory-dim"
                        >
                          Telefono (facoltativo)
                        </label>
                        <input
                          id="prenotazione-telefono"
                          value={phone}
                          onChange={(event) => setPhone(event.target.value)}
                          inputMode="tel"
                          placeholder="Se preferisci essere richiamato"
                          className="mt-2 w-full rounded-xl border border-ink-line bg-ink/60 px-4 py-3 text-sm text-ivory outline-none transition-colors placeholder:text-ivory-dim/50 focus:border-halo/60"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="prenotazione-giorno"
                          className="text-xs uppercase tracking-[0.2em] text-ivory-dim"
                        >
                          Quando passi
                        </label>
                        <select
                          id="prenotazione-giorno"
                          value={day}
                          onChange={(event) => setDay(event.target.value)}
                          className="mt-2 w-full rounded-xl border border-ink-line bg-ink/60 px-4 py-3 text-sm text-ivory outline-none transition-colors focus:border-halo/60"
                        >
                          {openDays.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="prenotazione-note"
                          className="text-xs uppercase tracking-[0.2em] text-ivory-dim"
                        >
                          Note (facoltativo)
                        </label>
                        <textarea
                          id="prenotazione-note"
                          value={note}
                          onChange={(event) => setNote(event.target.value)}
                          rows={2}
                          placeholder="Es. vorrei provarlo anche in una taglia in più"
                          className="mt-2 w-full resize-none rounded-xl border border-ink-line bg-ink/60 px-4 py-3 text-sm text-ivory outline-none transition-colors placeholder:text-ivory-dim/50 focus:border-halo/60"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {count > 0 && (
                <div className="border-t border-ink-line px-6 py-5">
                  {!storeConfig.whatsapp.isConfigured && (
                    <p className="mb-3 rounded-xl border border-halo/30 bg-halo/5 px-4 py-3 text-xs leading-relaxed text-halo-bright">
                      Il numero del negozio non è ancora collegato al sito:
                      WhatsApp si aprirà con il riepilogo già scritto e ti
                      chiederà a chi inviarlo.
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={handleSend}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-ivory px-6 py-4 text-sm font-medium text-ink transition-transform duration-300 hover:scale-[1.02]"
                  >
                    {storeConfig.whatsapp.isConfigured
                      ? "Invia la richiesta su WhatsApp"
                      : "Apri WhatsApp con il riepilogo"}
                  </button>

                  <button
                    type="button"
                    onClick={handleCopy}
                    className={`mt-3 flex w-full items-center justify-center gap-2 rounded-full border px-6 py-3.5 text-sm transition-colors ${
                      copied
                        ? "border-halo/50 text-halo-bright"
                        : "border-ink-line text-ivory hover:border-halo/60 hover:text-halo-bright"
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" aria-hidden />
                        Riepilogo copiato
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" aria-hidden />
                        Copia il riepilogo
                      </>
                    )}
                  </button>

                  <p className="mt-3 text-center text-xs text-ivory-dim">
                    Teniamo i capi da parte 48 ore. Nessun pagamento anticipato.
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
