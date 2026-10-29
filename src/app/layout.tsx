import type { CSSProperties } from "react";
import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { itIT } from "@clerk/localizations";
import "./globals.css";
import { HaloCursor } from "@/components/halo-cursor";
import { FavoritesProvider } from "@/components/favorites-provider";
import { ReservationProvider } from "@/components/reservation-provider";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { ReservationBag } from "@/components/reservation-bag";
import { StructuredData, NavigationData } from "@/components/structured-data";
import { CookieBanner } from "@/components/cookie-banner";
import { NewsletterPopup } from "@/components/newsletter-popup";
import { WhatsAppSupport } from "@/components/whatsapp-support";
import { storeConfig, fullAddress } from "@/lib/store-config";
import { clerkAppearance } from "@/lib/clerk-appearance";
import { getPublishedProducts } from "@/lib/catalog";
import { getStoreCategories } from "@/lib/categories";
import { getSiteAppearance, getStoreContact } from "@/lib/site";
import { StoreContactProvider } from "@/components/store-contact-provider";
import { displayFontStack, resolveBodyFont, resolveDisplayFont } from "@/lib/display-fonts";
import { displayFontClassNames } from "@/app/fonts";

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
    images: [{ url: "/catalogo/amb-interno.jpg", width: 474, height: 580 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Halo Store Conversano",
    description: "Capi che non trovi ovunque. Acquista online.",
    images: ["/catalogo/amb-interno.jpg"],
  },
  other: { "geo.placename": fullAddress },
};

export const viewport: Viewport = {
  themeColor: "#c5cebc",
  colorScheme: "light",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [products, categories, appearance, contact] = await Promise.all([
    getPublishedProducts(),
    getStoreCategories(),
    getSiteAppearance(),
    getStoreContact(),
  ]);

  return (
    <html
      lang="it"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${displayFontClassNames} h-full antialiased`}
      style={
        {
          "--font-display": displayFontStack(appearance.displayFont),
          "--display-weight": resolveDisplayFont(appearance.displayFont).weight ?? 400,
          "--font-sans": displayFontStack(appearance.bodyFont),
          ...(appearance.sectionTitleFont
            ? {
                "--font-section": displayFontStack(appearance.sectionTitleFont),
                "--section-weight": resolveDisplayFont(appearance.sectionTitleFont).weight ?? 400,
              }
            : {}),
          ...(appearance.productNameFont
            ? {
                "--font-product": displayFontStack(appearance.productNameFont),
                "--product-weight": resolveDisplayFont(appearance.productNameFont).weight ?? 400,
              }
            : {}),
        } as CSSProperties
      }
    >
      <body
        className="min-h-full"
        suppressHydrationWarning
        style={
          {
            fontWeight: resolveBodyFont(appearance.bodyFont).weight ?? 400,
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
          <NavigationData categories={categories} />
          <StoreContactProvider contact={contact}>
          <FavoritesProvider>
            <ReservationProvider products={products}>
              <HaloCursor />
              <SiteNav categories={categories} />
              <main id="top">{children}</main>
              <SiteFooter />
              <ReservationBag />
              <WhatsAppSupport />
              <CookieBanner />
              <NewsletterPopup imageUrl={appearance.newsletterPopupImage} />
            </ReservationProvider>
          </FavoritesProvider>
          </StoreContactProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
