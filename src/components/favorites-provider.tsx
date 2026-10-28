"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@clerk/nextjs";

type FavoritesContextValue = {
  productIds: string[];
  count: number;
  isSignedIn: boolean;
  isLoaded: boolean;
  pendingIds: string[];
  error: string;
  toggleFavorite: (productId: string) => Promise<void>;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { isLoaded: authLoaded, isSignedIn, userId } = useAuth();
  const [productIds, setProductIds] = useState<string[]>([]);
  const [favoritesUserId, setFavoritesUserId] = useState<string | null>(null);
  const [pendingIds, setPendingIds] = useState<string[]>([]);
  const [favoritesLoaded, setFavoritesLoaded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoaded || !isSignedIn) return;
    let active = true;
    void fetch("/api/account/favorites")
      .then(async (response) => {
        const payload = (await response.json()) as { productIds?: string[]; error?: string };
        if (!response.ok) throw new Error(payload.error ?? "Non è stato possibile caricare i preferiti.");
        if (active) {
          setProductIds(payload.productIds ?? []);
          setFavoritesUserId(userId ?? null);
          setFavoritesLoaded(true);
          setError("");
        }
      })
      .catch((caught: unknown) => {
        if (!active) return;
        console.error("[account favorites]", caught);
        setFavoritesUserId(userId ?? null);
        setFavoritesLoaded(true);
        setError(caught instanceof Error ? caught.message : "Errore nel caricamento dei preferiti.");
      });
    return () => {
      active = false;
    };
  }, [authLoaded, isSignedIn, userId]);

  const isCurrentFavoritesUser = Boolean(
    isSignedIn && userId && favoritesUserId === userId,
  );
  const visibleProductIds = useMemo(
    () => (isCurrentFavoritesUser ? productIds : []),
    [isCurrentFavoritesUser, productIds],
  );

  const toggleFavorite = useCallback(
    async (productId: string) => {
      if (!isSignedIn) {
        setError("Accedi per salvare i capi tra i preferiti.");
        return;
      }
      if (pendingIds.includes(productId)) return;
      const shouldFavorite = !visibleProductIds.includes(productId);
      setPendingIds((current) => [...current, productId]);
      setError("");
      try {
        const response = await fetch("/api/account/favorites", {
          method: shouldFavorite ? "POST" : "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
        const payload = (await response.json()) as { error?: string };
        if (!response.ok) throw new Error(payload.error ?? "Non è stato possibile aggiornare i preferiti.");
        setProductIds((current) =>
          shouldFavorite
            ? current.includes(productId)
              ? current
              : [...current, productId]
            : current.filter((id) => id !== productId),
        );
      } catch (caught) {
        console.error("[account favorites update]", caught);
        setError(caught instanceof Error ? caught.message : "Errore nell'aggiornamento dei preferiti.");
      } finally {
        setPendingIds((current) => current.filter((id) => id !== productId));
      }
    },
    [isSignedIn, pendingIds, visibleProductIds],
  );

  const value = useMemo<FavoritesContextValue>(
    () => ({
      productIds: visibleProductIds,
      count: visibleProductIds.length,
      isSignedIn: Boolean(isSignedIn),
      isLoaded:
        authLoaded &&
        (!isSignedIn || (favoritesLoaded && Boolean(userId) && favoritesUserId === userId)),
      pendingIds,
      error,
      toggleFavorite,
    }),
    [
      authLoaded,
      error,
      favoritesLoaded,
      favoritesUserId,
      isSignedIn,
      pendingIds,
      toggleFavorite,
      userId,
      visibleProductIds,
    ],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
      {error ? (
        <p
          role="alert"
          className="fixed bottom-5 left-5 z-[150] max-w-sm rounded-xl border border-red-400/40 bg-ink px-4 py-3 text-sm text-red-200 shadow-xl"
        >
          {error}
        </p>
      ) : null}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error("useFavorites deve essere usato dentro FavoritesProvider.");
  return context;
}
