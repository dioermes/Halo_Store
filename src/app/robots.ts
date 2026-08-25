import type { MetadataRoute } from "next";
import { storeConfig } from "@/lib/store-config";

export default function robots(): MetadataRoute.Robots {
  const base = storeConfig.siteUrl.replace(/\/$/, "");
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/account", "/checkout", "/api/", "/sign-in", "/sign-up"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
