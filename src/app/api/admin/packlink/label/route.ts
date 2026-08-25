import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { requirePacklinkOwner, packlinkApiError } from "@/lib/packlink-api";
import { getPacklinkApiKey } from "@/lib/packlink";
import { packlinkLabelHtml } from "@/lib/packlink-label";
import { loadPacklinkState } from "@/lib/packlink-store";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    await requirePacklinkOwner();
    const orderId = new URL(req.url).searchParams.get("orderId") ?? "";
    if (!orderId) return NextResponse.json({ error: "Ordine mancante." }, { status: 400 });
    const state = await loadPacklinkState(orderId);
    if (!state?.reference) {
      return NextResponse.json({ error: "Non c’è ancora un’etichetta per questo ordine." }, { status: 404 });
    }

    const remote = state.labels.find((url) => url.startsWith("http"));
    if (remote) {
      const apiKey = getPacklinkApiKey();
      const res = await fetch(remote, {
        headers: apiKey ? { Authorization: apiKey } : undefined,
        cache: "no-store",
      });
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        const type = res.headers.get("content-type") || "application/pdf";
        return new NextResponse(new Uint8Array(buf), {
          headers: {
            "Content-Type": type,
            "Content-Disposition": `inline; filename="etichetta-${state.reference}.pdf"`,
          },
        });
      }
    }

    const admin = createAdminClient();
    const { data: order } = await admin
      .from("halo_orders")
      .select("shipping_name, shipping_line1, shipping_postal_code, shipping_city, shipping_phone")
      .eq("id", orderId)
      .maybeSingle();
    const html = packlinkLabelHtml({
      orderId,
      customerName: order?.shipping_name || "Cliente",
      street: order?.shipping_line1 || "",
      cityLine: `${order?.shipping_postal_code ?? ""} ${order?.shipping_city ?? ""}`.trim(),
      phone: order?.shipping_phone,
      state,
    });
    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (error) {
    return packlinkApiError(error);
  }
}
