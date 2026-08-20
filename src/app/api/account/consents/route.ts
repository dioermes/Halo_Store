import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";
import { ensureCustomer } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const body = (await req.json()) as {
    email_marketing?: boolean;
    cookie_analytics?: boolean;
    cookie_marketing?: boolean;
  };
  const admin = createAdminClient();
  const customer = await ensureCustomer(user);

  const row: Record<string, unknown> = {
    customer_id: customer.id,
    source: "account",
    updated_at: new Date().toISOString(),
  };
  if (typeof body.email_marketing === "boolean") {
    row.email_marketing = body.email_marketing;
    row.email_marketing_at = body.email_marketing ? new Date().toISOString() : null;
  }
  if (typeof body.cookie_analytics === "boolean") {
    row.cookie_analytics = body.cookie_analytics;
  }
  if (typeof body.cookie_marketing === "boolean") {
    row.cookie_marketing = body.cookie_marketing;
  }

  const { error } = await admin.from("halo_consents").upsert(row, {
    onConflict: "customer_id",
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
