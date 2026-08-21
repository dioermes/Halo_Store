import Stripe from "stripe";

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

function withHttpsHost(host: string) {
  const trimmed = host.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return `https://${trimmed}`;
}

export function siteUrl(request?: Request) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";
  if (configured && !isLocalUrl(configured)) return configured;

  const host = request?.headers.get("x-forwarded-host") ?? request?.headers.get("host");
  const proto =
    request?.headers.get("x-forwarded-proto") ?? (host && isLocalUrl(host) ? "http" : "https");
  if (host) return `${proto}://${host}`.replace(/\/$/, "");

  if (process.env.VERCEL_URL) return withHttpsHost(process.env.VERCEL_URL);
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return withHttpsHost(process.env.VERCEL_PROJECT_PRODUCTION_URL);
  }
  return configured || "http://localhost:3000";
}
