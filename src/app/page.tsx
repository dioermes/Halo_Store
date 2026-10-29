import { Hero } from "@/components/hero";
import { HomeCollections } from "@/components/home-collections";
import { GiftCardShop } from "@/components/gift-card-shop";
import { StoreInfo } from "@/components/store-info";
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
      <HomeCollections sections={appearance.homeSections} />
      <GiftCardShop />
      <StoreInfo />
      <NewsletterSignup
        imageUrl={appearance.newsletterPopupImage}
        percent={settings.newsletterDiscountPercent}
      />
    </>
  );
}
