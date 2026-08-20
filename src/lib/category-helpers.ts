import { fallbackCategories, type StoreCategory } from "@/lib/products";
import { slugify } from "@/lib/slug";

export function labelFromCategoryId(id: string, list: StoreCategory[] = fallbackCategories) {
  return (
    list.find((row) => row.id === id)?.label ??
    id
      .split("-")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  );
}

export function catalogFilters(list: StoreCategory[], productCount: number): StoreCategory[] {
  return [
    {
      id: "tutti",
      label: "Tutto il negozio",
      hint: `${productCount} ${productCount === 1 ? "capo" : "capi"}`,
    },
    ...list,
  ];
}

export function uniqueCategoryId(label: string, existing: StoreCategory[]) {
  const base = slugify(label) || "tipologia";
  if (!existing.some((row) => row.id === base)) return base;
  let index = 2;
  while (existing.some((row) => row.id === `${base}-${index}`)) index += 1;
  return `${base}-${index}`;
}
