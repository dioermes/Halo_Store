"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { RevealWords } from "@/components/reveal";
import { ProductCard } from "@/components/product-card";
import { ProductDialog } from "@/components/product-dialog";
import type { Product } from "@/lib/products";

export function FeaturedRail({
  id,
  title,
  featured,
  rest,
}: {
  id: string;
  title: string;
  featured: Product[];
  rest: Product[];
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);
  const extra = useMemo(
    () =>
      rest.filter(
        (product) =>
          !featured.some(
            (row) => (row.uuid ?? row.id) === (product.uuid ?? product.id) || row.id === product.id,
          ),
      ),
    [featured, rest],
  );

  if (!featured.length && !extra.length) return null;

  return (
    <section id={id} className="relative scroll-mt-24 border-t border-ink-line py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <h2 className="text-center font-display text-[clamp(2.6rem,6vw,4.6rem)] leading-[0.95] tracking-tight">
          <RevealWords text={title} className="block" />
        </h2>

        <div className="mt-12 grid grid-cols-2 items-stretch gap-x-3 gap-y-10 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-4">
          {featured.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} onOpen={setSelected} />
          ))}
        </div>

        {extra.length > 0 ? (
          <div className="mt-12 flex flex-col items-center">
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              className="group flex flex-col items-center gap-2 text-sm uppercase tracking-[0.28em] text-ivory-dim transition-colors hover:text-halo-bright"
            >
              Scopri di più
              <ChevronDown
                className={`h-6 w-6 transition-transform duration-500 ${open ? "rotate-180" : ""}`}
                aria-hidden
              />
            </button>
            <AnimatePresence initial={false}>
              {open ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full overflow-hidden"
                >
                  <div className="mt-12 grid grid-cols-2 items-stretch gap-x-3 gap-y-10 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-4">
                    {extra.map((product, index) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        index={index + featured.length}
                        onOpen={setSelected}
                      />
                    ))}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        ) : null}
      </div>
      <ProductDialog product={selected} onClose={() => setSelected(null)} />
    </section>
  );
}

