import type { Metadata, Viewport } from "next";
import { Geist, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { HaloCursor } from "@/components/halo-cursor";
import { ReservationProvider } from "@/components/reservation-provider";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { ReservationBag } from "@/components/reservation-bag";
import { StructuredData } from "@/components/structured-data";
import { storeConfig, fullAddress } from "@/lib/store-config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(storeConfig.siteUrl),
  title: {
    default: "Halo Store Conversano · Abbigliamento uomo e donna",
    template: "%s · Halo Store Conversano",
  },
  description:
    "Halo Store, Via Castellana 18A a Conversano. Capi che non trovi ovunque, tessuti di qualità e prezzi onesti. Sfoglia il catalogo e prenota il capo prima di venire in negozio.",
  keywords: [
    "negozio abbigliamento Conversano",
    "Halo Store Conversano",
    "abbigliamento uomo Conversano",
    "denim Conversano",
    "boutique Bari",
  ],
  openGraph: {
    type: "website",
    locale: "it_IT",
    title: "Halo Store Conversano · Abbigliamento uomo e donna",
    description:
      "Capi che non trovi ovunque. Sfoglia il catalogo e prenota il tuo capo prima di arrivare in negozio.",
    siteName: "Halo Store",
    images: [{ url: "/catalogo/amb-interno.jpg", width: 1400, height: 933 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Halo Store Conversano",
    description: "Capi che non trovi ovunque. Prenota prima di arrivare.",
  },
  alternates: { canonical: "/" },
  other: { "geo.placename": fullAddress },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="it"
      className={`${geistSans.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <StructuredData />
        <ReservationProvider>
          <HaloCursor />
          <SiteNav />
          <main id="top">{children}</main>
          <SiteFooter />
          <ReservationBag />
        </ReservationProvider>
      </body>
    </html>
  );
}
