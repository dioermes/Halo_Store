export type DisplayFontGroup = "Serif" | "Sans" | "Script";

export type DisplayFont = {
  id: string;
  label: string;
  family: string;
  /** Parametro family= per Google Fonts CSS2. Null = già nel sito (Instrument Serif). */
  query: string | null;
  fallback: "serif" | "sans-serif" | "cursive";
  group: DisplayFontGroup;
};

export const displayFonts: DisplayFont[] = [
  { id: "instrument-serif", label: "Instrument Serif", family: "Instrument Serif", query: null, fallback: "serif", group: "Serif" },
  { id: "playfair", label: "Playfair Display", family: "Playfair Display", query: "Playfair+Display:ital,wght@0,400;0,700;1,400", fallback: "serif", group: "Serif" },
  { id: "cormorant", label: "Cormorant Garamond", family: "Cormorant Garamond", query: "Cormorant+Garamond:ital,wght@0,400;0,600;1,400", fallback: "serif", group: "Serif" },
  { id: "fraunces", label: "Fraunces", family: "Fraunces", query: "Fraunces:ital,wght@0,400;0,700;1,400", fallback: "serif", group: "Serif" },
  { id: "dm-serif", label: "DM Serif Display", family: "DM Serif Display", query: "DM+Serif+Display:ital@0;1", fallback: "serif", group: "Serif" },
  { id: "eb-garamond", label: "EB Garamond", family: "EB Garamond", query: "EB+Garamond:ital,wght@0,400;0,600;1,400", fallback: "serif", group: "Serif" },
  { id: "libre-baskerville", label: "Libre Baskerville", family: "Libre Baskerville", query: "Libre+Baskerville:ital,wght@0,400;0,700;1,400", fallback: "serif", group: "Serif" },
  { id: "lora", label: "Lora", family: "Lora", query: "Lora:ital,wght@0,400;0,600;1,400", fallback: "serif", group: "Serif" },
  { id: "spectral", label: "Spectral", family: "Spectral", query: "Spectral:ital,wght@0,400;0,600;1,400", fallback: "serif", group: "Serif" },
  { id: "newsreader", label: "Newsreader", family: "Newsreader", query: "Newsreader:ital,wght@0,400;0,600;1,400", fallback: "serif", group: "Serif" },
  { id: "source-serif", label: "Source Serif 4", family: "Source Serif 4", query: "Source+Serif+4:ital,wght@0,400;0,600;1,400", fallback: "serif", group: "Serif" },
  { id: "cardo", label: "Cardo", family: "Cardo", query: "Cardo:ital,wght@0,400;0,700;1,400", fallback: "serif", group: "Serif" },
  { id: "bodoni", label: "Bodoni Moda", family: "Bodoni Moda", query: "Bodoni+Moda:ital,wght@0,400;0,700;1,400", fallback: "serif", group: "Serif" },
  { id: "cinzel", label: "Cinzel", family: "Cinzel", query: "Cinzel:wght@400;600", fallback: "serif", group: "Serif" },
  { id: "prata", label: "Prata", family: "Prata", query: "Prata", fallback: "serif", group: "Serif" },
  { id: "yeseva", label: "Yeseva One", family: "Yeseva One", query: "Yeseva+One", fallback: "serif", group: "Serif" },
  { id: "unna", label: "Unna", family: "Unna", query: "Unna:ital@0;1", fallback: "serif", group: "Serif" },
  { id: "marcellus", label: "Marcellus", family: "Marcellus", query: "Marcellus", fallback: "serif", group: "Serif" },
  { id: "forum", label: "Forum", family: "Forum", query: "Forum", fallback: "serif", group: "Serif" },
  { id: "oranienbaum", label: "Oranienbaum", family: "Oranienbaum", query: "Oranienbaum", fallback: "serif", group: "Serif" },
  { id: "italiana", label: "Italiana", family: "Italiana", query: "Italiana", fallback: "serif", group: "Serif" },
  { id: "cormorant-infant", label: "Cormorant Infant", family: "Cormorant Infant", query: "Cormorant+Infant:ital,wght@0,400;0,600;1,400", fallback: "serif", group: "Serif" },
  { id: "syne", label: "Syne", family: "Syne", query: "Syne:wght@400;700", fallback: "sans-serif", group: "Sans" },
  { id: "outfit", label: "Outfit", family: "Outfit", query: "Outfit:wght@400;600", fallback: "sans-serif", group: "Sans" },
  { id: "oswald", label: "Oswald", family: "Oswald", query: "Oswald:wght@400;600", fallback: "sans-serif", group: "Sans" },
  { id: "bebas", label: "Bebas Neue", family: "Bebas Neue", query: "Bebas+Neue", fallback: "sans-serif", group: "Sans" },
  { id: "archivo", label: "Archivo", family: "Archivo", query: "Archivo:ital,wght@0,400;0,600;1,400", fallback: "sans-serif", group: "Sans" },
  { id: "manrope", label: "Manrope", family: "Manrope", query: "Manrope:wght@400;600", fallback: "sans-serif", group: "Sans" },
  { id: "dm-sans", label: "DM Sans", family: "DM Sans", query: "DM+Sans:ital,wght@0,400;0,600;1,400", fallback: "sans-serif", group: "Sans" },
  { id: "tenor", label: "Tenor Sans", family: "Tenor Sans", query: "Tenor+Sans", fallback: "sans-serif", group: "Sans" },
  { id: "great-vibes", label: "Great Vibes", family: "Great Vibes", query: "Great+Vibes", fallback: "cursive", group: "Script" },
  { id: "allura", label: "Allura", family: "Allura", query: "Allura", fallback: "cursive", group: "Script" },
  { id: "parisienne", label: "Parisienne", family: "Parisienne", query: "Parisienne", fallback: "cursive", group: "Script" },
  { id: "sacramento", label: "Sacramento", family: "Sacramento", query: "Sacramento", fallback: "cursive", group: "Script" },
  { id: "pinyon", label: "Pinyon Script", family: "Pinyon Script", query: "Pinyon+Script", fallback: "cursive", group: "Script" },
  { id: "tangerine", label: "Tangerine", family: "Tangerine", query: "Tangerine:wght@400;700", fallback: "cursive", group: "Script" },
];

const byId = new Map(displayFonts.map((font) => [font.id, font]));

export const DEFAULT_DISPLAY_FONT = "instrument-serif";

export function resolveDisplayFont(id: unknown): DisplayFont {
  if (typeof id === "string" && byId.has(id)) return byId.get(id)!;
  return byId.get(DEFAULT_DISPLAY_FONT)!;
}

export function displayFontStack(id: unknown) {
  const font = resolveDisplayFont(id);
  if (!font.query) {
    return "var(--font-instrument-serif), ui-serif, Georgia, serif";
  }
  const quoted = `'${font.family}'`;
  if (font.fallback === "cursive") return `${quoted}, cursive`;
  if (font.fallback === "sans-serif") return `${quoted}, ui-sans-serif, system-ui, sans-serif`;
  return `${quoted}, ui-serif, Georgia, serif`;
}

export function googleFontHref(id: unknown) {
  const font = resolveDisplayFont(id);
  if (!font.query) return null;
  return `https://fonts.googleapis.com/css2?family=${font.query}&display=swap`;
}

export function allGoogleFontsHref() {
  const families = displayFonts
    .filter((font) => font.query)
    .map((font) => `family=${font.family.replace(/ /g, "+")}`);
  return `https://fonts.googleapis.com/css2?${families.join("&")}&display=swap`;
}

export const displayFontGroups: DisplayFontGroup[] = ["Serif", "Sans", "Script"];
