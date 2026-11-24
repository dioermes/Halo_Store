"use client";

import { useLayoutEffect, useRef } from "react";
import { assignDeviceVideoSrc, cleanMediaUrl } from "@/lib/pick-video-src";

export function AutoplayClip({
  id,
  src,
  desktopSrc,
  preload = "auto",
  autoPlay = true,
}: {
  id: string;
  src: string;
  desktopSrc?: string;
  preload?: "auto" | "none" | "metadata";
  autoPlay?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const mobile = cleanMediaUrl(src);
  const desktop = cleanMediaUrl(desktopSrc || src);

  useLayoutEffect(() => {
    const video = ref.current;
    if (!video || !autoPlay) return;
    assignDeviceVideoSrc(video);
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    void video.play().catch(() => undefined);
  }, [autoPlay, mobile, desktop]);

  return (
    <video
      ref={ref}
      id={id}
      className="halo-bg-video absolute inset-0 h-full w-full object-cover"
      data-mobile-src={mobile}
      data-desktop-src={desktop}
      autoPlay={autoPlay}
      muted
      loop
      playsInline
      preload={autoPlay ? preload : "none"}
      controls={false}
      disablePictureInPicture
      aria-hidden
    />
  );
}
