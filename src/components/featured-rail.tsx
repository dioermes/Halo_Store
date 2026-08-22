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
    <section id={id} className="halo-section relative scroll-mt-28 border-t border-ink-line/45">
      <div className="halo-shell">
        <h2 className="halo-display text-center text-[clamp(2.75rem,6.4vw,5rem)]">
          <RevealWords text={title} className="block" />
        </h2>

        <div className="halo-product-grid mt-16 sm:mt-20">
          {featured.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} onOpen={setSelected} />
          ))}
        </div>

        {extra.length > 0 ? (
          <div className="mt-16 flex flex-col items-center sm:mt-20">
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              className="group flex min-h-11 flex-col items-center gap-3 text-xs uppercase tracking-[0.32em] text-ivory-dim transition-colors duration-500 hover:text-halo-bright sm:text-sm"
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
                  <div className="halo-product-grid mt-16">
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

