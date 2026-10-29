"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { RevealWords } from "@/components/reveal";
import { ProductCard } from "@/components/product-card";
import {
  formatPrice,
  getColorLook,
  productHasCategory,
  type Product,
  type StoreCategory,
} from "@/lib/products";
import { catalogFilters, catalogPath } from "@/lib/categories";
import {
  catalogTagLabel,
  isProductInCatalogTag,
  type CatalogTag,
} from "@/lib/site";

function categoryFromPath(pathname: string) {
  const match = pathname.match(/^\/catalogo\/([^/]+)\/?$/);
  return match?.[1] || "tutti";
}

function setCatalogUrl(id: string, tag: string) {
  const next = `${catalogPath(id)}${tag ? `?tag=${encodeURIComponent(tag)}` : ""}`;
  if (`${window.location.pathname}${window.location.search}` === next) return;
  window.history.replaceState(window.history.state, "", next);
}

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

function pricesInCategory(products: Product[], categoryId: string) {
  const list =
    categoryId === "tutti"
      ? products
      : products.filter((product) => productHasCategory(product, categoryId));
  const prices = list.map((product) => product.price);
  return prices.length ? Math.max(...prices) : 0;
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
          className={`overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden ${bleed ? "px-5" : ""}`}
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
                  className={`relative min-h-11 shrink-0 rounded-full px-5 py-2.5 text-sm transition-colors duration-500 ${
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
              className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-linear-to-r from-ink to-transparent"
              style={{ opacity: scrollLeft > 4 ? 1 : 0 }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-linear-to-l from-ink to-transparent"
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
  scroll = false,
}: {
  colors: string[];
  value: string;
  onChange: (color: string) => void;
  align?: "end" | "start";
  scroll?: boolean;
}) {
  if (!colors.length) return null;
  return (
    <div
      className={`flex flex-wrap content-start gap-2 ${align === "end" ? "justify-end" : "justify-start"} ${
        scroll ? "halo-scrollbar max-h-16 overflow-y-auto py-0.5 pr-1.5" : ""
      }`}
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
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
              isActive ? "ring-1 ring-ivory ring-offset-2 ring-offset-ink" : ""
            }`}
          >
            <span
              className="h-3.5 w-3.5 rounded-full border border-ink-line/80"
              style={{ backgroundColor: look.hex }}
            />
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
      <p className="text-xs uppercase tracking-[0.22em] text-ivory-dim">
        {formatPrice(maxPrice || minPrice)}
      </p>
    );
  }
  return (
    <label className="block text-xs uppercase tracking-[0.22em] text-ivory-dim">
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
  initialCategory = "tutti",
  initialTag = "",
  tags = [],
}: {
  products: Product[];
  categories: StoreCategory[];
  initialCategory?: string;
  initialTag?: string;
  tags?: CatalogTag[];
}) {
  const filters = catalogFilters(categories, products.length);
  const [active, setActive] = useState(initialCategory);
  const [activeTag, setActiveTag] = useState(initialTag);
  const [maxSelected, setMaxSelected] = useState(0);
  const [color, setColor] = useState("");
  const ceiling = useRef(0);
  const categoryRef = useRef(active);

  const scoped = useMemo(
    () =>
      active === "tutti"
        ? products
        : products.filter((product) => productHasCategory(product, active)),
    [active, products],
  );
  const tagged = useMemo(
    () =>
      activeTag
        ? scoped.filter((product) => isProductInCatalogTag(product, activeTag))
        : scoped,
    [activeTag, scoped],
  );
  const prices = tagged.map((product) => product.price);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  const colors = useMemo(() => collectColors(tagged), [tagged]);

  const selectCategory = (id: string) => {
    if (id === active) return;
    const nextMax = pricesInCategory(products, id);
    categoryRef.current = id;
    ceiling.current = nextMax;
    setActive(id);
    setActiveTag("");
    setMaxSelected(nextMax);
    setCatalogUrl(id, "");
  };

  const clearTag = () => {
    setActiveTag("");
    setCatalogUrl(active, "");
  };

  useEffect(() => {
    const onPop = () => {
      const id = categoryFromPath(window.location.pathname);
      const requestedTag = new URLSearchParams(window.location.search).get("tag") ?? "";
      const nextTag = tags.some((tag) => tag.id === requestedTag) ? requestedTag : "";
      const nextMax = pricesInCategory(products, id);
      categoryRef.current = id;
      ceiling.current = nextMax;
      setActive(id);
      setActiveTag(nextTag);
      setMaxSelected(nextMax);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [products, tags]);

  useEffect(() => {
    if (active !== "tutti" && !categories.some((category) => category.id === active)) {
      setActive("tutti");
    }
  }, [active, categories]);

  useEffect(() => {
    setMaxSelected((current) => {
      const categoryChanged = categoryRef.current !== active;
      categoryRef.current = active;
      const atCeiling = current >= ceiling.current - 0.5 || current === 0;
      ceiling.current = maxPrice;
      if (categoryChanged || atCeiling) return maxPrice;
      return Math.min(maxPrice, Math.max(minPrice, current));
    });
  }, [active, minPrice, maxPrice]);

  useEffect(() => {
    if (!color) return;
    if (!colors.some((name) => name.toLowerCase() === color.toLowerCase())) setColor("");
  }, [color, colors]);

  const visible = useMemo(
    () =>
      tagged.filter((product) => {
        if (product.price > maxSelected) return false;
        if (color && !productHasColor(product, color)) return false;
        return true;
      }),
    [color, maxSelected, tagged],
  );

  return (
    <section
      id="catalogo"
      className="halo-section relative scroll-mt-28 border-t border-ink-line/45"
    >
      <div className="halo-shell">
        <div className="text-center">
          <h2 className="halo-display text-[clamp(2.75rem,6.4vw,5rem)]">
            <RevealWords text="Il catalogo" className="block" />
          </h2>
        </div>

        <div className="mt-14 lg:hidden">
          <CategoryRail
            filters={filters}
            active={active}
            onChange={selectCategory}
            layoutId="filtro-attivo-mobile"
            bleed
          />
          <div className="mt-8 grid grid-cols-2 items-end gap-8">
            <PriceFilter minPrice={minPrice} maxPrice={maxPrice} value={maxSelected} onChange={setMaxSelected} />
            <ColorSwatches colors={colors} value={color} onChange={setColor} scroll />
          </div>
        </div>

        <div className="mt-16 hidden items-center gap-10 lg:grid lg:grid-cols-[minmax(10rem,15rem)_minmax(0,1fr)_minmax(10rem,15rem)]">
          <PriceFilter minPrice={minPrice} maxPrice={maxPrice} value={maxSelected} onChange={setMaxSelected} />
          <CategoryRail
            filters={filters}
            active={active}
            onChange={selectCategory}
            layoutId="filtro-attivo"
          />
          <ColorSwatches colors={colors} value={color} onChange={setColor} />
        </div>

        <p className="mt-10 text-center text-xs uppercase tracking-[0.24em] text-ivory-dim">
          {visible.length} {visible.length === 1 ? "capo" : "capi"}
        </p>
        {activeTag ? (
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={clearTag}
              className="rounded-full border border-ink-line px-4 py-2 text-xs text-ivory-dim transition-colors hover:text-ivory"
            >
              Tag: {catalogTagLabel(activeTag, tags)} ×
            </button>
          </div>
        ) : null}

        {visible.length === 0 ? (
          <p className="mt-16 text-center text-sm text-ivory-dim">
            {products.length === 0
              ? "Al momento non ci sono capi in vetrina."
              : "Nessun capo con questi filtri."}
          </p>
        ) : (
          <motion.div
            key={active}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="halo-product-grid mt-14 lg:mt-16"
          >
            {visible.map((product, index) => (
              <ProductCard key={product.uuid ?? product.id} product={product} index={index} />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
