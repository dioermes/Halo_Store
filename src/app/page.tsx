import { Hero } from "@/components/hero";
import { FeaturedRail } from "@/components/featured-rail";
import { StoryBreak } from "@/components/story-break";
import { Catalog } from "@/components/catalog";
import { Reviews } from "@/components/reviews";
import { StoreInfo } from "@/components/store-info";
import { getPublishedProducts } from "@/lib/catalog";
import { getStoreCategories } from "@/lib/categories";
import { getSiteAppearance, pickFeatured, productKey } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [products, categories, appearance] = await Promise.all([
    getPublishedProducts(),
    getStoreCategories(),
    getSiteAppearance(),
  ]);

  const newArrivals = products.filter((product) => product.isNewArrival);
  const bestsellers = products.filter((product) => product.isBestseller);
  const featuredNew = pickFeatured(newArrivals, appearance.featuredNewIds);
  const featuredBest = pickFeatured(bestsellers, appearance.featuredBestIds);
  const restNew =
    newArrivals.length > 4
      ? newArrivals.filter(
          (product) => !featuredNew.some((row) => productKey(row) === productKey(product)),
        )
      : [];
  const restBest =
    bestsellers.length > 4
      ? bestsellers.filter(
          (product) => !featuredBest.some((row) => productKey(row) === productKey(product)),
        )
      : [];

  return (
    <>
      <Hero appearance={appearance} />
      <FeaturedRail
        id="nuovi-arrivi"
        title="Nuovi arrivi"
        featured={featuredNew}
        rest={restNew}
      />
      <StoryBreak media={appearance.interlude} />
      <FeaturedRail
        id="best-seller"
        title="Best seller"
        featured={featuredBest}
        rest={restBest}
      />
      <Catalog products={products} categories={categories} />
      <Reviews />
      <StoreInfo />
    </>
  );
}
