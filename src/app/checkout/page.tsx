"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { useCart } from "@/components/reservation-provider";
import { formatPrice } from "@/lib/products";
import { storeConfig } from "@/lib/store-config";
import { getPickupSlotsWithinHours } from "@/lib/opening-hours";
import { ReturnsNotice } from "@/components/returns-notice";
import { requestNewsletterPopup } from "@/components/newsletter-popup";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

const fieldClass =
  "mt-2 w-full rounded-xl border border-ink-line bg-ink/60 px-4 py-3 text-sm text-ivory outline-none placeholder:text-ivory-dim/70 focus:border-halo/50";

export default function CheckoutPage() {
  const { items, total, productById, count, clear, remove } = useCart();
  const router = useRouter();
  const giftCardItems = items.filter((item) => item.giftCardAmountCents);
  const giftCardAmounts = giftCardItems.flatMap((item) =>
    Array.from({ length: item.quantity }, () => item.giftCardAmountCents ?? 0),
  );
  const physicalItems = items.filter((item) => !item.giftCardAmountCents);
  const giftCardOnly = giftCardAmounts.length > 0 && physicalItems.length === 0;
  const pickupSlots = useMemo(() => getPickupSlotsWithinHours(48), []);
  const pickupGroups = useMemo(() => {
    const groups: Array<{ label: string; slots: typeof pickupSlots }> = [];
    for (const slot of pickupSlots) {
      const current = groups[groups.length - 1];
      if (current?.label === slot.group) current.slots.push(slot);
      else groups.push({ label: slot.group, slots: [slot] });
    }
    return groups;
  }, [pickupSlots]);

  const [fulfillment, setFulfillment] = useState<"pickup" | "shipping">("pickup");
  const [pickupName, setPickupName] = useState("");
  const [phone, setPhone] = useState("");
  const [pickupAt, setPickupAt] = useState("");
  const [note, setNote] = useState("");
  const [shipping, setShipping] = useState({
    name: "",
    line1: "",
    city: "",
    postalCode: "",
    province: "BA",
  });
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [promo, setPromo] = useState<{
    code: string;
    percent: number;
    discountCents: number;
  } | null>(null);
  const [promoBusy, setPromoBusy] = useState(false);
  const [giftCardInput, setGiftCardInput] = useState("");
  const [giftCard, setGiftCard] = useState<{
    code: string;
    discountCents: number;
    remainingAfterCents: number;
  } | null>(null);
  const [giftCardBusy, setGiftCardBusy] = useState(false);
  const [suggestedCode, setSuggestedCode] = useState("HALO10");
  const [shippingCents, setShippingCents] = useState(700);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [reserved, setReserved] = useState<{
    when: string;
    name: string;
    hasGiftCards: boolean;
  } | null>(null);

  useEffect(() => {
    void fetch("/api/newsletter/subscribe")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { newsletterCode?: string; shippingItalyCents?: number } | null) => {
        if (data?.newsletterCode) setSuggestedCode(data.newsletterCode);
        if (typeof data?.shippingItalyCents === "number" && Number.isFinite(data.shippingItalyCents)) {
          setShippingCents(data.shippingItalyCents);
        }
      })
      .catch(() => undefined);
  }, []);

  const discountEuro = promo ? promo.discountCents / 100 : 0;
  const giftCardEuro = giftCard ? giftCard.discountCents / 100 : 0;
  const grandTotal =
    (fulfillment === "shipping" ? total + shippingCents / 100 : total) -
    discountEuro -
    giftCardEuro;

  const canPay = useMemo(() => {
    if (!terms || count === 0) return false;
    if (giftCardOnly) return true;
    if (fulfillment === "shipping") {
      return Boolean(shipping.name && shipping.line1 && shipping.city && shipping.postalCode);
    }
    return Boolean(pickupName.trim() && phone.trim() && pickupAt);
  }, [terms, count, giftCardOnly, fulfillment, shipping, pickupName, phone, pickupAt]);

  const startGiftCardPayment = async () => {
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/gift-card/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amounts: giftCardAmounts }),
      });
      const payload = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !payload.url) {
        throw new Error(payload.error ?? "Impossibile avviare il pagamento gift card.");
      }
      giftCardItems.forEach(remove);
      window.location.assign(payload.url);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const startPay = async () => {
    setError(null);
    if (!canPay) {
      setError(
        fulfillment === "pickup"
          ? "Inserisci nome, telefono e l'orario di ritiro, e accetta i termini."
          : "Accetta i termini e completa i dati di consegna.",
      );
      return;
    }
    if (giftCardOnly) {
      await startGiftCardPayment();
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: physicalItems,
          giftCardAmounts:
            fulfillment === "shipping" && giftCardAmounts.length > 0
              ? giftCardAmounts
              : undefined,
          fulfillment,
          note,
          phone,
          pickupAt: fulfillment === "pickup" ? pickupAt : undefined,
          pickupName: fulfillment === "pickup" ? pickupName : undefined,
          shipping: fulfillment === "shipping" ? shipping : undefined,
          promoCode: promo?.code,
          giftCardCode: giftCard?.code,
        }),
      });
      const raw = await response.text();
      let payload: {
        clientSecret?: string;
        reserved?: boolean;
        alreadyPaid?: boolean;
        orderId?: string;
        error?: string;
      } = {};
      if (raw) {
        try {
          payload = JSON.parse(raw) as typeof payload;
        } catch {
          throw new Error(
            response.ok
              ? "Risposta non valida dalla cassa."
              : "La cassa non si è aperta. Riprova tra poco o scrivici.",
          );
        }
      } else if (!response.ok) {
        throw new Error("La cassa non si è aperta. Riprova tra poco o scrivici.");
      }
      if (payload.alreadyPaid && payload.orderId) {
        clear();
        router.push(`/account/ordini/${payload.orderId}`);
        return;
      }
      if (payload.reserved) {
        const when = pickupSlots.find((slot) => slot.value === pickupAt)?.label ?? "";
        if (giftCardAmounts.length > 0) {
          physicalItems.forEach(remove);
          setReserved({ when, name: pickupName.trim(), hasGiftCards: true });
        } else {
          clear();
          setReserved({ when, name: pickupName.trim(), hasGiftCards: false });
        }
        return;
      }
      if (!response.ok || !payload.clientSecret) {
        throw new Error(payload.error ?? "Impossibile aprire la cassa.");
      }
      setClientSecret(payload.clientSecret);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (count === 0 && !clientSecret && !reserved) {
    return (
      <section className="mx-auto max-w-xl px-5 pb-28 pt-40 text-center">
        <h1 className="font-display text-5xl">Il carrello è vuoto.</h1>
        <Link href="/catalogo" className="mt-8 inline-block text-halo-bright underline underline-offset-4">
          Torna al catalogo
        </Link>
      </section>
    );
  }

  if (reserved) {
    return (
      <section className="mx-auto max-w-xl px-5 pb-28 pt-40 text-center">
        <p className="text-xs uppercase tracking-[0.34em] text-halo">Ritiro prenotato</p>
        <h1 className="mt-4 font-display text-5xl">Ti aspettiamo.</h1>
        <p className="mt-4 text-ivory-dim">
          {reserved.name ? `${reserved.name}, i` : "I"} capi sono prenotati.
          Paghi in negozio al ritiro
          {reserved.when ? `, ${reserved.when}` : ""}.
        </p>
        {reserved.hasGiftCards ? (
          <>
            <p className="mt-4 text-ivory-dim">
              La prenotazione dei capi è completata. Ora puoi acquistare le gift card con un
              pagamento online separato: riceverai una seconda email con i codici.
            </p>
            <p className="mt-3 flex justify-center gap-2 font-display text-2xl">
              <span>Gift card</span>
              <span className="text-halo-bright">{formatPrice(giftCardAmounts.reduce((sum, amount) => sum + amount, 0) / 100)}</span>
            </p>
            {error ? <p className="mt-4 text-sm text-halo">{error}</p> : null}
            <button
              type="button"
              disabled={loading}
              onClick={() => void startGiftCardPayment()}
              className="mt-7 w-full rounded-full bg-ivory px-7 py-4 text-sm font-medium text-ink disabled:opacity-40"
            >
              {loading ? "Apro il pagamento…" : "Paga gift card online"}
            </button>
          </>
        ) : null}
        <p className="mt-3 text-sm text-ivory-dim">
          {storeConfig.address.street}, {storeConfig.address.city}.
        </p>
        <Link
          href="/account"
          className="mt-8 inline-block rounded-full bg-ivory px-7 py-4 text-sm font-medium text-ink"
        >
          Vedi i tuoi ordini
        </Link>
        <ReturnsNotice fulfillment="pickup" />
      </section>
    );
  }

  if (clientSecret && stripePromise) {
    return (
      <section className="mx-auto max-w-2xl px-5 pb-24 pt-40">
        <h1 className="font-display text-5xl">Paga su Halo.</h1>
        <p className="mt-3 mb-8 text-ivory-dim">
          Qui paghi con carta. L’indirizzo di consegna è già quello che hai inserito sopra.
          Questa sessione scade tra 30 minuti: dopo i capi tornano in vetrina.
        </p>
        <div className="overflow-hidden rounded-3xl border border-ink-line bg-ink p-2">
          <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      </section>
    );
  }

  if (giftCardOnly) {
    return (
      <section className="mx-auto max-w-xl px-5 pb-24 pt-40">
        <p className="text-xs uppercase tracking-[0.3em] text-halo">Gift card</p>
        <h1 className="mt-4 font-display text-5xl">Completa il regalo.</h1>
        <p className="mt-4 text-ivory-dim">
          Dopo il pagamento invieremo le gift card all’indirizzo email del tuo account, pronte da
          inoltrare.
        </p>
        <ul className="mt-8 divide-y divide-ink-line border-y border-ink-line">
          {giftCardItems.map((item) => (
            <li key={item.productId} className="flex justify-between gap-4 py-4">
              <span>
                Gift card Halo Store
                <span className="block text-sm text-ivory-dim">€{(item.giftCardAmountCents ?? 0) / 100} × {item.quantity}</span>
              </span>
              <span>{formatPrice(((item.giftCardAmountCents ?? 0) / 100) * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-5 flex justify-between font-display text-3xl">
          <span>Totale</span>
          <span className="text-halo-bright">{formatPrice(total)}</span>
        </p>
        <label className="mt-7 flex items-start gap-3 text-sm text-ivory-dim">
          <input
            type="checkbox"
            checked={terms}
            onChange={(event) => setTerms(event.target.checked)}
            className="mt-1 accent-halo"
          />
          <span>
            Accetto i{" "}
            <Link href="/termini" className="text-halo-bright underline underline-offset-4">termini di vendita</Link>{" "}
            e l&apos;informativa{" "}
            <Link href="/privacy" className="text-halo-bright underline underline-offset-4">privacy</Link>.
          </span>
        </label>
        {error ? <p className="mt-4 text-sm text-halo">{error}</p> : null}
        <button
          type="button"
          disabled={!canPay || loading}
          onClick={startPay}
          className="mt-6 w-full rounded-full bg-ivory py-4 text-sm font-medium text-ink disabled:opacity-40"
        >
          {loading ? "Apro il pagamento…" : "Paga gift card"}
        </button>
      </section>
    );
  }

  return (
    <section className="mx-auto grid max-w-6xl gap-12 px-5 pb-24 pt-40 lg:grid-cols-2">
      <div>
        <p className="text-xs uppercase tracking-[0.34em] text-halo">Cassa</p>
        <h1 className="mt-4 font-display text-5xl text-balance-display">
          Scegli come ricevere il prodotto
        </h1>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {(["pickup", "shipping"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFulfillment(option)}
              className={`rounded-2xl border px-5 py-4 text-left ${
                fulfillment === option ? "border-halo bg-halo/10" : "border-ink-line"
              }`}
            >
              <p className="font-display text-2xl">
                {option === "pickup" ? "Ritiro in negozio" : "Spedizione Italia"}
              </p>
              <p className="mt-1 text-sm text-ivory-dim">
                {option === "pickup"
                  ? `${storeConfig.address.street}`
                  : `Costi di spedizione ${formatPrice(shippingCents / 100)}`}
              </p>
            </button>
          ))}
        </div>

        {fulfillment === "pickup" && (
          <div className="mt-8 grid gap-5">
            <label className="block text-xs uppercase tracking-[0.2em] text-ivory-dim">
              Nome
              <input
                value={pickupName}
                onChange={(event) => setPickupName(event.target.value)}
                autoComplete="name"
                placeholder="Nome e cognome di chi ritira"
                className={fieldClass}
              />
            </label>
            <label className="block text-xs uppercase tracking-[0.2em] text-ivory-dim">
              Telefono
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                type="tel"
                autoComplete="tel"
                placeholder="Per confermare il ritiro"
                className={fieldClass}
              />
            </label>
            <fieldset>
              <legend className="text-xs uppercase tracking-[0.2em] text-ivory-dim">
                Quando ritiri
              </legend>
              <p className="mt-2 text-sm text-ivory-dim">
                Prenota un orario entro 48 ore, negli orari di apertura.
              </p>
              {pickupGroups.length === 0 ? (
                <p className="mt-3 rounded-2xl border border-ink-line px-4 py-3 text-sm text-ivory-dim">
                  In questo momento non ci sono fasce libere entro 48 ore. Riprova più
                  tardi oppure scegli la spedizione.
                </p>
              ) : (
                <div className="mt-4 space-y-5">
                  {pickupGroups.map((group) => (
                    <div key={group.label}>
                      <p className="text-sm text-ivory">{group.label}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {group.slots.map((slot) => {
                          const selected = pickupAt === slot.value;
                          return (
                            <button
                              key={slot.value}
                              type="button"
                              onClick={() => setPickupAt(slot.value)}
                              aria-pressed={selected}
                              className={`rounded-full border px-4 py-2 text-sm ${
                                selected
                                  ? "border-halo bg-halo/15 text-halo-bright"
                                  : "border-ink-line text-ivory-dim hover:border-ivory/40 hover:text-ivory"
                              }`}
                            >
                              {slot.time}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </fieldset>
          </div>
        )}

        {fulfillment === "shipping" && (
          <div className="mt-8 grid gap-3">
            <p className="text-sm text-ivory-dim">
              Indirizzo di consegna. Al pagamento Stripe chiede solo la carta, non di nuovo questi
              dati.
            </p>
            <input
              value={shipping.name}
              onChange={(event) => setShipping({ ...shipping, name: event.target.value })}
              placeholder="Nome e cognome"
              className="rounded-xl border border-ink-line bg-ink/60 px-4 py-3 text-sm"
            />
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              type="tel"
              placeholder="Telefono"
              className="rounded-xl border border-ink-line bg-ink/60 px-4 py-3 text-sm"
            />
            <input
              value={shipping.line1}
              onChange={(event) => setShipping({ ...shipping, line1: event.target.value })}
              placeholder="Indirizzo"
              className="rounded-xl border border-ink-line bg-ink/60 px-4 py-3 text-sm"
            />
            <div className="grid grid-cols-3 gap-3">
              <input
                value={shipping.postalCode}
                onChange={(event) => setShipping({ ...shipping, postalCode: event.target.value })}
                placeholder="CAP"
                className="rounded-xl border border-ink-line bg-ink/60 px-4 py-3 text-sm"
              />
              <input
                value={shipping.city}
                onChange={(event) => setShipping({ ...shipping, city: event.target.value })}
                placeholder="Città"
                className="col-span-2 rounded-xl border border-ink-line bg-ink/60 px-4 py-3 text-sm"
              />
            </div>
            <input
              value={shipping.province}
              onChange={(event) => setShipping({ ...shipping, province: event.target.value })}
              placeholder="Provincia"
              className="rounded-xl border border-ink-line bg-ink/60 px-4 py-3 text-sm"
            />
          </div>
        )}

        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={3}
          placeholder="Note per il negozio (facoltativo)"
          className="mt-6 w-full resize-none rounded-xl border border-ink-line bg-ink/60 px-4 py-3 text-sm"
        />

        <div className="mt-6">
          <p className="text-sm text-ivory-dim">Codice sconto newsletter o compleanno</p>
          <div className="mt-2 flex gap-2">
            <input
              value={promoCode}
              onChange={(event) => {
                setPromoCode(event.target.value);
                setPromo(null);
              }}
              placeholder={suggestedCode}
              className="w-full rounded-xl border border-ink-line bg-ink/60 px-4 py-3 text-sm uppercase"
            />
            <button
              type="button"
              disabled={promoBusy || !promoCode.trim()}
              onClick={async () => {
                setPromoBusy(true);
                setError(null);
                try {
                  const response = await fetch("/api/checkout/quote", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      code: promoCode,
                      giftCardCode: giftCard?.code,
                      fulfillment,
                      items,
                    }),
                  });
                  const payload = (await response.json()) as {
                    error?: string;
                    needNewsletter?: boolean;
                    code?: string;
                    percent?: number;
                    discountCents?: number;
                  };
                  if (!response.ok || !payload.code || payload.discountCents == null) {
                    setPromo(null);
                    if (payload.needNewsletter) requestNewsletterPopup();
                    throw new Error(payload.error ?? "Codice non valido.");
                  }
                  setPromo({
                    code: payload.code,
                    percent: payload.percent ?? 0,
                    discountCents: payload.discountCents,
                  });
                } catch (err) {
                  setError((err as Error).message);
                } finally {
                  setPromoBusy(false);
                }
              }}
              className="shrink-0 rounded-full border border-ink-line px-4 text-sm disabled:opacity-40"
            >
              {promoBusy ? "…" : "Applica"}
            </button>
          </div>
          <p className="mt-2 text-xs text-ivory-dim">
            Suggerimento: {suggestedCode} dopo l&apos;iscrizione alla newsletter.
          </p>
        </div>

        <div className="mt-6">
          <p className="text-sm text-ivory-dim">Gift card</p>
          <div className="mt-2 flex gap-2">
            <input
              value={giftCardInput}
              onChange={(event) => {
                setGiftCardInput(event.target.value);
                setGiftCard(null);
                setPromo(null);
              }}
              placeholder="HALO-XXXX-XXXX-XXXX-XXXX-XXXX"
              className="w-full rounded-xl border border-ink-line bg-ink/60 px-4 py-3 text-sm uppercase"
              autoComplete="off"
            />
            <button
              type="button"
              disabled={giftCardBusy || !giftCardInput.trim()}
              onClick={async () => {
                setGiftCardBusy(true);
                setError(null);
                setPromo(null);
                try {
                  const response = await fetch("/api/checkout/quote", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      giftCardCode: giftCardInput,
                      fulfillment,
                      items,
                    }),
                  });
                  const payload = (await response.json()) as {
                    error?: string;
                    giftCardCode?: string;
                    giftCardCents?: number;
                    remainingAfterCents?: number;
                  };
                  if (!response.ok || !payload.giftCardCode || !payload.giftCardCents) {
                    throw new Error(payload.error ?? "Gift card non valida.");
                  }
                  setGiftCard({
                    code: payload.giftCardCode,
                    discountCents: payload.giftCardCents,
                    remainingAfterCents: payload.remainingAfterCents ?? 0,
                  });
                } catch (cause) {
                  setGiftCard(null);
                  setError(cause instanceof Error ? cause.message : "Impossibile verificare il codice.");
                } finally {
                  setGiftCardBusy(false);
                }
              }}
              className="shrink-0 rounded-full border border-ink-line px-4 text-sm disabled:opacity-40"
            >
              {giftCardBusy ? "…" : "Applica"}
            </button>
          </div>
          {giftCard ? (
            <p className="mt-2 text-xs text-halo-bright">
              Applicato {formatPrice(giftCard.discountCents / 100)}
              {giftCard.remainingAfterCents > 0
                ? ` · Restano ${formatPrice(giftCard.remainingAfterCents / 100)}`
                : " · Credito esaurito con questo ordine"}
            </p>
          ) : null}
        </div>

        <label className="mt-6 flex items-start gap-3 text-sm text-ivory-dim">
          <input
            type="checkbox"
            checked={terms}
            onChange={(event) => setTerms(event.target.checked)}
            className="mt-1 accent-halo"
          />
          <span>
            Accetto i{" "}
            <Link href="/termini" className="text-halo-bright underline underline-offset-4">
              termini di vendita
            </Link>{" "}
            e l&apos;informativa{" "}
            <Link href="/privacy" className="text-halo-bright underline underline-offset-4">
              privacy
            </Link>
            {fulfillment === "shipping"
              ? " e il diritto di recesso entro 14 giorni sulle vendite a distanza."
              : ". Il pagamento avviene in negozio al ritiro."}
          </span>
        </label>
      </div>

      <div>
        <div className="rounded-3xl border border-ink-line bg-ink-soft p-6">
          <h2 className="font-display text-3xl">Riepilogo</h2>
          <ul className="mt-6 space-y-4">
            {items.map((item) => {
              if (item.giftCardAmountCents) {
                return (
                  <li
                    key={item.productId}
                    className="flex justify-between gap-4 text-sm"
                  >
                    <span>
                      Gift card Halo Store
                      <span className="block text-ivory-dim">
                        {formatPrice(item.giftCardAmountCents / 100)} × {item.quantity}
                      </span>
                    </span>
                    <span>
                      {formatPrice((item.giftCardAmountCents / 100) * item.quantity)}
                    </span>
                  </li>
                );
              }
              const product = productById(item.productId);
              if (!product) return null;
              return (
                <li key={`${item.productId}-${item.size}-${item.color}`} className="flex justify-between gap-4 text-sm">
                  <span>
                    {product.name}
                    <span className="block text-ivory-dim">
                      {item.size} · {item.color} × {item.quantity}
                    </span>
                  </span>
                  <span>{formatPrice(product.price * item.quantity)}</span>
                </li>
              );
            })}
          </ul>
          {giftCardAmounts.length > 0 ? (
            <p className="mt-4 rounded-xl border border-ink-line px-4 py-3 text-sm text-ivory-dim">
              {fulfillment === "shipping"
                ? "Capi e gift card saranno pagati insieme in un’unica transazione. Riceverai due email: la conferma dell’ordine e quella con i codici gift card."
                : "Con il ritiro, prima prenoti i capi e li paghi in negozio; dopo completerai online il pagamento delle gift card."}
            </p>
          ) : null}
          {fulfillment === "shipping" ? (
            <p className="mt-6 flex justify-between border-t border-ink-line pt-4 text-sm">
              <span>Spedizione</span>
              <span>{formatPrice(shippingCents / 100)}</span>
            </p>
          ) : null}
          {promo && (
            <p className="mt-2 flex justify-between text-sm text-halo-bright">
              <span>
                Sconto {promo.code} · {promo.percent}%
              </span>
              <span>−{formatPrice(promo.discountCents / 100)}</span>
            </p>
          )}
          {giftCard ? (
            <p className="mt-2 flex justify-between text-sm text-halo-bright">
              <span>Gift card · {giftCard.code}</span>
              <span>−{formatPrice(giftCard.discountCents / 100)}</span>
            </p>
          ) : null}
          {fulfillment === "pickup" && pickupAt && (
            <p className="mt-2 text-sm text-ivory-dim">
              Ritiro: {pickupSlots.find((slot) => slot.value === pickupAt)?.label}
            </p>
          )}
          {fulfillment === "pickup" ? (
            <>
              {giftCardAmounts.length > 0 ? (
                <>
                  <p className="mt-4 flex justify-between text-sm">
                    <span>Da pagare in negozio per i capi</span>
                    <span>
                      {formatPrice(
                        total -
                          giftCardAmounts.reduce((sum, amount) => sum + amount, 0) / 100 -
                          discountEuro -
                          giftCardEuro,
                      )}
                    </span>
                  </p>
                  <p className="mt-2 flex justify-between text-sm">
                    <span>Gift card da pagare online</span>
                    <span>{formatPrice(giftCardAmounts.reduce((sum, amount) => sum + amount, 0) / 100)}</span>
                  </p>
                </>
              ) : (
                <>
                  <p className="mt-4 flex justify-between text-sm">
                    <span>Da pagare adesso</span>
                    <span>0 €</span>
                  </p>
                  <p className="mt-2 flex justify-between font-display text-3xl">
                    <span>In negozio</span>
                    <span className="text-halo-bright">{formatPrice(grandTotal)}</span>
                  </p>
                  <p className="mt-2 text-sm text-ivory-dim">
                    Prenoti i capi. Paghi in cassa quando li ritiri.
                  </p>
                </>
              )}
            </>
          ) : (
            <p className="mt-2 flex justify-between font-display text-3xl">
              <span>Totale</span>
              <span className="text-halo-bright">{formatPrice(grandTotal)}</span>
            </p>
          )}
          {error && <p className="mt-4 text-sm text-halo">{error}</p>}
          <button
            type="button"
            disabled={!canPay || loading}
            onClick={startPay}
            className="mt-6 w-full rounded-full bg-ivory py-4 text-sm font-medium text-ink disabled:opacity-40"
          >
            {loading
              ? fulfillment === "pickup"
                ? "Prenoto il ritiro…"
                : "Apro la cassa…"
              : fulfillment === "pickup"
                ? "Prenota il ritiro"
                : "Paga"}
          </button>
          <p className="mt-3 text-center text-xs text-ivory-dim">IVA inclusa.</p>
        </div>
      </div>
    </section>
  );
}
