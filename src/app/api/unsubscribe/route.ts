import { NextResponse } from "next/server";
import { createAdminClient, isAdminConfigured } from "@/lib/supabase";
import { unsubscribeToken } from "@/lib/unsubscribe";
import { normalizeEmail } from "@/lib/promo";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = url.searchParams.get("email") ?? "";
  const token = url.searchParams.get("token") ?? "";
  if (!email || token !== unsubscribeToken(email)) {
    return NextResponse.json({ error: "Link non valido" }, { status: 400 });
  }
  if (!isAdminConfigured()) return NextResponse.json({ ok: true });
  const admin = createAdminClient();
  const normalized = normalizeEmail(email);
  const { data: customer } = await admin
    .from("halo_customers")
    .select("id")
    .ilike("email", normalized)
    .maybeSingle();
  if (customer) {
    await admin
      .from("halo_consents")
      .update({
        email_marketing: false,
        email_marketing_at: null,
        updated_at: new Date().toISOString(),
        source: "unsubscribe",
      })
      .eq("customer_id", customer.id);
  }
  await admin
    .from("halo_subscribers")
    .update({
      marketing_opt_in: false,
      updated_at: new Date().toISOString(),
    })
    .eq("email", normalized);
  return new NextResponse("Iscrizione newsletter disattivata. Puoi chiudere questa pagina.", {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
