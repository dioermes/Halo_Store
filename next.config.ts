import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /**
     * Su Vercel le foto passano da `/_next/image`. Se il progetto ha
     * Deployment Protection, l'ottimizzatore chiede il file sorgente senza
     * il cookie SSO e ottiene 401: il sito si vede, le foto no.
     * I JPEG in /public/catalogo sono gia compressi: li serviamo cosi come sono.
     */
    unoptimized: true,
  },
};

export default nextConfig;
