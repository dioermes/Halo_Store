"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { SiteMedia } from "@/lib/site";

// Scarica e riproduce il video solo quando è visibile; in pausa fuori schermo.
function LazyVideo({
  url,
  alt,
  className,
  crossOrigin,
}: {
  url: string;
  alt: string;
  className?: string;
  crossOrigin?: "anonymous";
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !saveData) {
          if (video.preload !== "auto") video.preload = "auto";
          void video.play().catch(() => undefined);
        } else {
          video.pause();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [url]);

  return (
    <video
      ref={ref}
      className={`absolute inset-0 h-full w-full object-cover ${className ?? ""}`}
      src={url}
      crossOrigin={crossOrigin}
      preload="none"
      muted
      loop
      playsInline
      aria-label={alt}
    />
  );
}

export function SiteMediaView({
  media,
  alt,
  className,
  priority = false,
  samplePixels = false,
}: {
  media: SiteMedia;
  alt: string;
  className?: string;
  priority?: boolean;
  samplePixels?: boolean;
}) {
  if (!media.url) return null;
  if (media.kind === "video") {
    return (
      <LazyVideo
        url={media.url}
        alt={alt}
        className={className}
        crossOrigin={samplePixels ? "anonymous" : undefined}
      />
    );
  }
  return (
    <Image
      src={media.url}
      alt={alt}
      fill
      priority={priority}
      sizes="100vw"
      className={`object-cover ${className ?? ""}`}
    />
  );
}
