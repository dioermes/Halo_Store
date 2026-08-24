import { createAdminClient } from "@/lib/supabase";
import { getStoreSettings, type StoreSettings } from "@/lib/settings";

export type PromoKind = "newsletter" | "birthday";

export type PromoQuote = {
  kind: PromoKind;
  code: string;
  percent: number;
  discountCents: number;
};

export type SubscriberRow = {
  email: string;
  birthday: string;
  marketing_opt_in: boolean;
  welcome_email_sent_at: string | null;
  welcome_redeemed_at: string | null;
  welcome_order_id: string | null;
  birthday_email_year: number | null;
  birthday_redeemed_at: string | null;
  birthday_order_id: string | null;
};

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function normalizePromoCode(code: string) {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));
}

export function romeYmd(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Rome",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function isLeap(year: number) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function parseIsoDate(value: string) {
  const match = value.slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const check = new Date(Date.UTC(year, month - 1, day));
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
    return null;
  }
  return { year, month, day };
}

export function isValidBirthday(value: string) {
  const parsed = parseIsoDate(value);
  if (!parsed) return false;
  const today = romeYmd();
  const [ty, tm, td] = today.split("-").map(Number);
  const birth = Date.UTC(parsed.year, parsed.month - 1, parsed.day);
  const now = Date.UTC(ty, tm - 1, td);
  const min = Date.UTC(ty - 120, tm - 1, td);
  return birth <= now && birth >= min;
}

function birthdayOnYear(birthday: string, year: number) {
  const parsed = parseIsoDate(birthday);
  if (!parsed) return null;
  let { month, day } = parsed;
  if (month === 2 && day === 29 && !isLeap(year)) day = 28;
  return { year, month, day };
}

export function isBirthdayToday(birthday: string, today = romeYmd()) {
  const [year, month, day] = today.split("-").map(Number);
  const on = birthdayOnYear(birthday, year);
  return Boolean(on && on.month === month && on.day === day);
}

export function isInBirthdayWindow(birthday: string, validDays: number, today = romeYmd()) {
  const [year, month, day] = today.split("-").map(Number);
  const on = birthdayOnYear(birthday, year);
  if (!on) return false;
  const start = Date.UTC(on.year, on.month - 1, on.day);
  const end = Date.UTC(on.year, on.month - 1, on.day + Math.max(1, validDays));
  const now = Date.UTC(year, month - 1, day);
  return now >= start && now < end;
}

function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(80, Math.max(0, Math.round(value)));
}

function discountFromSubtotal(subtotalCents: number, percent: number, paidOnline: boolean, shippingCents: number) {
  const raw = Math.round(subtotalCents * (clampPercent(percent) / 100));
  let discount = Math.min(Math.max(0, raw), Math.max(0, subtotalCents));
  if (paidOnline && subtotalCents + shippingCents - discount < 50) {
    discount = Math.max(0, subtotalCents + shippingCents - 50);
  }
  return discount;
}

export async function getSubscriber(email: string): Promise<SubscriberRow | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("halo_subscribers")
    .select(
      "email, birthday, marketing_opt_in, welcome_email_sent_at, welcome_redeemed_at, welcome_order_id, birthday_email_year, birthday_redeemed_at, birthday_order_id",
    )
    .eq("email", normalizeEmail(email))
    .maybeSingle();
  if (error) {
    console.error("[halo_subscribers]", error.message);
    return null;
  }
  return (data as SubscriberRow | null) ?? null;
}

export async function resolvePromo(opts: {
  email: string;
  code: string;
  subtotalCents: number;
  shippingCents: number;
  paidOnline: boolean;
  settings?: StoreSettings;
}): Promise<{ ok: true; quote: PromoQuote } | { ok: false; error: string }> {
  const code = normalizePromoCode(opts.code);
  if (!code) return { ok: false, error: "Inserisci un codice sconto." };
  const settings = opts.settings ?? (await getStoreSettings());
  const subscriber = await getSubscriber(opts.email);
  if (!subscriber || !subscriber.marketing_opt_in) {
    return { ok: false, error: "Questo codice è per chi è iscritto alla newsletter." };
  }

  const newsletterCode = normalizePromoCode(settings.newsletterCode);
  const birthdayCode = normalizePromoCode(settings.birthdayCode);

  if (code === newsletterCode) {
    if (subscriber.welcome_redeemed_at) {
      return { ok: false, error: "Il codice newsletter è già stato usato." };
    }
    const percent = clampPercent(settings.newsletterDiscountPercent);
    const discountCents = discountFromSubtotal(
      opts.subtotalCents,
      percent,
      opts.paidOnline,
      opts.shippingCents,
    );
    if (discountCents <= 0) return { ok: false, error: "Lo sconto newsletter non è applicabile su questo ordine." };
    return { ok: true, quote: { kind: "newsletter", code: newsletterCode, percent, discountCents } };
  }

  if (code === birthdayCode) {
    if (subscriber.birthday_redeemed_at) {
      return { ok: false, error: "Il codice compleanno è già stato usato." };
    }
    if (!isInBirthdayWindow(subscriber.birthday, settings.birthdayValidDays)) {
      return {
        ok: false,
        error: `Il codice compleanno vale ${settings.birthdayValidDays} giorni dal tuo compleanno.`,
      };
    }
    const percent = clampPercent(settings.birthdayDiscountPercent);
    const discountCents = discountFromSubtotal(
      opts.subtotalCents,
      percent,
      opts.paidOnline,
      opts.shippingCents,
    );
    if (discountCents <= 0) return { ok: false, error: "Lo sconto compleanno non è applicabile su questo ordine." };
    return { ok: true, quote: { kind: "birthday", code: birthdayCode, percent, discountCents } };
  }

  return { ok: false, error: "Codice non valido." };
}

export async function reservePromo(email: string, kind: PromoKind, orderId: string) {
  const admin = createAdminClient();
  const now = new Date().toISOString();
  const redeemed = kind === "newsletter" ? "welcome_redeemed_at" : "birthday_redeemed_at";
  const orderCol = kind === "newsletter" ? "welcome_order_id" : "birthday_order_id";
  const { data, error } = await admin
    .from("halo_subscribers")
    .update({ [redeemed]: now, [orderCol]: orderId, updated_at: now })
    .eq("email", normalizeEmail(email))
    .is(redeemed, null)
    .select("email")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Questo codice è già stato usato.");
}

export async function releasePromoForOrder(orderId: string) {
  const admin = createAdminClient();
  const now = new Date().toISOString();
  await admin
    .from("halo_subscribers")
    .update({ welcome_redeemed_at: null, welcome_order_id: null, updated_at: now })
    .eq("welcome_order_id", orderId);
  await admin
    .from("halo_subscribers")
    .update({ birthday_redeemed_at: null, birthday_order_id: null, updated_at: now })
    .eq("birthday_order_id", orderId);
}
