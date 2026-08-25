"use client";

import { useEffect } from "react";

/** Carica il CSS Google del font titoli senza metterlo nell’HTML SSR (hydration). */
export function DisplayFontLink({ href }: { href: string | null }) {
  useEffect(() => {
    if (!href) return;
    const existing = document.querySelector<HTMLLinkElement>(`link[data-halo-display-font="1"]`);
    if (existing) {
      if (existing.href === href) return;
      existing.href = href;
      return;
    }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.setAttribute("data-halo-display-font", "1");
    document.head.appendChild(link);
  }, [href]);

  return null;
}
