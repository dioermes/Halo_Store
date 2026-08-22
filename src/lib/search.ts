import { fallbackCategories, type Product } from "@/lib/products";

const COMMON: Record<string, string[]> = {
  maglietta: ["tshirt", "t-shirt", "tee", "top", "t shirt"],
  tshirt: ["maglietta", "top", "tee"],
  camicia: ["shirt", "top"],
  felpa: ["hoodie", "sweatshirt", "top"],
  maglia: ["knit", "maglione", "pull", "top"],
  maglione: ["maglia", "knit", "pull"],
  jeans: ["denim", "pantalone", "pantaloni"],
  denim: ["jeans", "pantalone"],
  pantalone: ["pantaloni", "jeans", "trousers"],
  giacca: ["jacket", "outerwear", "capospalla"],
  bomber: ["giacca", "outerwear"],
  cappotto: ["coat", "outerwear"],
  pelle: ["leather", "giacca", "outerwear"],
  cappello: ["berretto", "hat", "accessori"],
  berretto: ["cappello", "beanie", "accessori"],
  borsa: ["bag", "accessori"],
  cintura: ["belt", "accessori"],
  sciarpa: ["scarf", "accessori"],
  nuovo: ["nuovi", "arrivi", "new", "novita"],
  arrivi: ["nuovo", "new"],
  bestseller: ["best", "seller", "piu venduti", "venduti"],
  uomo: ["mens", "man"],
  nero: ["black"],
  bianco: ["white"],
  beige: ["sabbia", "panna"],
};

function fold(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function expand(token: string) {
  const extras = COMMON[token] ?? [];
  return [token, ...extras.map(fold)];
}

export function productSearchText(product: Product) {
  const category = fallbackCategories.find((row) => row.id === product.category);
  const parts = [
    product.name,
    product.subtitle,
    product.description,
    product.fabric,
    product.fit,
    product.badge,
    product.searchKeywords,
    category?.label,
    category?.hint,
    product.category,
    ...(product.colors ?? []),
    ...(product.sizes ?? []),
    product.isNewArrival ? "nuovo arrivo nuovi arrivi new" : "",
    product.isBestseller ? "best seller bestseller piu venduti" : "",
  ];
  const base = fold(parts.filter(Boolean).join(" "));
  const tokens = new Set(base.split(/\s+/).filter(Boolean));
  for (const token of [...tokens]) {
    for (const extra of expand(token)) tokens.add(extra);
  }
  return [...tokens].join(" ");
}

export function matchesProductQuery(product: Product, query: string) {
  const needle = fold(query);
  if (!needle) return true;
  const haystack = productSearchText(product);
  return needle.split(/\s+/).every((token) => {
    const options = expand(token);
    return options.some((option) => haystack.includes(option));
  });
}
