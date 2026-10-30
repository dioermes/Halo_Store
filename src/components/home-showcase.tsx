import { SiteMediaView } from "@/components/site-media";
import type { SiteMedia } from "@/lib/site";

export function HomeShowcase({ media }: { media: SiteMedia }) {
  return (
    <section aria-label="In evidenza" className="hidden lg:block">
      <div className="relative h-[100svh] overflow-hidden bg-ink-soft">
        <SiteMediaView key={media.url} media={media} alt="Halo Store" className="h-full w-full object-cover" />
      </div>
    </section>
  );
}
