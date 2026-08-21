"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { RevealWords } from "@/components/reveal";
import { ProductCard } from "@/components/product-card";
import { ProductDialog } from "@/components/product-dialog";
import { formatPrice, getColorLook, type Product, type StoreCategory } from "@/lib/products";
import { catalogFilters } from "@/lib/categories";

function collectColors(products: Product[]) {
  const unique = new Map<string, string>();
  for (const product of products) {
    const names = [
      ...(product.colors ?? []),
      ...(product.variants ?? []).map((variant) => variant.color),
    ];
    for (const name of names) {
      const trimmed = name.trim();
      if (!trimmed || trimmed === "—") continue;
      const key = trimmed.toLowerCase();
      if (!unique.has(key)) unique.set(key, trimmed);
    }
  }
  return [...unique.values()].sort((a, b) => a.localeCompare(b, "it"));
}

function productHasColor(product: Product, color: string) {
  const key = color.toLowerCase();
  if ((product.colors ?? []).some((name) => name.toLowerCase() === key)) return true;
  return (product.variants ?? []).some((variant) => variant.color.toLowerCase() === key);
}

function CategoryRail({
  filters,
  active,
  onChange,
  layoutId,
  bleed = false,
}: {
  filters: StoreCategory[];
  active: string;
  onChange: (id: string) => void;
  layoutId: string;
  bleed?: boolean;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState(false);
  const [scrollMax, setScrollMax] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const measure = () => {
      const max = Math.max(0, el.scrollWidth - el.clientWidth);
      setOverflow(max > 2);
      setScrollMax(max);
      setScrollLeft(el.scrollLeft);
    };

    measure();
    const frame = window.requestAnimationFrame(measure);
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    el.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      el.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [filters]);

  return (
    <div className={bleed ? "-mx-5" : undefined}>
      <div className="relative">
        <div
          ref={scrollerRef}
          className={`overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${bleed ? "px-5" : ""}`}
        >
          <div
            className={`flex w-max gap-1.5 ${overflow ? "" : "min-w-full justify-center"}`}
            role="tablist"
            aria-label="Categorie del catalogo"
          >
            {filters.map((category) => {
              const isActive = active === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => onChange(category.id)}
                  className={`relative shrink-0 rounded-full px-4 py-2 text-sm transition-colors duration-300 ${
                    isActive ? "text-ink" : "text-ivory-dim hover:text-ivory"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId={layoutId}
                      className="absolute inset-0 rounded-full bg-ivory"
                      transition={{ type: "spring", stiffness: 320, damping: 32 }}
                    />
                  )}
                  <span className="relative">{category.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        {overflow ? (
          <>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-ink to-transparent"
              style={{ opacity: scrollLeft > 4 ? 1 : 0 }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-ink to-transparent"
              style={{ opacity: scrollLeft < scrollMax - 4 ? 1 : 0 }}
            />
          </>
        ) : null}
      </div>
      {overflow ? (
        <input
          type="range"
          min={0}
          max={scrollMax}
          value={scrollLeft}
          aria-label="Scorri le categorie"
          className="halo-slider mx-auto mt-3 block w-24"
          onChange={(event) => {
            const el = scrollerRef.current;
            if (!el) return;
            el.scrollLeft = Number(event.target.value);
          }}
        />
      ) : null}
    </div>
  );
}

function ColorSwatches({
  colors,
  value,
  onChange,
  align = "end",
}: {
  colors: string[];
  value: string;
  onChange: (color: string) => void;
  align?: "end" | "start";
}) {
  if (!colors.length) return null;
  return (
    <div
      className={`halo-scrollbar flex max-h-16 flex-wrap content-start gap-2 overflow-y-auto py-0.5 pr-1.5 ${align === "end" ? "justify-end" : "justify-start"}`}
      aria-label="Filtra per colore"
    >
      {colors.map((name) => {
        const look = getColorLook(name);
        const isActive = value.toLowerCase() === name.toLowerCase();
        return (
          <button
            key={name}
            type="button"
            title={name}
            aria-pressed={isActive}
            onClick={() => onChange(isActive ? "" : name)}
            className={`h-4 w-4 shrink-0 rounded-full border ${
              isActive ? "scale-110 border-ivory" : "border-ink-line/80"
            }`}
            style={{ backgroundColor: look.hex }}
          >
            <span className="sr-only">{name}</span>
          </button>
        );
      })}
    </div>
  );
}

function PriceFilter({
  minPrice,
  maxPrice,
  value,
  onChange,
}: {
  minPrice: number;
  maxPrice: number;
  value: number;
  onChange: (value: number) => void;
}) {
  if (maxPrice <= minPrice) {
    return (
      <p className="text-[11px] uppercase tracking-[0.22em] text-ivory-dim">
        {formatPrice(maxPrice || minPrice)}
      </p>
    );
  }
  return (
    <label className="block text-[11px] uppercase tracking-[0.22em] text-ivory-dim">
      Fino a {formatPrice(value)}
      <input
        type="range"
        min={minPrice}
        max={maxPrice}
        value={Math.min(maxPrice, Math.max(minPrice, value))}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-2 h-1 w-full cursor-pointer appearance-none rounded-full bg-ink-line accent-ivory"
        aria-label="Filtra per prezzo massimo"
      />
    </label>
  );
}

export function Catalog({
  products,
  categories,
}: {
  products: Product[];
  categories: StoreCategory[];
}) {
  const router = useRouter();
  const filters = catalogFilters(categories, products.length);
  const [active, setActive] = useState("tutti");
  const [maxSelected, setMaxSelected] = useState(0);
  const [color, setColor] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);
  const ceiling = useRef(0);

  const scoped = useMemo(
    () =>
      active === "tutti"
        ? products
        : products.filter((product) => product.category === active),
    [active, products],
  );
  const prices = scoped.map((product) => product.price);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  const colors = useMemo(() => collectColors(scoped), [scoped]);

  useEffect(() => {
    const refresh = () => router.refresh();
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [router]);

  useEffect(() => {
    if (active !== "tutti" && !categories.some((category) => category.id === active)) {
      setActive("tutti");
    }
  }, [active, categories]);

  useEffect(() => {
    setMaxSelected((current) => {
      const followed = current >= ceiling.current - 0.5 || current === 0;
      ceiling.current = maxPrice;
      if (followed) return maxPrice;
      return Math.min(maxPrice, Math.max(minPrice, current));
    });
  }, [minPrice, maxPrice, active]);

  useEffect(() => {
    if (!color) return;
    if (!colors.some((name) => name.toLowerCase() === color.toLowerCase())) setColor("");
  }, [color, colors]);

  const visible = useMemo(
    () =>
      scoped.filter((product) => {
        if (product.price > maxSelected) return false;
        if (color && !productHasColor(product, color)) return false;
        return true;
      }),
    [color, maxSelected, scoped],
  );

  return (
    <section
      id="catalogo"
      className="relative scroll-mt-24 border-t border-ink-line py-24 sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="text-center">
          <h2 className="font-display text-[clamp(2.6rem,6vw,4.6rem)] leading-[0.95] tracking-tight">
            <RevealWords text="Il catalogo" className="block" />
          </h2>
        </div>

        <div className="mt-10 lg:hidden">
          <CategoryRail
            filters={filters}
            active={active}
            onChange={setActive}
            layoutId="filtro-attivo-mobile"
            bleed
          />
          <div className="mt-6 grid grid-cols-2 items-end gap-5">
            <PriceFilter minPrice={minPrice} maxPrice={maxPrice} value={maxSelected} onChange={setMaxSelected} />
            <ColorSwatches colors={colors} value={color} onChange={setColor} />
          </div>
        </div>

        <div className="mt-14 hidden items-center gap-8 lg:grid lg:grid-cols-[minmax(9rem,14rem)_minmax(0,1fr)_minmax(9rem,14rem)]">
          <PriceFilter minPrice={minPrice} maxPrice={maxPrice} value={maxSelected} onChange={setMaxSelected} />
          <CategoryRail
            filters={filters}
            active={active}
            onChange={setActive}
            layoutId="filtro-attivo"
          />
          <ColorSwatches colors={colors} value={color} onChange={setColor} />
        </div>

        <p className="mt-8 text-center text-[11px] uppercase tracking-[0.22em] text-ivory-dim">
          {visible.length} {visible.length === 1 ? "capo" : "capi"}
        </p>

        {visible.length === 0 ? (
          <p className="mt-16 text-center text-sm text-ivory-dim">Nessun capo con questi filtri.</p>
        ) : (
          <motion.div className="mt-10 grid grid-cols-2 items-stretch gap-x-3 gap-y-10 sm:gap-x-6 sm:gap-y-12 lg:mt-12 lg:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {visible.map((product, index) => (
                <ProductCard
                  key={product.uuid ?? product.id}
                  product={product}
                  index={index}
                  onOpen={setSelected}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <ProductDialog product={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
