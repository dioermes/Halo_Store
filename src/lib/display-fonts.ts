export type DisplayFontGroup = "Serif" | "Sans" | "Script";

export type DisplayFont = {
  id: string;
  label: string;
  variable: string;
  fallback: "serif" | "sans-serif" | "cursive";
  group: DisplayFontGroup;
};

/** Catalogo admin: tutti i file .woff2 sono nel bundle, nessuno scarica da Google. */
export const displayFonts: DisplayFont[] = [
  { id: "instrument-serif", label: "Instrument Serif", variable: "--font-instrument-serif", fallback: "serif", group: "Serif" },
  { id: "cormorant", label: "Cormorant Garamond", variable: "--font-cormorant", fallback: "serif", group: "Serif" },
  { id: "playfair", label: "Playfair Display", variable: "--font-playfair", fallback: "serif", group: "Serif" },
  { id: "fraunces", label: "Fraunces", variable: "--font-fraunces", fallback: "serif", group: "Serif" },
  { id: "dm-serif", label: "DM Serif Display", variable: "--font-dm-serif", fallback: "serif", group: "Serif" },
  { id: "eb-garamond", label: "EB Garamond", variable: "--font-eb-garamond", fallback: "serif", group: "Serif" },
  { id: "cinzel", label: "Cinzel", variable: "--font-cinzel", fallback: "serif", group: "Serif" },
  { id: "libre-baskerville", label: "Libre Baskerville", variable: "--font-libre-baskerville", fallback: "serif", group: "Serif" },
  { id: "syne", label: "Syne", variable: "--font-syne", fallback: "sans-serif", group: "Sans" },
  { id: "outfit", label: "Outfit", variable: "--font-outfit", fallback: "sans-serif", group: "Sans" },
  { id: "oswald", label: "Oswald", variable: "--font-oswald", fallback: "sans-serif", group: "Sans" },
  { id: "tenor", label: "Tenor Sans", variable: "--font-tenor", fallback: "sans-serif", group: "Sans" },
  { id: "great-vibes", label: "Great Vibes", variable: "--font-great-vibes", fallback: "cursive", group: "Script" },
  { id: "allura", label: "Allura", variable: "--font-allura", fallback: "cursive", group: "Script" },
  { id: "parisienne", label: "Parisienne", variable: "--font-parisienne", fallback: "cursive", group: "Script" },
];

const byId = new Map(displayFonts.map((font) => [font.id, font]));

export const DEFAULT_DISPLAY_FONT = "instrument-serif";

export function resolveDisplayFont(id: unknown): DisplayFont {
  if (typeof id === "string" && byId.has(id)) return byId.get(id)!;
  return byId.get(DEFAULT_DISPLAY_FONT)!;
}

export function displayFontStack(id: unknown) {
  const font = resolveDisplayFont(id);
  if (font.fallback === "cursive") return `var(${font.variable}), cursive`;
  if (font.fallback === "sans-serif") {
    return `var(${font.variable}), ui-sans-serif, system-ui, sans-serif`;
  }
  return `var(${font.variable}), ui-serif, Georgia, serif`;
}

export const displayFontGroups: DisplayFontGroup[] = ["Serif", "Sans", "Script"];
