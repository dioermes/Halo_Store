"use client";

import { usePathname, useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { useFavorites } from "@/components/favorites-provider";

export function FavoriteButton({
  productId,
  productName,
  className = "",
}: {
  productId: string;
  productName: string;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isSignedIn, isLoaded, productIds, pendingIds, toggleFavorite } = useFavorites();
  const isFavorite = productIds.includes(productId);
  const pending = pendingIds.includes(productId);

  return (
    <button
      type="button"
      onPointerEnter={(event) => event.stopPropagation()}
      onPointerMove={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
      onPointerUp={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.stopPropagation();
        if (!isSignedIn) {
          const redirectUrl = encodeURIComponent(pathname || "/");
          router.push(`/sign-in?redirect_url=${redirectUrl}`);
          return;
        }
        void toggleFavorite(productId);
      }}
      disabled={pending || !isLoaded}
      aria-pressed={isFavorite}
      aria-label={
        isFavorite
          ? `Rimuovi ${productName} dai preferiti`
          : `Aggiungi ${productName} ai preferiti`
      }
      title={isFavorite ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
      className={`flex h-10 w-10 items-center justify-center rounded-full bg-ink/70 text-white backdrop-blur transition-colors hover:text-halo-bright disabled:opacity-60 ${className}`}
    >
      <Heart
        className={`h-5 w-5 transition-transform ${isFavorite ? "fill-current text-halo-bright" : ""}`}
        aria-hidden
      />
    </button>
  );
}
