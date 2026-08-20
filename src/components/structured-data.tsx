import { storeConfig } from "@/lib/store-config";
import { toSchemaOpeningHours } from "@/lib/opening-hours";
import { products } from "@/lib/products";

export function StructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    name: storeConfig.name,
    legalName: storeConfig.legalName,
    description:
      "Negozio di abbigliamento uomo e donna a Conversano. Capi selezionati, tessuti di qualità e prezzi onesti.",
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
    makesOffer: products.slice(0, 8).map((product) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Product",
        name: `${product.name} · ${product.subtitle}`,
      },
      price: product.price,
      priceCurrency: "EUR",
      availability: "https://schema.org/InStoreOnly",
    })),
    sameAs: [storeConfig.instagram.url],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
