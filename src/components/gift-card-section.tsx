import Image from "next/image";
import { AutoplayClip } from "@/components/autoplay-clip";
import { PlayWhenVisible } from "@/components/background-video-runtime";
import { GiftCardShop } from "@/components/gift-card-shop";
import type { SiteMedia } from "@/lib/site";

export function GiftCardSection({ media }: { media: SiteMedia }) {
  return (
    <section
      id="gift-card"
      className="bg-white pb-8 text-[#3f1521] sm:pb-12"
      aria-labelledby="gift-card-title"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-[#c5cebc]">
        {media.kind === "video" && media.url ? (
          <>
            <AutoplayClip
              id="halo-gift-video"
              src={media.url}
              desktopSrc={media.urlHd}
              preload="none"
              autoPlay={false}
            />
            <PlayWhenVisible id="halo-gift-video" />
          </>
        ) : media.url ? (
          <Image src={media.url} alt="Gift card Halo Store" fill sizes="100vw" className="object-cover" />
        ) : null}
      </div>
      <GiftCardShop />
    </section>
  );
}
