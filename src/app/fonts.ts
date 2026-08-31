import localFont from "next/font/local";
import { Geist, Instrument_Serif } from "next/font/google";

export const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const cormorant = localFont({
  src: [
    { path: "../fonts/cormorant-garamond-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/cormorant-garamond-400-italic.woff2", weight: "400", style: "italic" },
    { path: "../fonts/cormorant-garamond-600.woff2", weight: "600", style: "normal" },
    { path: "../fonts/cormorant-garamond-600-italic.woff2", weight: "600", style: "italic" },
  ],
  variable: "--font-cormorant",
  display: "swap",
  preload: false,
  fallback: ["Georgia", "serif"],
});

export const playfair = localFont({
  src: [
    { path: "../fonts/playfair-display-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/playfair-display-400-italic.woff2", weight: "400", style: "italic" },
    { path: "../fonts/playfair-display-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-playfair",
  display: "swap",
  preload: false,
  fallback: ["Georgia", "serif"],
});

export const fraunces = localFont({
  src: [
    { path: "../fonts/fraunces-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/fraunces-400-italic.woff2", weight: "400", style: "italic" },
    { path: "../fonts/fraunces-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-fraunces",
  display: "swap",
  preload: false,
  fallback: ["Georgia", "serif"],
});

export const dmSerif = localFont({
  src: [
    { path: "../fonts/dm-serif-display-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/dm-serif-display-400-italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-dm-serif",
  display: "swap",
  preload: false,
  fallback: ["Georgia", "serif"],
});

export const ebGaramond = localFont({
  src: [
    { path: "../fonts/eb-garamond-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/eb-garamond-400-italic.woff2", weight: "400", style: "italic" },
    { path: "../fonts/eb-garamond-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-eb-garamond",
  display: "swap",
  preload: false,
  fallback: ["Georgia", "serif"],
});

export const cinzel = localFont({
  src: [
    { path: "../fonts/cinzel-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/cinzel-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-cinzel",
  display: "swap",
  preload: false,
  fallback: ["Georgia", "serif"],
});

export const libreBaskerville = localFont({
  src: [
    { path: "../fonts/libre-baskerville-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/libre-baskerville-400-italic.woff2", weight: "400", style: "italic" },
    { path: "../fonts/libre-baskerville-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-libre-baskerville",
  display: "swap",
  preload: false,
  fallback: ["Georgia", "serif"],
});

export const syne = localFont({
  src: [
    { path: "../fonts/syne-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/syne-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-syne",
  display: "swap",
  preload: false,
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

export const outfit = localFont({
  src: [
    { path: "../fonts/outfit-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/outfit-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-outfit",
  display: "swap",
  preload: false,
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

export const oswald = localFont({
  src: [
    { path: "../fonts/oswald-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/oswald-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-oswald",
  display: "swap",
  preload: false,
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

export const tenorSans = localFont({
  src: [{ path: "../fonts/tenor-sans-400.woff2", weight: "400", style: "normal" }],
  variable: "--font-tenor",
  display: "swap",
  preload: false,
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

export const greatVibes = localFont({
  src: [{ path: "../fonts/great-vibes-400.woff2", weight: "400", style: "normal" }],
  variable: "--font-great-vibes",
  display: "swap",
  preload: false,
  fallback: ["cursive"],
});

export const allura = localFont({
  src: [{ path: "../fonts/allura-400.woff2", weight: "400", style: "normal" }],
  variable: "--font-allura",
  display: "swap",
  preload: false,
  fallback: ["cursive"],
});

export const parisienne = localFont({
  src: [{ path: "../fonts/parisienne-400.woff2", weight: "400", style: "normal" }],
  variable: "--font-parisienne",
  display: "swap",
  preload: false,
  fallback: ["cursive"],
});

export const displayFontClassNames = [
  geistSans.variable,
  instrumentSerif.variable,
  cormorant.variable,
  playfair.variable,
  fraunces.variable,
  dmSerif.variable,
  ebGaramond.variable,
  cinzel.variable,
  libreBaskerville.variable,
  syne.variable,
  outfit.variable,
  oswald.variable,
  tenorSans.variable,
  greatVibes.variable,
  allura.variable,
  parisienne.variable,
].join(" ");
