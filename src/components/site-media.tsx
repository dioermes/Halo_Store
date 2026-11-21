"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { SiteMedia } from "@/lib/site";

const playing = new Set<HTMLVideoElement>();

function playExclusive(video: HTMLVideoElement) {
  for (const other of playing) {
    if (other !== video) {
      other.pause();
      playing.delete(other);
    }
  }
  playing.add(video);
  void video.play().catch(() => undefined);
}

function stopPlayback(video: HTMLVideoElement) {
  video.pause();
  playing.delete(video);
}

function LazyVideo({
  url,
  alt,
  className,
  crossOrigin,
  playback = "visible",
}: {
  url: string;
  alt: string;
  className?: string;
  crossOrigin?: "anonymous";
  playback?: "visible" | "hover";
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
      ?.saveData;

    const inView = (entry: IntersectionObserverEntry) =>
      entry.isIntersecting && entry.intersectionRatio >= 0.35 && video.getClientRects().length > 0;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (saveData || playback === "hover") {
          if (!inView(entry)) stopPlayback(video);
          return;
        }
        if (inView(entry)) playExclusive(video);
        else stopPlayback(video);
      },
      { threshold: [0, 0.35, 0.7] },
    );
    observer.observe(video);

    const onEnter = () => {
      if (playback === "hover" && !saveData) playExclusive(video);
    };
    const onLeave = () => {
      if (playback === "hover") stopPlayback(video);
    };
    const host = video.parentElement;
    if (playback === "hover") {
      host?.addEventListener("pointerenter", onEnter);
      host?.addEventListener("pointerleave", onLeave);
    }

    return () => {
      observer.disconnect();
      host?.removeEventListener("pointerenter", onEnter);
      host?.removeEventListener("pointerleave", onLeave);
      stopPlayback(video);
    };
  }, [url, playback]);

  return (
    <video
      ref={ref}
      className={`absolute inset-0 h-full w-full object-cover ${className ?? ""}`}
      src={url}
      crossOrigin={crossOrigin}
      preload="metadata"
      muted
      loop
      playsInline
      disablePictureInPicture
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
  playback = "visible",
}: {
  media: SiteMedia;
  alt: string;
  className?: string;
  priority?: boolean;
  samplePixels?: boolean;
  playback?: "visible" | "hover";
}) {
  if (!media.url) return null;
  if (media.kind === "video") {
    return (
      <LazyVideo
        url={media.url}
        alt={alt}
        className={className}
        crossOrigin={samplePixels ? "anonymous" : undefined}
        playback={playback}
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
