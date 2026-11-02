import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    proxyClientMaxBodySize: "80mb",
  },
  images: {
    /**
     * Deployment Protection deve restare spenta in Production, altrimenti
     * `/_next/image` prende 401 sulla sorgente e le foto non si vedono.
     */
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      ...(process.env.R2_PUBLIC_URL
        ? [
            {
              protocol: "https" as const,
              hostname: new URL(process.env.R2_PUBLIC_URL).hostname,
              pathname: "/**",
            },
          ]
        : []),
      {
        protocol: "https",
        hostname: "arxdubgfweajgurymsms.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
