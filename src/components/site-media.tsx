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

export function armBackgroundVideo(video: HTMLVideoElement) {
  video.controls = false;
  video.removeAttribute("controls");
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.setAttribute("playsinline", "true");
  video.setAttribute("webkit-playsinline", "true");
  video.disablePictureInPicture = true;
  const play = () => {
    video.controls = false;
    video.muted = true;
    if (video.paused) void video.play().catch(() => undefined);
  };
  play();
  video.addEventListener("canplay", play);
  return () => {
    video.removeEventListener("canplay", play);
  };
}

function LazyVideo({
  url,
  sources,
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
    video.muted = true;
    video.defaultMuted = true;
    video.controls = false;
    video.setAttribute("playsinline", "true");
    video.setAttribute("webkit-playsinline", "true");

    if (eager) {
      video.preload = "auto";
      const release = armBackgroundVideo(video);
      return () => {
        release();
        stopPlayback(video);
      };
    }

    const host = video.parentElement ?? video;
    let release: (() => void) | undefined;

    const start = () => {
      video.preload = "auto";
      release ??= armBackgroundVideo(video);
      playExclusive(video);
    };
    const stop = () => {
      release?.();
      release = undefined;
      stopPlayback(video);
    };

    const onScreen = () => {
      const rect = video.getBoundingClientRect();
      return rect.bottom > 0 && rect.top < window.innerHeight;
    };
    const observer = new IntersectionObserver(
      () => {
        if (playback === "hover") {
          if (!onScreen()) stop();
          return;
        }
        if (onScreen()) start();
        else stop();
      },
      { rootMargin: "280px 0px", threshold: 0 },
    );
    observer.observe(host);

    const onEnter = () => {
      if (playback === "hover") start();
    };
    const onLeave = () => {
      if (playback === "hover") stop();
    };
    if (playback === "hover") {
      host.addEventListener("pointerenter", onEnter);
      host.addEventListener("pointerleave", onLeave);
    }

    return () => {
      observer.disconnect();
      host.removeEventListener("pointerenter", onEnter);
      host.removeEventListener("pointerleave", onLeave);
      stop();
    };
  }, [url, playback, eager, sources]);

  return (
    <video
      ref={ref}
      className={`halo-bg-video absolute inset-0 h-full w-full object-cover ${className ?? ""}`}
      src={sources?.length ? undefined : url.split("#")[0]}
      crossOrigin={crossOrigin}
      preload={eager ? "auto" : "none"}
      autoPlay={eager}
      muted
      loop
      playsInline
      controls={false}
      disablePictureInPicture
      disableRemotePlayback
      aria-hidden
      tabIndex={-1}
      {...{ "webkit-playsinline": "true", "x-webkit-airplay": "deny" }}
    >
      {sources?.map((source) => (
        <source
          key={`${source.media ?? ""}:${source.src}`}
          src={source.src.split("#")[0]}
          media={source.media}
        />
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
    const hdSources =
      sources ??
      (media.urlHd
        ? [
            { src: media.urlHd, media: "(min-width: 768px)" },
            { src: media.url },
          ]
        : undefined);
    return (
      <LazyVideo
        url={media.url}
        sources={hdSources}
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
