"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/components/reservation-provider";
import { formatPrice } from "@/lib/products";
import { orderStatusLabel, type OrderStatus } from "@/lib/orders";

type OrderPayload = {
  id: string;
  status: string;
  fulfillment: string;
  totalCents: number;
  shippingCents: number;
  items: Array<{
    name: string;
    size: string;
    color: string;
    quantity: number;
    unitPriceCents: number;
    imageUrl: string | null;
  }>;
};

function SuccessBody() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const { clear } = useCart();
  const [phase, setPhase] = useState<"wait" | "ok" | "fail">("wait");
  const [order, setOrder] = useState<OrderPayload | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setPhase("fail");
      return;
    }
    let cancelled = false;
    let attempts = 0;

    const poll = async () => {
      attempts += 1;
      try {
        const response = await fetch(`/api/orders/session/${sessionId}`);
        const payload = (await response.json()) as OrderPayload & { status?: string; error?: string };
        if (cancelled) return;
        if (response.ok && payload.id && payload.status && payload.status !== "pending_payment") {
          setOrder(payload);
          setPhase("ok");
          clear();
          return;
        }
      } catch {
        // retry
      }
      if (attempts >= 20) {
        setPhase("fail");
        return;
      }
      window.setTimeout(poll, 1500);
    };

    void poll();
    return () => {
      cancelled = true;
    };
  }, [sessionId, clear]);

  if (phase === "wait") {
    return (
      <section className="mx-auto max-w-xl px-5 py-28 text-center">
        <p className="text-xs uppercase tracking-[0.34em] text-halo">Pagamento</p>
        <h1 className="mt-4 font-display text-5xl">Stiamo confermando l&apos;ordine.</h1>
        <p className="mt-4 text-ivory-dim">
          Il pagamento è in verifica. Resta su questa pagina, ci vuole un attimo.
        </p>
      </section>
    );
  }

  if (phase === "ok" && order) {
    return (
      <section className="mx-auto max-w-2xl px-5 py-24">
        <p className="text-xs uppercase tracking-[0.34em] text-halo">Grazie</p>
        <h1 className="mt-4 font-display text-5xl">Ordine confermato.</h1>
        <p className="mt-3 text-ivory-dim">
          #{order.id.slice(0, 8)} ·{" "}
          {order.fulfillment === "pickup" ? "Ritiro in negozio" : "Spedizione"} ·{" "}
          {orderStatusLabel[order.status as OrderStatus] ?? "Pagato"}
        </p>
        <p className="mt-2 text-sm text-ivory-dim">Ti abbiamo mandato la conferma via email.</p>

        <ul className="mt-10 divide-y divide-ink-line border-y border-ink-line">
          {order.items.map((item, index) => (
            <li key={`${item.name}-${index}`} className="flex items-center gap-4 py-4">
              <span className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl border border-ink-line bg-ink-soft">
                {item.imageUrl ? (
                  <Image src={item.imageUrl} alt={item.name} fill sizes="64px" className="object-cover" />
                ) : null}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-2xl leading-none">{item.name}</p>
                <p className="mt-2 text-sm text-ivory-dim">
                  {item.size} · {item.color} × {item.quantity}
                </p>
              </div>
              <span className="shrink-0 text-sm text-halo-bright">
                {formatPrice((item.unitPriceCents * item.quantity) / 100)}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-5 font-display text-3xl text-halo-bright">{formatPrice(order.totalCents / 100)}</p>

        <Link
          href={`/account/ordini/${order.id}`}
          className="mt-8 inline-flex rounded-full bg-ivory px-7 py-4 text-sm font-medium text-ink"
        >
          Vedi i dettagli dell&apos;ordine
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-xl px-5 py-28 text-center">
      <h1 className="font-display text-5xl">Non abbiamo ancora l&apos;ordine.</h1>
      <p className="mt-4 text-ivory-dim">
        Se hai pagato, apri l&apos;account: l&apos;ordine può comparire lì con un piccolo ritardo.
      </p>
      <Link href="/account" className="mt-8 inline-block text-halo-bright underline underline-offset-4">
        Vai all&apos;account
      </Link>
    </section>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <section className="px-5 py-28 text-center text-ivory-dim">Conferma in corso…</section>
      }
    >
      <SuccessBody />
    </Suspense>
  );
}
