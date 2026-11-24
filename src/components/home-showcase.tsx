import { SiteMediaView } from "@/components/site-media";
import type { SiteMedia } from "@/lib/site";

export function HomeShowcase({ media }: { media: SiteMedia }) {
  return (
    <section aria-label="In evidenza">
      <div className="relative min-h-[50svh] overflow-hidden bg-ink-soft md:min-h-[70svh]">
        <SiteMediaView key={media.url} media={media} alt="Halo Store" className="h-full w-full object-cover" />
      </div>
    </section>
  );
}
