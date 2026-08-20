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
