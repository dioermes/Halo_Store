import { createHmac } from "node:crypto";
import { siteUrl } from "@/lib/stripe";

export function unsubscribeToken(email: string) {
  const secret = process.env.CLERK_SECRET_KEY || "halo-unsub";
  return createHmac("sha256", secret).update(email.toLowerCase()).digest("hex").slice(0, 24);
}

export function unsubscribeUrl(email: string) {
  const token = unsubscribeToken(email);
  return `${siteUrl()}/api/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`;
}
