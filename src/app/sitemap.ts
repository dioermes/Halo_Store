import type { MetadataRoute } from "next";
import { catalogPath, getStoreCategories } from "@/lib/categories";
import { getPublishedProducts } from "@/lib/catalog";
import { productPath } from "@/lib/product-path";
import { storeConfig } from "@/lib/store-config";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = storeConfig.siteUrl.replace(/\/$/, "");
  const now = new Date();
  const categories = await getStoreCategories();
  const products = await getPublishedProducts();

  const pages: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/catalogo`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/cookie`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/termini`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  for (const category of categories) {
    pages.push({
      url: `${base}${catalogPath(category.id)}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  for (const product of products) {
    pages.push({
      url: `${base}${productPath(product.id)}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  return pages;
}
