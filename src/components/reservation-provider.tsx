"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { findVariant, type Product } from "@/lib/products";

export type CartItem = {
  productId: string;
  variantId?: string;
  size: string;
  color: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  isOpen: boolean;
  lastAdded: string | null;
  products: Product[];
  add: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  remove: (item: CartItem) => void;
  setQuantity: (item: CartItem, quantity: number) => void;
  clear: () => void;
  has: (item: Pick<CartItem, "productId" | "size" | "color">) => boolean;
  openBag: () => void;
  closeBag: () => void;
  productById: (id: string) => Product | undefined;
};

const STORAGE_KEY = "halo-carrello-v1";
const LEGACY_KEY = "halo-prenotazioni-v1";

const CartContext = createContext<CartContextValue | null>(null);

function sameItem(a: Pick<CartItem, "productId" | "size" | "color">, b: Pick<CartItem, "productId" | "size" | "color">) {
  return a.productId === b.productId && a.size === b.size && a.color === b.color;
}

function parseItems(raw: unknown, products: Product[]): CartItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((entry) => {
    if (typeof entry !== "object" || entry === null) return [];
    const item = entry as Partial<CartItem>;
    if (typeof item.productId !== "string") return [];
    const product = products.find((row) => row.id === item.productId);
    if (!product) return [];
    const size = typeof item.size === "string" ? item.size : product.sizes[0];
    const color = typeof item.color === "string" ? item.color : product.colors[0] ?? "";
    return [
      {
        productId: item.productId,
        variantId: item.variantId ?? findVariant(product, size, color)?.id,
        size,
        color,
        quantity: Math.max(1, Number(item.quantity) || 1),
      },
    ];
  });
}

export function ReservationProvider({
  children,
  products,
}: {
  children: React.ReactNode;
  products: Product[];
}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored =
        window.localStorage.getItem(STORAGE_KEY) ??
        window.localStorage.getItem(LEGACY_KEY);
      if (stored) setItems(parseItems(JSON.parse(stored), products));
    } catch {
      // storage non disponibile
    }
    setHydrated(true);
  }, [products]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignora quota
    }
  }, [items, hydrated]);

  const add = useCallback(
    (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
      const product = products.find((row) => row.id === item.productId);
      const variantId =
        item.variantId ??
        (product ? findVariant(product, item.size, item.color)?.id : undefined);
      setItems((current) => {
        const existing = current.find((entry) => sameItem(entry, item));
        if (existing) {
          return current.map((entry) =>
            sameItem(entry, item)
              ? { ...entry, quantity: entry.quantity + (item.quantity ?? 1), variantId }
              : entry,
          );
        }
        return [...current, { ...item, variantId, quantity: item.quantity ?? 1 }];
      });
      setLastAdded(item.productId);
    },
    [products],
  );

  const remove = useCallback((item: CartItem) => {
    setItems((current) => current.filter((entry) => !sameItem(entry, item)));
  }, []);

  const setQuantity = useCallback((item: CartItem, quantity: number) => {
    if (quantity <= 0) {
      setItems((current) => current.filter((entry) => !sameItem(entry, item)));
      return;
    }
    setItems((current) =>
      current.map((entry) => (sameItem(entry, item) ? { ...entry, quantity } : entry)),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const has = useCallback(
    (item: Pick<CartItem, "productId" | "size" | "color">) =>
      items.some((entry) => sameItem(entry, item)),
    [items],
  );

  useEffect(() => {
    if (!lastAdded) return;
    const timeout = window.setTimeout(() => setLastAdded(null), 2200);
    return () => window.clearTimeout(timeout);
  }, [lastAdded]);

  const productById = useCallback(
    (id: string) => products.find((product) => product.id === id),
    [products],
  );

  const total = useMemo(
    () =>
      items.reduce((sum, item) => {
        const product = productById(item.productId);
        return sum + (product?.price ?? 0) * item.quantity;
      }, 0),
    [items, productById],
  );

  const count = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count,
      total,
      isOpen,
      lastAdded,
      products,
      add,
      remove,
      setQuantity,
      clear,
      has,
      openBag: () => setIsOpen(true),
      closeBag: () => setIsOpen(false),
      productById,
    }),
    [items, count, total, isOpen, lastAdded, products, add, remove, setQuantity, clear, has, productById],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useReservation() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useReservation richiede ReservationProvider");
  }
  return context;
}

export const useCart = useReservation;
