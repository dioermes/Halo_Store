import { NextResponse } from "next/server";
import { requirePacklinkOwner, packlinkApiError } from "@/lib/packlink-api";
import { isPacklinkLive } from "@/lib/packlink";
import { loadPacklinkState } from "@/lib/packlink-store";
import { syncPacklinkOrder } from "@/lib/packlink-order-sync";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    await requirePacklinkOwner();
    const orderId = new URL(req.url).searchParams.get("orderId") ?? "";
    const state = await loadPacklinkState(orderId);
    if (!state?.reference) {
      return NextResponse.json({ error: "Spedizione non ancora creata." }, { status: 404 });
    }
    const synced = await syncPacklinkOrder(orderId);
    const next = synced?.state ?? state;
    if (!isPacklinkLive() || state.reference.startsWith("DEMO-")) {
      return NextResponse.json({
        live: false,
        state: next,
        orderStatus: synced?.status,
        events: state.pickupRequestedAt
          ? [{ description: "Ritiro richiesto (prova). Il tracking live arriva dopo la scansione del corriere." }]
          : [{ description: "Etichetta di prova creata. Il tracking comparirà dopo «Richiedi corriere»." }],
      });
    }
    return NextResponse.json({
      live: true,
      state: next,
      orderStatus: synced?.status,
      events: synced?.events ?? [],
    });
  } catch (error) {
    return packlinkApiError(error);
  }
}
