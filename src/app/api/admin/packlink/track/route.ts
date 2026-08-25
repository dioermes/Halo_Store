import { NextResponse } from "next/server";
import { requirePacklinkOwner, packlinkApiError } from "@/lib/packlink-api";
import { getPacklinkShipment, getPacklinkTracking, isPacklinkLive } from "@/lib/packlink";
import { applyTrackingToOrder, loadPacklinkState, savePacklinkState } from "@/lib/packlink-store";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    await requirePacklinkOwner();
    const orderId = new URL(req.url).searchParams.get("orderId") ?? "";
    const state = await loadPacklinkState(orderId);
    if (!state?.reference) {
      return NextResponse.json({ error: "Spedizione non ancora creata." }, { status: 404 });
    }
    if (!isPacklinkLive() || state.reference.startsWith("DEMO-")) {
      return NextResponse.json({
        live: false,
        state,
        events: state.pickupRequestedAt
          ? [{ description: "Ritiro richiesto (prova). Il tracking live arriva dopo la scansione del corriere." }]
          : [{ description: "Etichetta di prova creata. Il tracking comparirà dopo «Richiedi corriere»." }],
      });
    }
    const shipment = await getPacklinkShipment(state.reference);
    let events: unknown[] = [];
    try {
      const track = await getPacklinkTracking(state.reference);
      events = Array.isArray(track.events) ? track.events : [];
    } catch {
      events = [];
    }
    const next = {
      ...state,
      trackingCodes: shipment.trackingCodes.length ? shipment.trackingCodes : state.trackingCodes,
    };
    if (next.trackingCodes.join() !== state.trackingCodes.join()) {
      await savePacklinkState(orderId, next);
      await applyTrackingToOrder(orderId, next.carrierName, next.trackingCodes, next.reference);
    }
    return NextResponse.json({ live: true, state: next, events });
  } catch (error) {
    return packlinkApiError(error);
  }
}
