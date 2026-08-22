"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function AdminLiveRefresh({ seconds = 60 }: { seconds?: number }) {
  const router = useRouter();

  useEffect(() => {
    const tick = () => router.refresh();
    const id = window.setInterval(tick, seconds * 1000);
    const onVisible = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [router, seconds]);

  return (
    <p className="mt-2 text-xs text-ivory-dim">
      Si aggiorna da sola ogni minuto. I nuovi ordini hanno il tag Nuovo finché non li apri.
    </p>
  );
}
