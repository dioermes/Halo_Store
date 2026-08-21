"use client";

import { SiteMediaView } from "@/components/site-media";
import type { SiteMedia } from "@/lib/site";

export function StoryBreak({ media }: { media: SiteMedia }) {
  if (!media.url) return null;
  return (
    <section
      className="relative isolate min-h-[100svh] overflow-hidden bg-ink"
      aria-label="Passaggio visivo"
    >
      <div className="absolute inset-0">
        <SiteMediaView
          key={media.url}
          media={media}
          alt=""
          className="h-full w-full object-cover"
        />
      </div>
    </section>
  );
}
