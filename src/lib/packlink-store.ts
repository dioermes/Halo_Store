import { createAdminClient } from "@/lib/supabase";
import {
  defaultParcel,
  isCustomerTrackingCode,
  type PacklinkOrderState,
  type PacklinkParcel,
} from "@/lib/packlink";

const SETTING_PREFIX = "packlink:";

let packlinkColumn: boolean | null = null;

function settingKey(orderId: string) {
  return `${SETTING_PREFIX}${orderId}`;
}

function asState(value: unknown): PacklinkOrderState | null {
  if (!value || typeof value !== "object") return null;
  const rec = value as Record<string, unknown>;
  if (typeof rec.reference !== "string" && !rec.parcel) return null;
  const parcel = (rec.parcel as PacklinkParcel | undefined) ?? defaultParcel;
  return {
    parcel: {
      weightKg: Number(parcel.weightKg) || defaultParcel.weightKg,
      lengthCm: Number(parcel.lengthCm) || defaultParcel.lengthCm,
      widthCm: Number(parcel.widthCm) || defaultParcel.widthCm,
      heightCm: Number(parcel.heightCm) || defaultParcel.heightCm,
    },
    serviceId: String(rec.serviceId ?? ""),
    serviceName: String(rec.serviceName ?? ""),
    carrierName: String(rec.carrierName ?? ""),
    priceEuro: Number(rec.priceEuro) || 0,
    currency: String(rec.currency ?? "EUR"),
    dropoff: Boolean(rec.dropoff),
    collectionDate: String(rec.collectionDate ?? ""),
    collectionTime: String(rec.collectionTime ?? ""),
    reference: String(rec.reference ?? ""),
    trackingCodes: Array.isArray(rec.trackingCodes)
      ? rec.trackingCodes.map((code) => String(code))
      : [],
    labels: Array.isArray(rec.labels) ? rec.labels.map((url) => String(url)) : [],
    pickupRequestedAt: rec.pickupRequestedAt ? String(rec.pickupRequestedAt) : null,
    live: Boolean(rec.live),
  };
}

async function columnExists() {
  if (packlinkColumn != null) return packlinkColumn;
  const admin = createAdminClient();
  const { error } = await admin.from("halo_orders").select("packlink").limit(1);
  packlinkColumn = !error;
  return packlinkColumn;
}

export async function loadPacklinkState(orderId: string): Promise<PacklinkOrderState | null> {
  const admin = createAdminClient();
  if (await columnExists()) {
    const { data } = await admin.from("halo_orders").select("packlink").eq("id", orderId).maybeSingle();
    const fromCol = asState(data?.packlink);
    if (fromCol) return fromCol;
  }
  const { data } = await admin.from("halo_settings").select("value").eq("key", settingKey(orderId)).maybeSingle();
  return asState(data?.value);
}

export async function savePacklinkState(orderId: string, state: PacklinkOrderState) {
  const admin = createAdminClient();
  const payload = { ...state, updatedAt: new Date().toISOString() };
  if (await columnExists()) {
    const { error } = await admin
      .from("halo_orders")
      .update({ packlink: payload, updated_at: new Date().toISOString() })
      .eq("id", orderId);
    if (error) throw new Error(error.message);
  }
  const { error } = await admin.from("halo_settings").upsert({
    key: settingKey(orderId),
    value: payload,
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);
}

export async function loadAllPacklinkStates() {
  const admin = createAdminClient();
  const { data } = await admin.from("halo_settings").select("key, value").like("key", `${SETTING_PREFIX}%`);
  const map = new Map<string, PacklinkOrderState>();
  for (const row of data ?? []) {
    const orderId = String(row.key).slice(SETTING_PREFIX.length);
    const state = asState(row.value);
    if (orderId && state) map.set(orderId, state);
  }
  if (await columnExists()) {
    const { data: orders } = await admin
      .from("halo_orders")
      .select("id, packlink")
      .not("packlink", "is", null);
    for (const order of orders ?? []) {
      const state = asState(order.packlink);
      if (state) map.set(order.id as string, state);
    }
  }
  return map;
}

export async function applyTrackingToOrder(
  orderId: string,
  carrier: string,
  trackingCodes: string[],
  packlinkReference?: string,
) {
  const admin = createAdminClient();
  const real = trackingCodes.filter((code) => isCustomerTrackingCode(code, packlinkReference));
  const { data: current } = await admin
    .from("halo_orders")
    .select("tracking_code")
    .eq("id", orderId)
    .maybeSingle();
  const existing = String(current?.tracking_code ?? "");
  const fakeExisting = existing && !isCustomerTrackingCode(existing, packlinkReference);

  const patch: Record<string, unknown> = {
    tracking_carrier: carrier || null,
    updated_at: new Date().toISOString(),
  };
  if (real[0]) patch.tracking_code = real[0];
  else if (fakeExisting) patch.tracking_code = null;

  const { error } = await admin.from("halo_orders").update(patch).eq("id", orderId);
  if (error) throw new Error(error.message);
}
