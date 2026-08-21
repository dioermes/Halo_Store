"use client";

import Image from "next/image";
import type { SiteMedia } from "@/lib/site";

export function SiteMediaView({
  media,
  alt,
  className,
  priority = false,
}: {
  media: SiteMedia;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  if (!media.url) return null;
  if (media.kind === "video") {
    return (
      <video
        className={`absolute inset-0 h-full w-full object-cover ${className ?? ""}`}
        src={media.url}
        autoPlay
        muted
        loop
        playsInline
        aria-label={alt}
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
