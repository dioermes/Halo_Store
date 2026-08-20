import { NextResponse } from "next/server";
import { createHmac } from "node:crypto";
import { createAdminClient, isAdminConfigured } from "@/lib/supabase";

function tokenFor(email: string) {
  const secret = process.env.CLERK_SECRET_KEY || "halo-unsub";
  return createHmac("sha256", secret).update(email.toLowerCase()).digest("hex").slice(0, 24);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = url.searchParams.get("email") ?? "";
  const token = url.searchParams.get("token") ?? "";
  if (!email || token !== tokenFor(email)) {
    return NextResponse.json({ error: "Link non valido" }, { status: 400 });
  }
  if (!isAdminConfigured()) return NextResponse.json({ ok: true });
  const admin = createAdminClient();
  const { data: customer } = await admin
    .from("halo_customers")
    .select("id")
    .eq("email", email)
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
  return new NextResponse("Iscrizione newsletter disattivata. Puoi chiudere questa pagina.", {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
