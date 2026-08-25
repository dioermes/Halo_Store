import type { CSSProperties } from "react";

/** Proporzioni del ritaglio di public/logo-halo.png */
export const LOGO_RATIO = "752 / 566";

/**
 * Il logo e uno stencil bianco con alpha usato come maschera: quello che si vede
 * e lo sfondo del box ritagliato sulla forma del marchio. Cosi lo stesso file
 * segue currentColor (avorio in nav e footer, oro al passaggio del mouse)
 * senza dover generare un PNG per ogni variante.
 */
export const logoMaskStyle: CSSProperties = {
  WebkitMaskImage: "url(/logo-halo.png)",
  maskImage: "url(/logo-halo.png)",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  WebkitMaskPosition: "center",
  maskPosition: "center",
  WebkitMaskSize: "contain",
  maskSize: "contain",
  aspectRatio: LOGO_RATIO,
};

/** Marchio Halo Store. Imposta l'altezza e il colore del testo dal chiamante. */
export function HaloLogo({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      style={logoMaskStyle}
      className={`block bg-current ${className ?? ""}`}
    />
  );
}

/** Logo a colori originali (bordeaux sul nero). */
export function HaloLogoOriginal({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo-halo-originale.png"
      alt="Halo Store"
      className={`block w-auto object-contain ${className ?? ""}`}
    />
  );
}
