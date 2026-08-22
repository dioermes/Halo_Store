import { createAdminClient } from "@/lib/supabase";

const SEEN_KEY = "admin_seen_order_ids";

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
