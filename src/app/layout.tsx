import type { CSSProperties } from "react";
import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { itIT } from "@clerk/localizations";
import { Geist, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { HaloCursor } from "@/components/halo-cursor";
import { ReservationProvider } from "@/components/reservation-provider";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { ReservationBag } from "@/components/reservation-bag";
import { StructuredData } from "@/components/structured-data";
import { CookieBanner } from "@/components/cookie-banner";
import { NewsletterPopup } from "@/components/newsletter-popup";
import { storeConfig, fullAddress } from "@/lib/store-config";
import { clerkAppearance } from "@/lib/clerk-appearance";
import { getPublishedProducts } from "@/lib/catalog";
import { getStoreCategories } from "@/lib/categories";
import { displayHomeSectionTitle, getSiteAppearance } from "@/lib/site";
import { displayFontStack, googleFontHref } from "@/lib/display-fonts";

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
    default: `Halo Store Conversano · ${storeConfig.tagline}`,
    template: "%s · Halo Store Conversano",
  },
  description:
    "Halo Store, Via Castellana 18A a Conversano. Capi che non trovi ovunque. Catalogo online, ritiro in negozio o spedizione in Italia.",
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
    title: `Halo Store Conversano · ${storeConfig.tagline}`,
    description:
      "Capi che non trovi ovunque. Acquista online, ritira in negozio o fatti spedire in Italia.",
    siteName: "Halo Store",
    images: [{ url: "/catalogo/amb-interno.jpg", width: 1400, height: 933 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Halo Store Conversano",
    description: "Capi che non trovi ovunque. Acquista online.",
  },
  alternates: { canonical: "/" },
  other: { "geo.placename": fullAddress },
};

export const viewport: Viewport = {
  themeColor: "#c5cebc",
  colorScheme: "light",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [products, categories, appearance] = await Promise.all([
    getPublishedProducts(),
    getStoreCategories(),
    getSiteAppearance(),
  ]);

  const displayHref = googleFontHref(appearance.displayFont);

  return (
    <html
      lang="it"
      className={`${geistSans.variable} ${instrumentSerif.variable} h-full antialiased`}
      style={{ "--font-display": displayFontStack(appearance.displayFont) } as CSSProperties}
    >
      {displayHref ? (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="stylesheet" href={displayHref} />
        </>
      ) : null}
      <body
        className="min-h-full"
        style={
          {
            "--sold-out-bg": appearance.soldOutBadgeBg,
            "--sold-out-fg": appearance.soldOutBadgeFg,
          } as CSSProperties
        }
      >
        <ClerkProvider
          appearance={clerkAppearance}
          localization={itIT}
          signInUrl="/sign-in"
          signUpUrl="/sign-up"
          signInFallbackRedirectUrl="/account"
          signUpFallbackRedirectUrl="/account"
        >
          <StructuredData />
          <ReservationProvider products={products}>
            <HaloCursor />
            <SiteNav
              categories={categories}
              homeLinks={appearance.homeSections.map((section) => ({
                href: `/#${section.id}`,
                label: displayHomeSectionTitle(section.title),
              }))}
            />
            <main id="top">{children}</main>
            <SiteFooter />
            <ReservationBag />
            <CookieBanner />
            <NewsletterPopup />
          </ReservationProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
