export const taglineDefaultColor = "#A3B18F";
export const taglineLastWordColor = "#5e1730";

export function taglineWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean);
}

// Un colore per parola: quelli mancanti o non validi usano i colori storici.
export function resolveTaglineColors(text: string, colors: unknown): string[] {
  const words = taglineWords(text);
  const saved = Array.isArray(colors) ? colors : [];
  return words.map((_, index) => {
    const value = saved[index];
    if (typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value.trim())) return value.trim();
    return words.length > 1 && index === words.length - 1 ? taglineLastWordColor : taglineDefaultColor;
  });
}
