"use client";

import { useEffect } from "react";

export function UnlockVideos() {
  useEffect(() => {
    const playVisible = () => {
      for (const video of document.querySelectorAll<HTMLVideoElement>("video.halo-bg-video")) {
        video.muted = true;
        video.controls = false;
        video.removeAttribute("controls");
        const rect = video.getBoundingClientRect();
        if (rect.bottom <= 0 || rect.top >= window.innerHeight) continue;
        void video.play().catch(() => undefined);
      }
    };
    playVisible();
    const opts = { capture: true, passive: true } as const;
    document.addEventListener("touchstart", playVisible, opts);
    document.addEventListener("pointerdown", playVisible, opts);
    return () => {
      document.removeEventListener("touchstart", playVisible, opts);
      document.removeEventListener("pointerdown", playVisible, opts);
    };
  }, []);
  return null;
}
