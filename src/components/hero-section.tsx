import Image from "next/image";
import { Hero } from "@/components/hero";
import type { SiteAppearance } from "@/lib/site";
import { videoSrcWithFrame } from "@/lib/video";

function HeroMedia({ appearance }: { appearance: SiteAppearance }) {
  const mobile = appearance.heroMobile;
  const desktop = appearance.heroDesktop;
  const video = mobile.kind === "video" ? mobile : desktop.kind === "video" ? desktop : null;

  if (video) {
    const mobileSrc = videoSrcWithFrame((mobile.kind === "video" ? mobile : video).url);
    const desktopSrc = desktop.kind === "video" ? videoSrcWithFrame(desktop.url) : undefined;
    return (
      <video
        className="halo-bg-video absolute inset-0 h-full w-full object-cover"
        src={mobileSrc}
        data-desktop-src={desktopSrc}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        controls={false}
        disablePictureInPicture
        disableRemotePlayback
        aria-hidden
        {...{ "webkit-playsinline": "true", "x-webkit-airplay": "deny" }}
      />
    );
  }

  const image = mobile.url ? mobile : desktop;
  return (
    <Image
      src={image.url}
      alt="Halo Store"
      fill
      priority
      sizes="100vw"
      className="object-cover"
    />
  );
}

export function HeroSection({ appearance }: { appearance: SiteAppearance }) {
  const isVideo =
    appearance.heroMobile.kind === "video" || appearance.heroDesktop.kind === "video";
  return (
    <Hero appearance={appearance} isVideo={isVideo}>
      <HeroMedia appearance={appearance} />
    </Hero>
  );
}
