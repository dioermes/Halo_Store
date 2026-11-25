import Link from "next/link";
import { SiteMediaView } from "@/components/site-media";
import { ambientImages } from "@/lib/products";
import { catalogTagForHomeSection, type HomeSection } from "@/lib/site";

export function HomeCollections({ sections }: { sections: HomeSection[] }) {
  const visible = sections
    .slice(0, 4)
    .flatMap((section) => {
      const tag = catalogTagForHomeSection(section);
      return tag ? [{ section, tag }] : [];
    });

  if (!visible.length) return null;

  return (
    <section
      className="grid grid-cols-2 gap-2 bg-white p-2 lg:grid-cols-4 lg:gap-1 lg:p-1"
      aria-label="Collezioni in evidenza"
    >
      {visible.map(({ section, tag }, index) => (
        <Link
          key={section.id}
          href={`/catalogo?tag=${encodeURIComponent(tag)}`}
          className="group relative block min-h-[48svh] w-full min-w-0 overflow-hidden bg-ink-soft sm:min-h-[60svh] lg:min-h-[calc(100svh-0.5rem)]"
          aria-label={`Scopri ${section.title}`}
        >
          <div className="absolute inset-0">
            <SiteMediaView
              media={
                section.interlude ?? {
                  url: ambientImages.interior,
                  kind: "image",
                }
              }
              alt={section.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              playback="hover"
              sizes="(max-width: 1023px) 50vw, 25vw"
              priority={index < 2}
            />
          </div>
          <div
            aria-hidden
            className="absolute inset-0 bg-linear-to-t from-black/65 via-transparent to-transparent"
          />
          <span className="absolute inset-x-4 bottom-5 z-10 text-[clamp(0.7rem,1.35vw,0.9rem)] font-semibold uppercase tracking-[0.16em] text-white sm:inset-x-5 sm:bottom-6">
            {section.title}
          </span>
        </Link>
      ))}
    </section>
  );
}
