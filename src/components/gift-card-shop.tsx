"use client";

import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/components/reservation-provider";
import { GIFT_CARD_AMOUNTS_EUR } from "@/lib/gift-card-constants";
import { formatPrice } from "@/lib/products";
import { SiteMediaView } from "@/components/site-media";
import type { SiteMedia } from "@/lib/site";

export function GiftCardShop({ media }: { media: SiteMedia }) {
  const { addGiftCard, openBag } = useCart();
  const [amount, setAmount] = useState<number>(25);
  const [added, setAdded] = useState(false);

  return (
    <section
      id="gift-card"
      className="bg-white pb-8 text-[#3f1521] sm:pb-12"
      aria-labelledby="gift-card-title"
    >
      <div className="w-full">
        <div className="relative aspect-video w-full overflow-hidden bg-[#c5cebc]">
          <SiteMediaView
            key={media.url}
            media={media}
            alt="Video gift card Halo Store"
            playback="visible"
          />
        </div>

        <div className="mx-auto max-w-5xl px-5 py-9 text-center sm:px-8 sm:py-12">
          <div>
            <p className="text-[clamp(0.625rem,1vw,0.75rem)] uppercase tracking-[0.24em] text-ivory-dim">
              <strong>Gift Card</strong>
            </p>
            <h2
              id="gift-card-title"
              className="mt-2 font-display text-[clamp(1.875rem,4vw,2.75rem)] text-[#3f1521]"
            >
              Il regalo perfetto!
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-ivory-dim sm:text-base">
              Scegli l’importo: riceverai via email una card digitale con un codice univoco da
              inoltrare. Il credito si usa anche in più acquisti, fino a esaurimento.
            </p>
          </div>

          <div className="mx-auto mt-8 w-full max-w-130">
            <p className="text-xs uppercase tracking-[0.18em] text-ivory-dim">
              Scegli l’importo
            </p>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {GIFT_CARD_AMOUNTS_EUR.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setAmount(value);
                    setAdded(false);
                  }}
                  aria-pressed={amount === value}
                  className={`rounded-md border px-2 py-[clamp(0.6rem,1.4vw,0.85rem)] text-[clamp(0.7rem,1.2vw,0.875rem)] transition-colors ${
                    amount === value
                      ? "border-[#3f1521] bg-[#3f1521] text-white"
                      : "border-[#3f1521]/20 bg-white text-[#3f1521] hover:border-[#3f1521]"
                  }`}
                >
                  {formatPrice(value)}
                </button>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-[#3f1521]/15 pt-4">
              <span className="text-sm text-ivory-dim">Totale gift card</span>
              <span className="font-display text-2xl text-[#3f1521]">{formatPrice(amount)}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                addGiftCard(amount * 100);
                setAdded(true);
                openBag();
              }}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-[#3f1521] px-5 py-[clamp(0.85rem,1.8vw,1.1rem)] text-[clamp(0.7rem,1.2vw,0.875rem)] font-medium uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#65203a]"
            >
              <ShoppingBag className="h-4 w-4" aria-hidden />
              {added ? "Aggiunta al carrello" : "Aggiungi al carrello"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
