import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { requirePacklinkOwner, packlinkApiError } from "@/lib/packlink-api";
import {
  createPacklinkShipment,
  getPacklinkQuotes,
  parseParcel,
  type PacklinkOrderState,
} from "@/lib/packlink";
import { loadPacklinkState, savePacklinkState } from "@/lib/packlink-store";
import { syncPacklinkOrder } from "@/lib/packlink-order-sync";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    await requirePacklinkOwner();
    const body = (await req.json()) as {
      orderId?: string;
      serviceId?: string;
      collectionDate?: string;
      collectionTime?: string;
      weightKg?: number;
      lengthCm?: number;
      widthCm?: number;
      heightCm?: number;
    };
    const orderId = String(body.orderId ?? "");
    const serviceId = String(body.serviceId ?? "");
    if (!orderId || !serviceId) {
      return NextResponse.json({ error: "Scegli un corriere." }, { status: 400 });
    }

    const existing = await loadPacklinkState(orderId);
    if (existing?.reference) {
      return NextResponse.json({ error: "Questa spedizione è già stata creata.", state: existing }, { status: 409 });
    }

    const admin = createAdminClient();
    const { data: order } = await admin
      .from("halo_orders")
      .select("*, halo_customers(email), halo_order_items(product_name, quantity)")
      .eq("id", orderId)
      .maybeSingle();
    if (!order) return NextResponse.json({ error: "Ordine non trovato." }, { status: 404 });
    if (order.fulfillment !== "shipping") {
      return NextResponse.json({ error: "Packlink serve solo gli ordini da spedire." }, { status: 400 });
    }
    if (!order.shipping_line1 || !order.shipping_postal_code || !order.shipping_city) {
      return NextResponse.json({ error: "Manca l’indirizzo di consegna su questo ordine." }, { status: 400 });
    }

    const parcel = parseParcel(body);
    const { live, quotes } = await getPacklinkQuotes({
      toCountry: order.shipping_country || "IT",
      toZip: order.shipping_postal_code,
      parcel,
    });
    const quote = quotes.find((item) => item.id === serviceId);
    if (!quote) return NextResponse.json({ error: "Quel corriere non è più disponibile. Ricarica i prezzi." }, { status: 400 });

    const collectionDate = body.collectionDate || quote.availableDates[0]?.date;
    const collectionTime = body.collectionTime || quote.availableDates[0]?.window || "09:00-18:00";
    if (!collectionDate) return NextResponse.json({ error: "Scegli una data di ritiro." }, { status: 400 });

    const items = (order.halo_order_items ?? []) as Array<{ product_name: string; quantity: number }>;
    const content = items.map((item) => `${item.product_name} x${item.quantity}`).join(", ") || "Abbigliamento";
    const customer = order.halo_customers as { email?: string } | { email?: string }[] | null;
    const email = Array.isArray(customer) ? customer[0]?.email : customer?.email;

    const created = await createPacklinkShipment({
      quote,
      parcel,
      collectionDate,
      collectionTime,
      content,
      contentValueEuro: Number(order.subtotal_cents ?? order.total_cents ?? 0) / 100,
      customReference: orderId.replace(/-/g, "").slice(0, 20),
      to: {
        name: order.shipping_name || "Cliente Halo",
        phone: order.shipping_phone,
        email: email ?? null,
        street1: order.shipping_line1,
        street2: order.shipping_line2,
        zip: order.shipping_postal_code,
        city: order.shipping_city,
        country: order.shipping_country,
      },
    });

    const state: PacklinkOrderState = {
      parcel,
      serviceId: quote.id,
      serviceName: quote.name,
      carrierName: quote.carrierName,
      priceEuro: quote.priceEuro,
      currency: quote.currency,
      dropoff: quote.dropoff,
      collectionDate,
      collectionTime,
      reference: created.shipment.reference,
      trackingCodes: created.shipment.trackingCodes,
      labels: created.shipment.labels,
      pickupRequestedAt: null,
      live,
    };
    await savePacklinkState(orderId, state);
    const synced = await syncPacklinkOrder(orderId);

    return NextResponse.json({ live, state: synced?.state ?? state, orderStatus: synced?.status });
  } catch (error) {
    return packlinkApiError(error);
  }
}
