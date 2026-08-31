import { Hero } from "@/components/hero";
import { FeaturedRail } from "@/components/featured-rail";
import { StoryBreak } from "@/components/story-break";
import { Reviews } from "@/components/reviews";
import { StoreInfo } from "@/components/store-info";
import { getPublishedProducts } from "@/lib/catalog";
import {
  displayHomeSectionTitle,
  getSiteAppearance,
  pickFeatured,
  productKey,
  productsForHomeSection,
} from "@/lib/site";
import type { Product } from "@/lib/products";
import { ProductListStructuredData } from "@/components/structured-data";

export const dynamic = "force-dynamic";

function restOf(tagged: Product[], featured: Product[]) {
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
      <ProductListStructuredData products={products} />
      <Hero appearance={appearance} />
      {appearance.homeSections.map((section) => {
        const tagged = productsForHomeSection(section, products);
        const featured = pickFeatured(tagged, section.featuredIds);
        return (
          <div key={section.id} className="contents">
            <FeaturedRail
              id={section.id}
              title={displayHomeSectionTitle(section.title)}
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
