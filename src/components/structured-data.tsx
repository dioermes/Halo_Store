import { storeConfig } from "@/lib/store-config";
import { toSchemaOpeningHours } from "@/lib/opening-hours";
import { catalogPath } from "@/lib/categories";
import { isProductSoldOut, type Product } from "@/lib/products";

function absUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  const base = storeConfig.siteUrl.replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

function productNode(product: Product) {
  const page = absUrl(`${catalogPath(product.category)}#${product.id}`);
  return {
    "@type": "Product" as const,
    name: product.name,
    description: product.subtitle || product.description,
    image: absUrl(product.image),
    sku: product.id,
    brand: { "@type": "Brand" as const, name: storeConfig.name },
    url: page,
    offers: {
      "@type": "Offer" as const,
      url: page,
      priceCurrency: "EUR",
      price: Number(product.price.toFixed(2)),
      availability: isProductSoldOut(product)
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "ClothingStore" as const, name: storeConfig.name },
    },
  };
}

function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function StructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    name: storeConfig.name,
    legalName: storeConfig.legalName,
    description:
      "Negozio di abbigliamento uomo a Conversano. Capi selezionati, tessuti di qualità e prezzi onesti.",
    url: storeConfig.siteUrl,
    image: `${storeConfig.siteUrl}/catalogo/amb-interno.jpg`,
    address: {
      "@type": "PostalAddress",
      streetAddress: storeConfig.address.street,
      postalCode: storeConfig.address.postalCode,
      addressLocality: storeConfig.address.city,
      addressRegion: storeConfig.address.province,
      addressCountry: storeConfig.address.country,
    },
    hasMap: storeConfig.maps.place,
    geo: {
      "@type": "GeoCoordinates",
      latitude: storeConfig.coordinates.lat,
      longitude: storeConfig.coordinates.lng,
    },
    currenciesAccepted: "EUR",
    priceRange: "€€",
    openingHoursSpecification: toSchemaOpeningHours(),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: storeConfig.rating.value,
      reviewCount: storeConfig.rating.count,
      bestRating: 5,
    },
    review: [
      {
        "@type": "Review",
        author: { "@type": "Person", name: "Giovanni Porfido" },
        reviewRating: {
          "@type": "Rating",
          ratingValue: 5,
          bestRating: 5,
        },
        reviewBody:
          "Un'ottima esperienza, negozio di abbigliamento davvero eccezionale dove puoi trovare quello che cerchi e non trovi ovunque. Prezzi onesti e alta qualità dei tessuti, titolare educato e a modo. Lo consiglio, ci ritornerò per ogni evento.",
      },
    ],
    sameAs: [storeConfig.instagram.url],
  };

  return <JsonLd data={data} />;
}

/** Elenco capi con Offer: Google richiede offers, review o aggregateRating sui Product. */
export function ProductListStructuredData({ products }: { products: Product[] }) {
  if (!products.length) return null;
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": products.map(productNode),
      }}
    />
  );
}
