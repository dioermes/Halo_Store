import { NextResponse } from "next/server";
import { requirePacklinkOwner, packlinkApiError } from "@/lib/packlink-api";
import { getPacklinkShipment, isPacklinkLive, pickupGroupKey } from "@/lib/packlink";
import { applyTrackingToOrder, loadPacklinkState, savePacklinkState } from "@/lib/packlink-store";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    await requirePacklinkOwner();
    const body = (await req.json()) as { orderIds?: string[] };
    const orderIds = [...new Set((body.orderIds ?? []).map((id) => String(id)).filter(Boolean))];
    if (!orderIds.length) {
      return NextResponse.json({ error: "Seleziona almeno un pacco." }, { status: 400 });
    }

    const states = [];
    for (const orderId of orderIds) {
      const state = await loadPacklinkState(orderId);
      if (!state?.reference) {
        return NextResponse.json({ error: "Uno dei pacchi non ha ancora la spedizione Packlink." }, { status: 400 });
      }
      if (state.dropoff) {
        return NextResponse.json({
          error: `${state.carrierName} è un servizio da portare al punto: non si richiede il furgone.`,
        }, { status: 400 });
      }
      if (state.pickupRequestedAt) {
        return NextResponse.json({ error: "Uno dei pacchi ha già il ritiro richiesto." }, { status: 400 });
      }
      states.push({ orderId, state });
    }

    const keys = new Set(states.map((row) => pickupGroupKey(row.state)));
    if (keys.size > 1) {
      return NextResponse.json({
        error: "Il ritiro va chiesto per un solo corriere alla volta. GLS e BRT, ad esempio, sono due passaggi.",
      }, { status: 400 });
    }

    const now = new Date().toISOString();
    const live = isPacklinkLive();
    const updated = [];
    for (const row of states) {
      let trackingCodes = row.state.trackingCodes;
      if (live && row.state.reference && !row.state.reference.startsWith("DEMO-")) {
        const shipment = await getPacklinkShipment(row.state.reference);
        trackingCodes = shipment.trackingCodes.length ? shipment.trackingCodes : trackingCodes;
      }
      const next = { ...row.state, pickupRequestedAt: now, trackingCodes };
      await savePacklinkState(row.orderId, next);
      await applyTrackingToOrder(row.orderId, next.carrierName, trackingCodes, next.reference);
      updated.push({ orderId: row.orderId, state: next });
    }

    return NextResponse.json({
      live,
      carrierName: states[0].state.carrierName,
      count: updated.length,
      note: live
        ? "Ritiro registrato. Completa eventuale pagamento/attivazione anche in Packlink PRO se il corriere lo chiede; il tracking live spesso arriva dopo la scansione."
        : "In prova il ritiro è solo registrato qui. Con la chiave API i pacchi compariranno anche nel pannello Packlink PRO.",
      orders: updated,
    });
  } catch (error) {
    return packlinkApiError(error);
  }
}
