import { createAdminClient } from "@/lib/supabase";
import {
  getPacklinkShipment,
  getPacklinkTracking,
  isPacklinkLive,
  type PacklinkOrderState,
} from "@/lib/packlink";
import { applyTrackingToOrder, loadPacklinkState, savePacklinkState } from "@/lib/packlink-store";
import { sendOrderStatusEmail, statusMailNeeded } from "@/lib/email";
import type { Fulfillment, OrderStatus } from "@/lib/orders";

const rank: Partial<Record<OrderStatus, number>> = {
  pending_payment: 0,
  paid: 1,
  preparing: 2,
  shipped: 3,
  completed: 4,
};

function customerFrom(raw: unknown): { email?: string; full_name?: string | null } {
  if (Array.isArray(raw)) return raw[0] ?? {};
  if (raw && typeof raw === "object") return raw as { email?: string; full_name?: string | null };
  return {};
}

function statusCode(raw: unknown) {
  return String(raw ?? "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
}

const DELIVERED = new Set(["DELIVERED", "CONSEGNATO", "DELIVERY_COMPLETED"]);
const IN_TRANSIT = new Set([
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "PICKED_UP",
  "COLLECTED",
  "DEPARTED",
  "IN_VIAGGIO",
  "IN_CONSEGNA",
]);

function codesFromEvents(events: unknown[]) {
  const codes: string[] = [];
  for (const event of events) {
    if (!event || typeof event !== "object") continue;
    const rec = event as Record<string, unknown>;
    for (const key of ["status", "state", "code"] as const) {
      const value = statusCode(rec[key]);
      if (value) codes.push(value);
    }
  }
  return codes;
}

export function interpretPacklinkProgress(input: {
  hasLabel: boolean;
  packlinkStatus: string;
  trackingCodes: string[];
  reference: string;
  pickupRequestedAt: string | null;
  events: unknown[];
}): OrderStatus | null {
  const codes = [statusCode(input.packlinkStatus), ...codesFromEvents(input.events)];
  if (codes.some((code) => DELIVERED.has(code))) return "completed";
  if (codes.some((code) => IN_TRANSIT.has(code))) return "shipped";
  if (input.hasLabel) return "preparing";
  return null;
}

function nextStep(current: OrderStatus, desired: OrderStatus): OrderStatus | null {
  const currentRank = rank[current] ?? 0;
  const desiredRank = rank[desired] ?? 0;
  if (desiredRank <= currentRank) return null;
  if (current === "paid") return "preparing";
  if (current === "preparing") return "shipped";
  if (current === "shipped") return "completed";
  return null;
}

export async function syncPacklinkOrder(orderId: string) {
  const admin = createAdminClient();
  const { data: order } = await admin
    .from("halo_orders")
    .select("*, halo_customers(email, full_name), halo_order_items(*)")
    .eq("id", orderId)
    .maybeSingle();
  if (!order || order.fulfillment !== "shipping") return null;
  let current = order.status as OrderStatus;
  if (current === "cancelled" || current === "refunded" || current === "completed") {
    return { status: current, mailed: false, events: [] as unknown[] };
  }

  const state = await loadPacklinkState(orderId);
  if (!state?.reference) return null;

  let packlinkStatus = "";
  let trackingCodes = state.trackingCodes;
  let events: unknown[] = [];
  const live = isPacklinkLive() && !state.reference.startsWith("DEMO-") && state.live !== false;

  if (live) {
    try {
      const shipment = await getPacklinkShipment(state.reference);
      packlinkStatus = shipment.status;
      if (shipment.trackingCodes.length) trackingCodes = shipment.trackingCodes;
      if (shipment.carrier) state.carrierName = shipment.carrier || state.carrierName;
    } catch (error) {
      console.error("[packlink sync shipment]", orderId, error);
    }
    try {
      const track = await getPacklinkTracking(state.reference);
      events = Array.isArray(track.events) ? track.events : [];
    } catch {
      events = [];
    }
  }

  const nextState: PacklinkOrderState = { ...state, trackingCodes };
  if (
    nextState.trackingCodes.join() !== state.trackingCodes.join() ||
    nextState.carrierName !== state.carrierName
  ) {
    await savePacklinkState(orderId, nextState);
  }

  await applyTrackingToOrder(orderId, nextState.carrierName, trackingCodes, nextState.reference);

  const desired = interpretPacklinkProgress({
    hasLabel: Boolean(nextState.reference),
    packlinkStatus,
    trackingCodes,
    reference: nextState.reference,
    pickupRequestedAt: nextState.pickupRequestedAt,
    events,
  });
  if (!desired) return { status: current, mailed: false, state: nextState, events };

  let mailed = false;
  for (let i = 0; i < 3; i += 1) {
    const step = nextStep(current, desired);
    if (!step) break;

    const { data: fresh } = await admin
      .from("halo_orders")
      .select("tracking_code, tracking_carrier")
      .eq("id", orderId)
      .maybeSingle();

    await admin
      .from("halo_orders")
      .update({ status: step, updated_at: new Date().toISOString() })
      .eq("id", orderId);

    if (statusMailNeeded(step) && step !== "paid") {
      const items = (order.halo_order_items ?? []) as Array<{
        product_name: string;
        size: string;
        color: string;
        quantity: number;
        unit_price_cents: number;
      }>;
      const customer = customerFrom(order.halo_customers);
      const mail = await sendOrderStatusEmail({
        id: order.id,
        email: customer.email ?? "",
        name: customer.full_name ?? order.shipping_name,
        status: step,
        fulfillment: order.fulfillment as Fulfillment,
        totalCents: order.total_cents,
        shippingCents: order.shipping_cents,
        trackingCode: fresh?.tracking_code ?? null,
        trackingCarrier: fresh?.tracking_carrier ?? nextState.carrierName,
        items: items.map((item) => ({
          name: item.product_name,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          unitPriceCents: item.unit_price_cents,
        })),
      });
      mailed = mail.ok || mailed;
      if (!mail.ok) console.error("[packlink status email]", step, orderId, mail.reason);
    }
    current = step;
  }

  return { status: current, mailed, state: nextState, events };
}

export async function syncOpenPacklinkOrders() {
  const admin = createAdminClient();
  const { data: orders } = await admin
    .from("halo_orders")
    .select("id")
    .eq("fulfillment", "shipping")
    .in("status", ["paid", "preparing", "shipped"])
    .limit(80);
  const results = [];
  for (const order of orders ?? []) {
    try {
      results.push({ id: order.id, ...(await syncPacklinkOrder(order.id)) });
    } catch (error) {
      console.error("[packlink cron]", order.id, error);
      results.push({ id: order.id, error: error instanceof Error ? error.message : "errore" });
    }
  }
  return results;
}
