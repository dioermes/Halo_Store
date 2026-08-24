import { Hero } from "@/components/hero";
import { FeaturedRail } from "@/components/featured-rail";
import { StoryBreak } from "@/components/story-break";
import { Reviews } from "@/components/reviews";
import { StoreInfo } from "@/components/store-info";
import { getPublishedProducts } from "@/lib/catalog";
import { getSiteAppearance, pickFeatured, productKey, productsForHomeSection } from "@/lib/site";

export const dynamic = "force-dynamic";

function restOf(tagged: { uuid?: string; id: string }[], featured: { uuid?: string; id: string }[]) {
  if (tagged.length <= 4) return [];
  return tagged.filter(
    (product) => !featured.some((row) => productKey(row) === productKey(product)),
  );
}

export default async function Home() {
  const [products, appearance] = await Promise.all([
    getPublishedProducts(),
    getSiteAppearance(),
  ]);

  return (
    <>
      <Hero appearance={appearance} />
      {appearance.homeSections.map((section) => {
        const tagged = productsForHomeSection(section, products);
        const featured = pickFeatured(tagged, section.featuredIds);
        return (
          <div key={section.id} className="contents">
            <FeaturedRail
              id={section.id}
              title={section.title}
              featured={featured}
              rest={restOf(tagged, featured)}
            />
            {section.interlude?.url ? <StoryBreak media={section.interlude} /> : null}
          </div>
        );
      })}
      <Reviews />
      <StoreInfo />
    </>
  );
}
