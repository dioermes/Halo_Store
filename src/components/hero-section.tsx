import Image from "next/image";
import { AutoplayClip } from "@/components/autoplay-clip";
import { HeroButtons } from "@/components/hero";
import type { SiteAppearance } from "@/lib/site";

export function HeroSection({ appearance }: { appearance: SiteAppearance }) {
  const mobile = appearance.heroMobile;
  const desktop = appearance.heroDesktop;
  const isVideo = mobile.kind === "video" || desktop.kind === "video";
  const videoSrc = mobile.kind === "video" ? mobile.url : desktop.kind === "video" ? desktop.url : "";
  const desktopSrc =
    desktop.kind === "video"
      ? desktop.urlHd ?? desktop.url
      : mobile.kind === "video"
        ? mobile.urlHd ?? mobile.url
        : undefined;

  return (
    <section
      className="relative isolate min-h-svh overflow-hidden bg-ink"
      aria-label="Halo Store"
    >
      <h1 className="sr-only">Halo Store</h1>
      <div className="absolute inset-0">
        {isVideo ? (
          <AutoplayClip
            id="halo-hero-video"
            src={videoSrc}
            desktopSrc={desktopSrc}
            preload="auto"
            autoPlay
          />
        ) : (
          <Image
            src={(mobile.url ? mobile : desktop).url}
            alt="Halo Store"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        )}
      </div>
      <HeroButtons appearance={appearance} />
    </section>
  );
}
