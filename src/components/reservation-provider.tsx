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
import { GIFT_CARD_AMOUNTS_EUR } from "@/lib/gift-card-constants";

export type CartItem = {
  productId: string;
  variantId?: string;
  size: string;
  color: string;
  quantity: number;
  giftCardAmountCents?: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  isOpen: boolean;
  lastAdded: string | null;
  products: Product[];
  add: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  addGiftCard: (amountCents: number) => void;
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
  const parsed: CartItem[] = [];
  for (const entry of raw) {
    if (typeof entry !== "object" || entry === null) continue;
    const item = entry as Partial<CartItem>;
    if (typeof item.productId !== "string") continue;
    if (item.productId.startsWith("gift-card-")) {
      const amountCents = Number(item.productId.slice("gift-card-".length));
      if (!GIFT_CARD_AMOUNTS_EUR.some((amount) => amount * 100 === amountCents)) continue;
      parsed.push({
        productId: item.productId,
        size: "",
        color: "Gift card",
        quantity: Math.max(1, Math.min(10, Number(item.quantity) || 1)),
        giftCardAmountCents: amountCents,
      });
      continue;
    }
    const product = products.find((row) => row.id === item.productId);
    if (!product) continue;
    const size = typeof item.size === "string" ? item.size : product.sizes[0];
    const color = typeof item.color === "string" ? item.color : product.colors[0] ?? "";
    parsed.push({
      productId: item.productId,
      variantId: item.variantId ?? findVariant(product, size, color)?.id,
      size,
      color,
      quantity: Math.max(1, Number(item.quantity) || 1),
    });
  }
  return parsed;
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
    const timer = window.setTimeout(() => {
      try {
        const stored =
          window.localStorage.getItem(STORAGE_KEY) ??
          window.localStorage.getItem(LEGACY_KEY);
        if (stored) setItems(parseItems(JSON.parse(stored), products));
      } catch {
        // storage non disponibile
      }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
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

  const addGiftCard = useCallback((amountCents: number) => {
    if (!GIFT_CARD_AMOUNTS_EUR.some((amount) => amount * 100 === amountCents)) return;
    const productId = `gift-card-${amountCents}`;
    setItems((current) => {
      const totalGiftCards = current.reduce(
        (sum, item) => sum + (item.giftCardAmountCents ? item.quantity : 0),
        0,
      );
      if (totalGiftCards >= 10) return current;
      const existing = current.find((item) => item.productId === productId);
      if (existing) {
        return current.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [
        ...current,
        {
          productId,
          size: "",
          color: "Gift card",
          quantity: 1,
          giftCardAmountCents: amountCents,
        },
      ];
    });
    setLastAdded(productId);
  }, []);

  const remove = useCallback((item: CartItem) => {
    setItems((current) => current.filter((entry) => !sameItem(entry, item)));
  }, []);

  const setQuantity = useCallback((item: CartItem, quantity: number) => {
    if (item.giftCardAmountCents && quantity > 0) {
      setItems((current) => {
        const otherGiftCards = current.reduce(
          (sum, entry) =>
            sum +
            (entry.giftCardAmountCents && entry.productId !== item.productId
              ? entry.quantity
              : 0),
          0,
        );
        if (otherGiftCards + quantity > 10) return current;
        return current.map((entry) =>
          sameItem(entry, item) ? { ...entry, quantity: Math.min(10, quantity) } : entry,
        );
      });
      return;
    }
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
        return sum + (item.giftCardAmountCents ?? Math.round((product?.price ?? 0) * 100)) / 100 * item.quantity;
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
      addGiftCard,
      remove,
      setQuantity,
      clear,
      has,
      openBag: () => setIsOpen(true),
      closeBag: () => setIsOpen(false),
      productById,
    }),
    [items, count, total, isOpen, lastAdded, products, add, addGiftCard, remove, setQuantity, clear, has, productById],
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
