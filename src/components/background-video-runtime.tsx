"use client";

import { useEffect } from "react";
import { assignDeviceVideoSrc } from "@/lib/pick-video-src";

function clip(id: string) {
  return document.getElementById(id) as HTMLVideoElement | null;
}

function layoutBox(video: HTMLVideoElement) {
  const rect = video.getBoundingClientRect();
  return { rect, unknown: rect.width <= 0 && rect.height <= 0 };
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
        assignDeviceVideoSrc(video);
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
