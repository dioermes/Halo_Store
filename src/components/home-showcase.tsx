import { SiteMediaView } from "@/components/site-media";
import type { SiteMedia } from "@/lib/site";

export function HomeShowcase({ media }: { media: SiteMedia }) {
  return (
    <section aria-label="In evidenza">
      <div className="relative h-[70svh] overflow-hidden bg-ink-soft sm:h-[75svh] lg:h-[100svh]">
        <SiteMediaView key={media.url} media={media} alt="Halo Store" className="h-full w-full object-cover" />
      </div>
    </section>
  );
}
