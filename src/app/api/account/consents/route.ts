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
  const { error } = await admin.from("halo_consents").upsert({
    customer_id: customer.id,
    email_marketing: Boolean(body.email_marketing),
    email_marketing_at: body.email_marketing ? new Date().toISOString() : null,
    cookie_analytics: Boolean(body.cookie_analytics),
    cookie_marketing: Boolean(body.cookie_marketing),
    source: "account",
    updated_at: new Date().toISOString(),
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
