import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";
import { customerEmail } from "@/lib/auth";

export async function POST(req: Request) {
  const body = (await req.json()) as { variantId?: string; email?: string };
  if (!body.variantId) return NextResponse.json({ error: "variant" }, { status: 400 });
  const user = await currentUser();
  const email = body.email?.trim() || (user ? customerEmail(user) : "");
  if (!email) return NextResponse.json({ error: "email" }, { status: 400 });
  const admin = createAdminClient();
  const { error } = await admin.from("halo_stock_alerts").upsert({
    email,
    variant_id: body.variantId,
    clerk_id: user?.id ?? null,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
