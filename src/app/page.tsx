import { Hero } from "@/components/hero";
import { Manifesto } from "@/components/manifesto";
import { Catalog } from "@/components/catalog";
import { HowItWorks } from "@/components/how-it-works";
import { Reviews } from "@/components/reviews";
import { StoreInfo } from "@/components/store-info";

export default function Home() {
  return (
    <>
      <Hero />
      <Manifesto />
      <Catalog />
      <HowItWorks />
      <Reviews />
      <StoreInfo />
    </>
  );
}
