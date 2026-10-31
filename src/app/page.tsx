import { Hero } from "@/components/hero";
import { HomeCollections } from "@/components/home-collections";
import { HomeShowcase } from "@/components/home-showcase";
import { GiftCardShop } from "@/components/gift-card-shop";
import { StoreInfo } from "@/components/store-info";
import { TaglineBand } from "@/components/tagline-band";
import { HelpFaq } from "@/components/help-faq";
import { ServiceStrip } from "@/components/service-strip";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { getStoreSettings } from "@/lib/settings";
import { getPublishedProducts } from "@/lib/catalog";
import { getSiteAppearance } from "@/lib/site";
import { ProductListStructuredData } from "@/components/structured-data";

export const metadata = { alternates: { canonical: "/" } };

export const dynamic = "force-dynamic";

export default async function Home() {
  const [products, appearance, settings] = await Promise.all([
    getPublishedProducts(),
    getSiteAppearance(),
    getStoreSettings(),
  ]);

  return (
    <>
      <ProductListStructuredData products={products} />
      <Hero appearance={appearance} />
      {appearance.tagline ? (
        <TaglineBand text={appearance.tagline} colors={appearance.taglineColors} />
      ) : null}
      <HomeCollections sections={appearance.homeSections} />
      {appearance.showcase ? <HomeShowcase media={appearance.showcase} /> : null}
      <GiftCardShop media={appearance.giftCardMedia} />
      <StoreInfo />
      <HelpFaq />
      <NewsletterSignup
        imageUrl={appearance.newsletterPopupImage}
        percent={settings.newsletterDiscountPercent}
      />
      <ServiceStrip />
    </>
  );
}
