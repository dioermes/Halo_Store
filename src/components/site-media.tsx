"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { SiteMedia } from "@/lib/site";

const playing = new Set<HTMLVideoElement>();

export type VideoSource = { src: string; media?: string };

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
  sources,
  alt,
  className,
  crossOrigin,
  playback = "visible",
  eager = false,
}: {
  url: string;
  sources?: VideoSource[];
  alt: string;
  className?: string;
  crossOrigin?: "anonymous";
  playback?: "visible" | "hover";
  eager?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
      ?.saveData;

    const inView = (entry: IntersectionObserverEntry) => {
      if (!entry.isIntersecting || video.getClientRects().length === 0) return false;
      return eager || entry.intersectionRatio >= 0.2;
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (saveData || playback === "hover") {
          if (!inView(entry)) stopPlayback(video);
          return;
        }
        if (inView(entry)) playExclusive(video);
        else stopPlayback(video);
      },
      { threshold: eager ? [0, 0.01, 0.2] : [0, 0.2, 0.5] },
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

    if (eager && !saveData) {
      video.preload = "auto";
      void video.play().catch(() => undefined);
    }

    return () => {
      observer.disconnect();
      host?.removeEventListener("pointerenter", onEnter);
      host?.removeEventListener("pointerleave", onLeave);
      stopPlayback(video);
    };
  }, [url, playback, eager, sources]);

  return (
    <video
      ref={ref}
      className={`absolute inset-0 h-full w-full object-cover ${className ?? ""}`}
      src={sources?.length ? undefined : url}
      crossOrigin={crossOrigin}
      preload={eager ? "auto" : "metadata"}
      muted
      loop
      playsInline
      disablePictureInPicture
      aria-label={alt}
    >
      {sources?.map((source) => (
        <source key={`${source.media ?? ""}:${source.src}`} src={source.src} media={source.media} />
      ))}
    </video>
  );
}

export function SiteMediaView({
  media,
  alt,
  className,
  priority = false,
  samplePixels = false,
  playback = "visible",
  sources,
}: {
  media: SiteMedia;
  alt: string;
  className?: string;
  priority?: boolean;
  samplePixels?: boolean;
  playback?: "visible" | "hover";
  sources?: VideoSource[];
}) {
  if (!media.url) return null;
  if (media.kind === "video") {
    return (
      <LazyVideo
        url={media.url}
        sources={sources}
        alt={alt}
        className={className}
        crossOrigin={samplePixels ? "anonymous" : undefined}
        playback={playback}
        eager={priority}
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
