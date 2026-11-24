"use client";

import { useEffect } from "react";

function clip(id: string) {
  return document.getElementById(id) as HTMLVideoElement | null;
}

function layoutBox(video: HTMLVideoElement) {
  const rect = video.getBoundingClientRect();
  return { rect, unknown: rect.width <= 0 && rect.height <= 0 };
}

export function HeroDesktopSwap({ id }: { id: string }) {
  useEffect(() => {
    const video = clip(id);
    const desktopSrc = video?.dataset.desktopSrc;
    if (!video || !desktopSrc) return;
    if (!window.matchMedia("(min-width: 768px)").matches) return;
    const current = video.currentSrc || video.getAttribute("src") || "";
    if (current.includes(desktopSrc.split("#")[0])) return;
    video.src = desktopSrc;
    video.muted = true;
    void video.play().catch(() => undefined);
  }, [id]);
  return null;
}

export function PlayWhenVisible({ id, eager = false }: { id: string; eager?: boolean }) {
  useEffect(() => {
    const video = clip(id);
    if (!video) return;

    const sync = () => {
      video.muted = true;
      video.controls = false;
      const { rect, unknown } = layoutBox(video);
      if (unknown) {
        if (eager) void video.play().catch(() => undefined);
        return;
      }
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        const pending = video.dataset.src;
        const desktop = video.dataset.desktopSrc;
        const next =
          desktop && window.matchMedia("(min-width: 768px)").matches ? desktop : pending;
        if (next && !video.getAttribute("src")) video.src = next;
        video.preload = "auto";
        void video.play().catch(() => undefined);
      } else if (!eager) {
        video.pause();
      }
    };

    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [id, eager]);
  return null;
}
