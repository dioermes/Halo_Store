import { openingHours, type DaySchedule } from "@/lib/store-config";

export type OpenState = {
  isOpen: boolean;
  /** "Chiude alle 13:00" oppure "Riapre alle 17:00" / "Riapre martedi alle 09:30" */
  detail: string;
};

function toMinutes(value: string) {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}

function scheduleFor(day: number): DaySchedule {
  return (
    openingHours.find((entry) => entry.day === day) ?? {
      day,
      label: "",
      slots: [],
    }
  );
}

/** Schema settimanale ordinato a partire da lunedi, per la tabella orari. */
export const weekSchedule = openingHours;

export function formatSlots(schedule: DaySchedule) {
  if (schedule.slots.length === 0) return "Chiuso";
  return schedule.slots
    .map((slot) => `${slot.open} - ${slot.close}`)
    .join("  /  ");
}

export function getOpenState(now: Date = new Date()): OpenState {
  const minutes = now.getHours() * 60 + now.getMinutes();
  const today = scheduleFor(now.getDay());

  for (const slot of today.slots) {
    if (minutes >= toMinutes(slot.open) && minutes < toMinutes(slot.close)) {
      return { isOpen: true, detail: `Chiude alle ${slot.close}` };
    }
  }

  const laterToday = today.slots.find(
    (slot) => toMinutes(slot.open) > minutes,
  );
  if (laterToday) {
    return { isOpen: false, detail: `Riapre alle ${laterToday.open}` };
  }

  for (let offset = 1; offset <= 7; offset += 1) {
    const next = scheduleFor((now.getDay() + offset) % 7);
    if (next.slots.length > 0) {
      const when = offset === 1 ? "domani" : next.label.toLowerCase();
      return { isOpen: false, detail: `Riapre ${when} alle ${next.slots[0].open}` };
    }
  }

  return { isOpen: false, detail: "Orari non disponibili" };
}

/** Prossimi giorni in cui il negozio è aperto, per la scelta del ritiro. */
export function getUpcomingOpenDays(count = 6, from: Date = new Date()) {
  const formatter = new Intl.DateTimeFormat("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const days: Array<{ value: string; label: string }> = [];

  for (let offset = 0; offset < 21 && days.length < count; offset += 1) {
    const date = new Date(from);
    date.setDate(from.getDate() + offset);
    if (scheduleFor(date.getDay()).slots.length === 0) continue;

    const label = formatter.format(date);
    days.push({
      value: label,
      label: offset === 0 ? `Oggi, ${label}` : offset === 1 ? `Domani, ${label}` : label,
    });
  }

  return days;
}

const ROME = "Europe/Rome";

function romeParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: ROME,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  const week: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return {
    day: week[get("weekday")] ?? 0,
    year: Number(get("year")),
    month: Number(get("month")),
    date: Number(get("day")),
    hour: Number(get("hour")),
    minute: Number(get("minute")),
  };
}

function romeLocalToUtc(
  year: number,
  month: number,
  date: number,
  hour: number,
  minute: number,
) {
  const utcGuess = Date.UTC(year, month - 1, date, hour, minute);
  const shown = romeParts(new Date(utcGuess));
  const shownMin = shown.hour * 60 + shown.minute;
  const wantMin = hour * 60 + minute;
  let diffMin = shownMin - wantMin;
  if (shown.date !== date || shown.month !== month) {
    const shownDay = Date.UTC(shown.year, shown.month - 1, shown.date);
    const wantDay = Date.UTC(year, month - 1, date);
    diffMin += Math.round((shownDay - wantDay) / 60000);
  }
  return new Date(utcGuess - diffMin * 60 * 1000);
}

function addRomeDays(
  parts: ReturnType<typeof romeParts>,
  days: number,
): ReturnType<typeof romeParts> {
  const noon = romeLocalToUtc(parts.year, parts.month, parts.date, 12, 0);
  noon.setUTCDate(noon.getUTCDate() + days);
  return romeParts(noon);
}

export function isOpenAt(date: Date) {
  const { day, hour, minute } = romeParts(date);
  const minutes = hour * 60 + minute;
  return scheduleFor(day).slots.some(
    (slot) => minutes >= toMinutes(slot.open) && minutes < toMinutes(slot.close),
  );
}

export type PickupSlot = {
  value: string;
  time: string;
  group: string;
  label: string;
};

function formatPickupGroup(date: Date, from: Date) {
  const formatter = new Intl.DateTimeFormat("it-IT", {
    timeZone: ROME,
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const start = romeParts(from);
  const target = romeParts(date);
  const pretty = formatter.format(date);
  if (target.date === start.date && target.month === start.month) return `Oggi, ${pretty}`;
  const tomorrow = addRomeDays(start, 1);
  if (target.date === tomorrow.date && target.month === tomorrow.month) return `Domani, ${pretty}`;
  return pretty;
}

export function formatPickupSlot(iso: string) {
  return new Intl.DateTimeFormat("it-IT", {
    timeZone: ROME,
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

/** Fasce di ritiro negli orari di apertura, da ora fino a 48 ore. */
export function getPickupSlotsWithinHours(hours = 48, from: Date = new Date(), step = 30) {
  const minT = from.getTime() + 30 * 60 * 1000;
  const maxT = from.getTime() + hours * 60 * 60 * 1000;
  const start = romeParts(from);
  const slots: PickupSlot[] = [];

  for (let offset = 0; offset <= 3; offset += 1) {
    const day = addRomeDays(start, offset);
    for (const window of scheduleFor(day.day).slots) {
      for (let minutes = toMinutes(window.open); minutes < toMinutes(window.close); minutes += step) {
        const utc = romeLocalToUtc(
          day.year,
          day.month,
          day.date,
          Math.floor(minutes / 60),
          minutes % 60,
        );
        if (utc.getTime() < minT || utc.getTime() > maxT) continue;
        const time = `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
        const group = formatPickupGroup(utc, from);
        slots.push({
          value: utc.toISOString(),
          time,
          group,
          label: `${group} · ${time}`,
        });
      }
    }
  }

  return slots;
}

export function isPickupWithinHours(iso: string, hours = 48, from: Date = new Date()) {
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return false;
  const minT = from.getTime() + 15 * 60 * 1000;
  const maxT = from.getTime() + hours * 60 * 60 * 1000;
  return at.getTime() >= minT && at.getTime() <= maxT && isOpenAt(at);
}

export function toSchemaOpeningHours() {
  const codes = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return openingHours.flatMap((entry) =>
    entry.slots.map((slot) => ({
      "@type": "OpeningHoursSpecification" as const,
      dayOfWeek: codes[entry.day],
      opens: slot.open,
      closes: slot.close,
    })),
  );
}
