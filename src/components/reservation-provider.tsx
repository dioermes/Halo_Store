"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getProduct } from "@/lib/products";

export type ReservationItem = {
  productId: string;
  size: string;
  color: string;
};

type ReservationContextValue = {
  items: ReservationItem[];
  count: number;
  total: number;
  isOpen: boolean;
  /** Ultimo capo aggiunto, usato per il feedback visivo sulla barra */
  lastAdded: string | null;
  add: (item: ReservationItem) => void;
  remove: (item: ReservationItem) => void;
  clear: () => void;
  has: (item: ReservationItem) => boolean;
  openBag: () => void;
  closeBag: () => void;
};

const STORAGE_KEY = "halo-prenotazioni-v1";

const ReservationContext = createContext<ReservationContextValue | null>(null);

function sameItem(a: ReservationItem, b: ReservationItem) {
  return (
    a.productId === b.productId && a.size === b.size && a.color === b.color
  );
}

export function ReservationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [items, setItems] = useState<ReservationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(
            parsed.filter(
              (entry): entry is ReservationItem =>
                typeof entry === "object" &&
                entry !== null &&
                typeof (entry as ReservationItem).productId === "string" &&
                Boolean(getProduct((entry as ReservationItem).productId)),
            ),
          );
        }
      }
    } catch {
      // storage non disponibile: la borsa resta in memoria per la sessione
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignora quota o modalita privata
    }
  }, [items, hydrated]);

  const add = useCallback((item: ReservationItem) => {
    setItems((current) =>
      current.some((entry) => sameItem(entry, item))
        ? current
        : [...current, item],
    );
    setLastAdded(item.productId);
  }, []);

  const remove = useCallback((item: ReservationItem) => {
    setItems((current) => current.filter((entry) => !sameItem(entry, item)));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const has = useCallback(
    (item: ReservationItem) =>
      items.some((entry) => sameItem(entry, item)),
    [items],
  );

  useEffect(() => {
    if (!lastAdded) return;
    const timeout = window.setTimeout(() => setLastAdded(null), 2200);
    return () => window.clearTimeout(timeout);
  }, [lastAdded]);

  const total = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + (getProduct(item.productId)?.price ?? 0),
        0,
      ),
    [items],
  );

  const value = useMemo<ReservationContextValue>(
    () => ({
      items,
      count: items.length,
      total,
      isOpen,
      lastAdded,
      add,
      remove,
      clear,
      has,
      openBag: () => setIsOpen(true),
      closeBag: () => setIsOpen(false),
    }),
    [items, total, isOpen, lastAdded, add, remove, clear, has],
  );

  return (
    <ReservationContext.Provider value={value}>
      {children}
    </ReservationContext.Provider>
  );
}

export function useReservation() {
  const context = useContext(ReservationContext);
  if (!context) {
    throw new Error("useReservation richiede ReservationProvider");
  }
  return context;
}
