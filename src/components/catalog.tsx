"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Reveal, RevealWords } from "@/components/reveal";
import { ProductCard } from "@/components/product-card";
import { ProductDialog } from "@/components/product-dialog";
import { type Product, type StoreCategory } from "@/lib/products";
import { catalogFilters } from "@/lib/categories";

export function Catalog({
  products,
  categories,
}: {
  products: Product[];
  categories: StoreCategory[];
}) {
  const filters = catalogFilters(categories, products.length);
  const [active, setActive] = useState("tutti");
  const [selected, setSelected] = useState<Product | null>(null);

  const visible = useMemo(
    () =>
      active === "tutti"
        ? products
        : products.filter((product) => product.category === active),
    [active, products],
  );

  return (
    <section
      id="catalogo"
      className="relative border-t border-ink-line py-24 sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Reveal>
              <p className="text-xs uppercase tracking-[0.34em] text-halo">
                Catalogo
              </p>
            </Reveal>
            <h2 className="mt-6 font-display text-[clamp(2.6rem,6vw,4.6rem)] leading-[0.95] tracking-tight">
              <RevealWords text="Guardali qui," className="block" />
              <RevealWords
                text="provali in negozio"
                className="block italic text-ivory-dim"
                delay={0.1}
              />
            </h2>
          </div>
          <Reveal delay={0.2} className="max-w-sm">
            <p className="leading-relaxed text-ivory-dim">
              Scegli taglia e colore e metti nel carrello. Ritiro in negozio a
              Conversano: prenoti e paghi in cassa. Spedizione in Italia: paghi
              sul sito.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 flex flex-wrap gap-2" role="tablist" aria-label="Categorie del catalogo">
          {filters.map((category) => {
            const isActive = active === category.id;
            return (
              <button
                key={category.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActive(category.id)}
                className={`relative rounded-full px-5 py-2.5 text-sm transition-colors duration-300 ${
                  isActive ? "text-ink" : "text-ivory-dim hover:text-ivory"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="filtro-attivo"
                    className="absolute inset-0 rounded-full bg-ivory"
                    transition={{ type: "spring", stiffness: 320, damping: 32 }}
                  />
                )}
                <span className="relative">{category.label}</span>
              </button>
            );
          })}
        </div>

        <p className="mt-4 text-sm text-ivory-dim">
          {visible.length} {visible.length === 1 ? "capo disponibile" : "capi disponibili"}
          {active !== "tutti" && (
            <>
              {" · "}
              {filters.find((category) => category.id === active)?.hint}
            </>
          )}
        </p>

        <motion.div
          layout
          className="mt-12 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-y-4"
        >
          <AnimatePresence mode="popLayout">
            {visible.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                onOpen={setSelected}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <ProductDialog product={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
