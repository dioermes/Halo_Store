"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { motion } from "motion/react";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
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

type SortId =
  | "featured"
  | "relevant"
  | "bestseller"
  | "az"
  | "za"
  | "priceAsc"
  | "priceDesc"
  | "dateAsc"
  | "dateDesc";

const sortOptions: { id: SortId; label: string }[] = [
  { id: "featured", label: "In primo piano" },
  { id: "relevant", label: "Più rilevanti" },
  { id: "bestseller", label: "Best seller" },
  { id: "az", label: "In ordine alfabetico, A-Z" },
  { id: "za", label: "In ordine alfabetico, Z-A" },
  { id: "priceAsc", label: "Prezzo crescente" },
  { id: "priceDesc", label: "Prezzo decrescente" },
  { id: "dateAsc", label: "Data, da meno a più recente" },
  { id: "dateDesc", label: "Data, da più a meno recente" },
];

const SIZE_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];

function collectSizes(products: Product[]) {
  const unique = new Set<string>();
  for (const product of products) {
    for (const size of product.sizes) {
      const trimmed = size.trim();
      if (trimmed) unique.add(trimmed);
    }
  }
  const rank = (size: string) => {
    const index = SIZE_ORDER.indexOf(size.toUpperCase());
    return index >= 0 ? index : null;
  };
  return [...unique].sort((a, b) => {
    const ra = rank(a);
    const rb = rank(b);
    if (ra !== null && rb !== null) return ra - rb;
    if (ra !== null) return -1;
    if (rb !== null) return 1;
    return a.localeCompare(b, "it", { numeric: true });
  });
}

function relevance(product: Product) {
  return (
    (product.isBestseller ? 4 : 0) +
    (product.isNewArrival ? 2 : 0) +
    (product.isOnSale ? 1 : 0)
  );
}

function sortProducts(list: Product[], sort: SortId) {
  if (sort === "featured") return list;
  const indexed = list.map((product, index) => ({ product, index }));
  const time = (product: Product) => (product.createdAt ? Date.parse(product.createdAt) || 0 : 0);
  const compare: Record<Exclude<SortId, "featured">, (a: Product, b: Product) => number> = {
    relevant: (a, b) => relevance(b) - relevance(a),
    bestseller: (a, b) => Number(Boolean(b.isBestseller)) - Number(Boolean(a.isBestseller)),
    az: (a, b) => a.name.localeCompare(b.name, "it"),
    za: (a, b) => b.name.localeCompare(a.name, "it"),
    priceAsc: (a, b) => a.price - b.price,
    priceDesc: (a, b) => b.price - a.price,
    dateAsc: (a, b) => time(a) - time(b),
    dateDesc: (a, b) => time(b) - time(a),
  };
  return indexed
    .sort((a, b) => compare[sort](a.product, b.product) || a.index - b.index)
    .map((entry) => entry.product);
}

function FilterGroup({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-ink-line/60 py-6">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center justify-between text-left text-sm font-semibold uppercase tracking-[0.08em] text-ivory"
      >
        {title}
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? <div className="mt-5">{children}</div> : null}
    </div>
  );
}

function RadioRow({
  label,
  checked,
  onSelect,
}: {
  label: string;
  checked: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={onSelect}
      className="flex w-full items-center gap-3 py-2 text-left text-sm uppercase text-ivory"
    >
      <span
        className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border ${
          checked ? "border-ivory bg-ivory" : "border-ink-line"
        }`}
      />
      {label}
    </button>
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
  const [size, setSize] = useState("");
  const [sort, setSort] = useState<SortId>("featured");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [colsChoice, setCols] = useState<1 | 2 | 4 | null>(null);
  const isDesktop = useSyncExternalStore(
    (notify) => {
      const query = window.matchMedia("(min-width: 1024px)");
      query.addEventListener("change", notify);
      return () => query.removeEventListener("change", notify);
    },
    () => window.matchMedia("(min-width: 1024px)").matches,
    () => false,
  );
  const cols = colsChoice === 4 && !isDesktop ? 2 : (colsChoice ?? (isDesktop ? 4 : 2));
  const ceiling = useRef(0);
  const categoryRef = useRef(active);
  const selectedActive =
    active !== "tutti" && !categories.some((category) => category.id === active)
      ? "tutti"
      : active;

  const scoped = useMemo(
    () =>
      selectedActive === "tutti"
        ? products
        : products.filter((product) => productHasCategory(product, selectedActive)),
    [selectedActive, products],
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
  const sizes = useMemo(() => collectSizes(tagged), [tagged]);
  const selectedColor =
    color && colors.some((name) => name.toLowerCase() === color.toLowerCase()) ? color : "";
  const selectedSize = size && sizes.includes(size) ? size : "";

  const selectCategory = (id: string) => {
    if (id === selectedActive) return;
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
    setCatalogUrl(selectedActive, "");
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
    setMaxSelected((current) => {
      const categoryChanged = categoryRef.current !== selectedActive;
      categoryRef.current = selectedActive;
      const atCeiling = current >= ceiling.current - 0.5 || current === 0;
      ceiling.current = maxPrice;
      if (categoryChanged || atCeiling) return maxPrice;
      return Math.min(maxPrice, Math.max(minPrice, current));
    });
  }, [selectedActive, minPrice, maxPrice]);

  const visible = useMemo(
    () =>
      sortProducts(
        tagged.filter((product) => {
          if (product.price > maxSelected) return false;
          if (selectedColor && !productHasColor(product, selectedColor)) return false;
          if (selectedSize && !product.sizes.includes(selectedSize)) return false;
          return true;
        }),
        sort,
      ),
    [selectedColor, selectedSize, sort, maxSelected, tagged],
  );

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [drawerOpen]);

  const activeFilters =
    (sort !== "featured" ? 1 : 0) +
    (maxSelected < maxPrice ? 1 : 0) +
    (selectedActive !== "tutti" ? 1 : 0) +
    (selectedSize ? 1 : 0) +
    (selectedColor ? 1 : 0);

  const resetFilters = () => {
    setSort("featured");
    setSize("");
    setColor("");
    setMaxSelected(maxPrice);
    if (selectedActive !== "tutti") selectCategory("tutti");
  };

  return (
    <section
      id="catalogo"
      className="halo-section relative scroll-mt-28 border-t border-ink-line/45"
    >
      <div className="halo-shell">
        <div className="text-center">
          <h2 className="halo-display halo-section-title text-[clamp(2.75rem,6.4vw,5rem)]">
            <RevealWords text="Il catalogo" className="block" />
          </h2>
        </div>

        <div className="mt-12 flex items-center justify-between gap-4">
          <p className="text-xs uppercase tracking-[0.24em] text-ivory-dim">
            {visible.length} {visible.length === 1 ? "capo" : "capi"}
          </p>
          <div className="flex items-center gap-1" role="group" aria-label="Colonne del catalogo">
            {([4, 2, 1] as const).map((n) => (
              <button
                key={n}
                type="button"
                aria-pressed={cols === n}
                aria-label={n === 1 ? "Una colonna" : `${n} colonne`}
                onClick={() => setCols(n)}
                className={`${n === 4 ? "hidden lg:flex" : "flex"} h-9 w-9 items-center justify-center rounded-md border transition-colors ${
                  cols === n ? "border-ivory bg-ivory text-ink" : "border-ink-line text-ivory hover:border-ivory"
                }`}
              >
                <span className="flex h-4 gap-[2px]">
                  {Array.from({ length: n }).map((_, i) => (
                    <span key={i} className="h-full rounded-[1px] bg-current" style={{ width: n === 1 ? 14 : n === 2 ? 7 : 3 }} />
                  ))}
                </span>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center gap-2 rounded-md border border-ink-line px-4 py-2.5 text-xs uppercase tracking-[0.18em] text-ivory transition-colors hover:border-halo/60"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtri{activeFilters ? ` (${activeFilters})` : ""}
          </button>
        </div>

        {drawerOpen ? (
          <div className="fixed inset-0 z-[120]" role="dialog" aria-modal="true" aria-label="Filtri">
            <button
              type="button"
              aria-label="Chiudi filtri"
              onClick={() => setDrawerOpen(false)}
              className="absolute inset-0 bg-black/40"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-ink text-ivory shadow-2xl"
            >
              <div className="relative flex items-center justify-center border-b border-ink-line/60 py-5">
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Chiudi"
                  className="absolute left-5 flex h-9 w-9 items-center justify-center rounded-full bg-ivory/10"
                >
                  <X className="h-4 w-4" />
                </button>
                <span className="text-sm uppercase tracking-[0.12em]">Filtri</span>
              </div>

              <div className="halo-scrollbar flex-1 overflow-y-auto px-6">
                <FilterGroup title="Ordina">
                  <div role="radiogroup" aria-label="Ordina per">
                    {sortOptions.map((option) => (
                      <RadioRow
                        key={option.id}
                        label={option.label}
                        checked={sort === option.id}
                        onSelect={() => setSort(option.id)}
                      />
                    ))}
                  </div>
                </FilterGroup>

                <FilterGroup title="Prezzo">
                  <PriceFilter
                    minPrice={minPrice}
                    maxPrice={maxPrice}
                    value={maxSelected}
                    onChange={setMaxSelected}
                  />
                </FilterGroup>

                <FilterGroup title="Categoria">
                  <div role="radiogroup" aria-label="Categoria">
                    {filters.map((category) => (
                      <RadioRow
                        key={category.id}
                        label={category.label}
                        checked={selectedActive === category.id}
                        onSelect={() => selectCategory(category.id)}
                      />
                    ))}
                  </div>
                </FilterGroup>

                {sizes.length > 0 ? (
                  <FilterGroup title="Taglia">
                    <div className="flex flex-wrap gap-2">
                      {sizes.map((name) => {
                        const isActive = selectedSize === name;
                        return (
                          <button
                            key={name}
                            type="button"
                            aria-pressed={isActive}
                            onClick={() => setSize(isActive ? "" : name)}
                            className={`min-w-11 rounded-md border px-3 py-2 text-sm transition-colors ${
                              isActive
                                ? "border-ivory bg-ivory text-ink"
                                : "border-ink-line text-ivory hover:border-ivory"
                            }`}
                          >
                            {name}
                          </button>
                        );
                      })}
                    </div>
                  </FilterGroup>
                ) : null}

                {colors.length > 0 ? (
                  <FilterGroup title="Colore">
                    <ColorSwatches
                      colors={colors}
                      value={selectedColor}
                      onChange={setColor}
                      align="start"
                    />
                  </FilterGroup>
                ) : null}
              </div>

              <div className="flex gap-3 border-t border-ink-line/60 p-5">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="flex-1 rounded-md border border-ink-line py-3 text-xs uppercase tracking-[0.18em]"
                >
                  Azzera
                </button>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="flex-1 rounded-md bg-ivory py-3 text-xs uppercase tracking-[0.18em] text-ink"
                >
                  Mostra {visible.length} {visible.length === 1 ? "capo" : "capi"}
                </button>
              </div>
            </motion.aside>
          </div>
        ) : null}
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
            key={selectedActive}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className={`halo-product-grid mt-14 lg:mt-16 ${cols === 1 ? "mx-auto max-w-xl" : ""}`}
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
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
