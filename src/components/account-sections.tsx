"use client";

import { useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/products";
import { orderStatusLabel, type OrderStatus } from "@/lib/orders";

type AccountOrder = {
  id: string;
  status: string;
  fulfillment: string;
  total_cents: number;
  tracking_code: string | null;
};

type AccountGiftCard = {
  id: string;
  code: string;
  initial_balance_cents: number;
  balance_cents: number;
};

export function AccountSections({
  orders,
  giftCards,
}: {
  orders: AccountOrder[];
  giftCards: AccountGiftCard[];
}) {
  const [activeSection, setActiveSection] = useState<"orders" | "gift-cards">("orders");

  return (
    <div className="mt-16">
      <div className="flex gap-6 border-b border-ink-line">
        <button
          type="button"
          onClick={() => setActiveSection("orders")}
          aria-pressed={activeSection === "orders"}
          className={`border-b-2 pb-3 font-display text-3xl transition-colors ${
            activeSection === "orders"
              ? "border-halo text-ivory"
              : "border-transparent text-ivory-dim hover:text-ivory"
          }`}
        >
          Ordini
        </button>
        {giftCards.length > 0 ? (
          <button
            type="button"
            onClick={() => setActiveSection("gift-cards")}
            aria-pressed={activeSection === "gift-cards"}
            className={`border-b-2 pb-3 font-display text-3xl transition-colors ${
              activeSection === "gift-cards"
                ? "border-halo text-ivory"
                : "border-transparent text-ivory-dim hover:text-ivory"
            }`}
          >
            Gift card
          </button>
        ) : null}
      </div>

      {activeSection === "orders" ? (
        <ul className="mt-6 space-y-4">
          {orders.length === 0 ? (
            <li className="text-ivory-dim">
              Nessun ordine ancora. Il catalogo è a un tocco di distanza.
            </li>
          ) : null}
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/account/ordini/${order.id}`}
                className="block rounded-2xl border border-ink-line p-5 transition-colors hover:border-halo/50"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <p className="font-display text-2xl">#{order.id.slice(0, 8)}</p>
                  <p className="text-sm text-halo-bright">
                    {orderStatusLabel[order.status as OrderStatus]}
                  </p>
                </div>
                <p className="mt-2 text-sm text-ivory-dim">
                  {order.fulfillment === "pickup" ? "Ritiro in negozio" : "Spedizione"} ·{" "}
                  {order.fulfillment === "pickup" &&
                  order.status !== "completed" &&
                  order.status !== "cancelled"
                    ? `Da pagare in negozio ${formatPrice(order.total_cents / 100)}`
                    : formatPrice(order.total_cents / 100)}
                  {order.tracking_code ? ` · tracking ${order.tracking_code}` : ""}
                </p>
                <p className="mt-3 text-xs text-halo-bright">Vedi i dettagli</p>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="mt-6 space-y-4">
          {giftCards.map((card) => (
            <li
              key={card.id}
              className="rounded-2xl border border-ink-line p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-display text-2xl">Gift card Halo Store</p>
                  <p className="mt-2 font-mono text-sm tracking-wide text-ivory-dim">
                    {card.code}
                  </p>
                </div>
                <p
                  className={`text-sm ${
                    card.balance_cents > 0 ? "text-halo-bright" : "text-ivory-dim"
                  }`}
                >
                  {card.balance_cents > 0 ? "Credito disponibile" : "Credito esaurito"}
                </p>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-4 border-t border-ink-line pt-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-ivory-dim">
                    Valore iniziale
                  </p>
                  <p className="mt-1 font-display text-2xl">
                    {formatPrice(card.initial_balance_cents / 100)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-ivory-dim">
                    Credito residuo
                  </p>
                  <p className="mt-1 font-display text-2xl text-halo-bright">
                    {formatPrice(card.balance_cents / 100)}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
