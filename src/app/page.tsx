import { Hero } from "@/components/hero";
import { Manifesto } from "@/components/manifesto";
import { Catalog } from "@/components/catalog";
import { HowItWorks } from "@/components/how-it-works";
import { Reviews } from "@/components/reviews";
import { StoreInfo } from "@/components/store-info";
import { getPublishedProducts } from "@/lib/catalog";
import { getStoreCategories } from "@/lib/categories";

export default async function Home() {
  const [products, categories] = await Promise.all([
    getPublishedProducts(),
    getStoreCategories(),
  ]);

  return (
    <>
      <Hero />
      <Manifesto />
      <Catalog products={products} categories={categories} />
      <HowItWorks />
      <Reviews />
      <StoreInfo />
    </>
  );
}
