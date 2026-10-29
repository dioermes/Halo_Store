import { openingHours, storeConfig, type DaySchedule } from "@/lib/store-config";

/** Dati del negozio che il titolare può modificare dall'admin. */
export type StoreContact = {
  phone: { display: string; href: string };
  /** Numero WhatsApp (cifre internazionali) per pulsante, resi e notifiche. */
  whatsapp: { display: string; number: string };
  hours: DaySchedule[];
};

export const SLOTS_PER_DAY = 2;

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

const defaultWhatsappNumber = storeConfig.whatsapp.isConfigured
  ? storeConfig.whatsapp.number
  : storeConfig.phone.href.replace(/\D/g, "");

export const defaultStoreContact: StoreContact = {
  phone: { display: storeConfig.phone.display, href: storeConfig.phone.href },
  whatsapp: { display: `+${defaultWhatsappNumber}`, number: defaultWhatsappNumber },
  hours: openingHours,
};

/** Cifre del numero in formato internazionale (aggiunge 39 ai numeri italiani senza prefisso). */
export function phoneDigits(raw: string) {
  const trimmed = raw.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (trimmed.startsWith("+")) return digits;
  if (digits.startsWith("00")) return digits.slice(2);
  if (digits.startsWith("39") && digits.length >= 11) return digits;
  return `39${digits}`;
}

export function parsePhone(raw: unknown): StoreContact["phone"] | null {
  if (typeof raw !== "string") return null;
  const display = raw.trim().replace(/\s+/g, " ").slice(0, 30);
  if (!/^[+\d][\d\s().-]*$/.test(display)) return null;
  const digits = phoneDigits(display);
  if (digits.length < 8 || digits.length > 15) return null;
  return { display, href: `tel:+${digits}` };
}

export function parseWhatsapp(raw: unknown): StoreContact["whatsapp"] | null {
  const phone = parsePhone(raw);
  return phone ? { display: phone.display, number: phone.href.replace(/\D/g, "") } : null;
}

function toMinutes(value: string) {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}

function parseSlots(raw: unknown) {
  if (!Array.isArray(raw)) return [];
  const slots: DaySchedule["slots"] = [];
  for (const item of raw.slice(0, SLOTS_PER_DAY)) {
    const slot = item as { open?: unknown; close?: unknown } | null;
    if (
      slot &&
      typeof slot.open === "string" &&
      typeof slot.close === "string" &&
      TIME.test(slot.open) &&
      TIME.test(slot.close) &&
      toMinutes(slot.open) < toMinutes(slot.close)
    ) {
      slots.push({ open: slot.open, close: slot.close });
    }
  }
  return slots.sort((a, b) => toMinutes(a.open) - toMinutes(b.open));
}

export function parseStoreContact(value: unknown): StoreContact {
  if (!value || typeof value !== "object") return defaultStoreContact;
  const row = value as { phone?: unknown; whatsapp?: unknown; hours?: unknown };
  const phone = parsePhone(row.phone) ?? defaultStoreContact.phone;
  const whatsapp = parseWhatsapp(row.whatsapp) ?? defaultStoreContact.whatsapp;
  const saved = Array.isArray(row.hours) ? (row.hours as Array<Record<string, unknown>>) : null;
  const hours = saved
    ? defaultStoreContact.hours.map((day) => {
        const match = saved.find((entry) => entry?.day === day.day);
        return match ? { ...day, slots: parseSlots(match.slots) } : day;
      })
    : defaultStoreContact.hours;
  return { phone, whatsapp, hours };
}

/** Controlla le fasce di un giorno; restituisce un messaggio d'errore o le fasce valide. */
export function validateSlots(
  label: string,
  raw: Array<{ open: string; close: string }>,
): { error: string } | { slots: DaySchedule["slots"] } {
  const slots: DaySchedule["slots"] = [];
  for (const { open, close } of raw) {
    if (!open && !close) continue;
    if (!TIME.test(open) || !TIME.test(close)) {
      return { error: `${label}: compila sia l'apertura sia la chiusura.` };
    }
    if (toMinutes(open) >= toMinutes(close)) {
      return { error: `${label}: la chiusura deve essere dopo l'apertura.` };
    }
    slots.push({ open, close });
  }
  slots.sort((a, b) => toMinutes(a.open) - toMinutes(b.open));
  for (let i = 1; i < slots.length; i += 1) {
    if (toMinutes(slots[i].open) < toMinutes(slots[i - 1].close)) {
      return { error: `${label}: le fasce si sovrappongono.` };
    }
  }
  return { slots };
}
