export const CONSENT_STORAGE = "halo-cookie-consent-v3";
export const CONSENT_COOKIE = "halo_cookie_consent";
export const CONSENT_CHANGED = "halo-consent-changed";
export const CONSENT_OPEN = "halo-open-cookie-banner";

const YEAR = 60 * 60 * 24 * 365;

export type HaloConsent = {
  necessary: true;
  /** Mappa Google incorporata. */
  embeds: boolean;
  decidedAt: string;
};

function parse(raw: string | null): HaloConsent | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as Partial<HaloConsent>;
    if (data.necessary !== true || typeof data.embeds !== "boolean") return null;
    return {
      necessary: true,
      embeds: data.embeds,
      decidedAt: typeof data.decidedAt === "string" ? data.decidedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function readConsent(): HaloConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const fromStorage = parse(window.localStorage.getItem(CONSENT_STORAGE));
    if (fromStorage) return fromStorage;
  } catch {
    // ignore
  }
  try {
    const part = document.cookie
      .split(";")
      .map((row) => row.trim())
      .find((row) => row.startsWith(`${CONSENT_COOKIE}=`));
    if (!part) return null;
    const value = decodeURIComponent(part.slice(CONSENT_COOKIE.length + 1));
    if (value === "all") {
      return { necessary: true, embeds: true, decidedAt: new Date().toISOString() };
    }
    if (value === "necessary") {
      return { necessary: true, embeds: false, decidedAt: new Date().toISOString() };
    }
  } catch {
    // ignore
  }
  return null;
}

export function hasConsentDecision() {
  return readConsent() !== null;
}

export function embedsAllowed() {
  return readConsent()?.embeds === true;
}

export function writeConsent(embeds: boolean) {
  const payload: HaloConsent = {
    necessary: true,
    embeds,
    decidedAt: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(CONSENT_STORAGE, JSON.stringify(payload));
  } catch {
    // ignore
  }
  try {
    document.cookie = `${CONSENT_COOKIE}=${embeds ? "all" : "necessary"}; Max-Age=${YEAR}; Path=/; SameSite=Lax`;
  } catch {
    // ignore
  }
  window.dispatchEvent(new Event(CONSENT_CHANGED));
}

export function openCookieBanner() {
  window.dispatchEvent(new Event(CONSENT_OPEN));
}
