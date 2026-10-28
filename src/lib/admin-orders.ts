import { createAdminClient } from "@/lib/supabase";

const SEEN_KEY = "admin_seen_order_ids";

type DatedOrder = { created_at: string };

type AdminOrderDateGroup<T extends DatedOrder> = {
  key: string;
  label: string;
  orders: T[];
};

function romeDateKey(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Rome",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((value) => value.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function groupAdminOrdersByDate<T extends DatedOrder>(orders: T[]) {
  const groups = new Map<string, AdminOrderDateGroup<T>>();
  const today = romeDateKey(new Date());
  const yesterdayDate = new Date(`${today}T00:00:00Z`);
  yesterdayDate.setUTCDate(yesterdayDate.getUTCDate() - 1);
  const yesterday = yesterdayDate.toISOString().slice(0, 10);

  for (const order of orders) {
    const date = new Date(order.created_at);
    const key = Number.isNaN(date.getTime()) ? "unknown" : romeDateKey(date);
    let group = groups.get(key);
    if (!group) {
      const dateLabel = Number.isNaN(date.getTime())
        ? "Data non disponibile"
        : new Intl.DateTimeFormat("it-IT", {
            timeZone: "Europe/Rome",
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          }).format(date);
      const relativeLabel = key === today ? "Oggi" : key === yesterday ? "Ieri" : null;
      group = {
        key,
        label: relativeLabel ? `${relativeLabel} · ${dateLabel}` : dateLabel,
        orders: [],
      };
      groups.set(key, group);
    }
    group.orders.push(order);
  }

  return [...groups.values()];
}

function asIdList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((id): id is string => typeof id === "string" && id.length > 0);
}

export function isUnseenAdminOrder(status: string, id: string, seen: Set<string>) {
  if (status === "pending_payment") return false;
  return !seen.has(id);
}

export async function getSeenAdminOrderIds(): Promise<Set<string>> {
  const admin = createAdminClient();
  const { data } = await admin.from("halo_settings").select("value").eq("key", SEEN_KEY).maybeSingle();
  if (data?.value != null) return new Set(asIdList(data.value));

  const { data: orders } = await admin.from("halo_orders").select("id");
  const ids = (orders ?? []).map((row) => row.id as string);
  await admin.from("halo_settings").upsert(
    { key: SEEN_KEY, value: ids, updated_at: new Date().toISOString() },
    { onConflict: "key" },
  );
  return new Set(ids);
}

export async function markAdminOrderSeen(id: string) {
  const seen = await getSeenAdminOrderIds();
  if (seen.has(id)) return;
  seen.add(id);
  const admin = createAdminClient();
  await admin.from("halo_settings").upsert(
    { key: SEEN_KEY, value: [...seen], updated_at: new Date().toISOString() },
    { onConflict: "key" },
  );
}
