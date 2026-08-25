import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { requirePacklinkOwner, packlinkApiError } from "@/lib/packlink-api";
import { getPacklinkQuotes, isPacklinkLive, parseParcel } from "@/lib/packlink";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    await requirePacklinkOwner();
    const body = (await req.json()) as {
      orderId?: string;
      toZip?: string;
      toCountry?: string;
      weightKg?: number;
      lengthCm?: number;
      widthCm?: number;
      heightCm?: number;
    };
    const parcel = parseParcel(body);
    let toZip = (body.toZip ?? "").replace(/\s/g, "");
    let toCountry = (body.toCountry ?? "IT").toUpperCase();
    if (body.orderId) {
      const admin = createAdminClient();
      const { data: order } = await admin
        .from("halo_orders")
        .select("fulfillment, shipping_postal_code, shipping_country")
        .eq("id", body.orderId)
        .maybeSingle();
      if (!order) return NextResponse.json({ error: "Ordine non trovato." }, { status: 404 });
      if (order.fulfillment !== "shipping") {
        return NextResponse.json({ error: "Packlink serve solo gli ordini da spedire." }, { status: 400 });
      }
      toZip = String(order.shipping_postal_code ?? toZip).replace(/\s/g, "");
      toCountry = String(order.shipping_country ?? (toCountry || "IT")).toUpperCase();
    }
    const result = await getPacklinkQuotes({ toCountry, toZip, parcel });
    return NextResponse.json({
      live: result.live,
      configured: isPacklinkLive(),
      quotes: result.quotes,
    });
  } catch (error) {
    return packlinkApiError(error);
  }
}
