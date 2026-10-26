import Stripe from "stripe";
import { storeConfig } from "@/lib/store-config";

export function isStripeConfigured() {
  return Boolean(
    process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  );
}

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("Manca STRIPE_SECRET_KEY");
  }
  return new Stripe(key);
}

export function integrationIdentifier() {
  const suffix = Math.random().toString(36).slice(2, 10);
  return `halo_store_${suffix}`;
}

function isLocalUrl(value: string) {
  return /localhost|127\.0\.0\.1/.test(value);
}

export function siteUrl(request?: Request) {
  const canonical = storeConfig.siteUrl.replace(/\/$/, "");
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";
  if (configured && !isLocalUrl(configured)) return configured;

  const host = request?.headers.get("x-forwarded-host") ?? request?.headers.get("host");
  const proto =
    request?.headers.get("x-forwarded-proto") ?? (host && isLocalUrl(host) ? "http" : "https");
  if (host) {
    if (host.includes("vercel.app") || host === "halostore.it") return canonical;
    return `${proto}://${host}`.replace(/\/$/, "");
  }

  return configured || canonical;
}
