import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { createAdminClient, isAdminConfigured } from "@/lib/supabase";
import { customerEmail } from "@/lib/auth";
import { isValidEmail, normalizeEmail } from "@/lib/promo";

export async function POST(req: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }

  const body = (await req.json()) as { variantId?: string; email?: string };
  const variantId = body.variantId?.trim();
  if (!variantId) return NextResponse.json({ error: "variant" }, { status: 400 });

  const user = await currentUser();
  const email = normalizeEmail(body.email?.trim() || (user ? customerEmail(user) : "") || "");
  if (!isValidEmail(email)) return NextResponse.json({ error: "email" }, { status: 400 });

  const admin = createAdminClient();
  const { data: variant, error: variantError } = await admin
    .from("halo_variants")
    .select("id, stock")
    .eq("id", variantId)
    .maybeSingle();
  if (variantError || !variant) {
    return NextResponse.json({ error: "variant" }, { status: 400 });
  }
  if ((variant.stock ?? 0) > 0) {
    return NextResponse.json({ error: "available" }, { status: 409 });
  }

  const { error } = await admin.from("halo_stock_alerts").upsert(
    {
      email,
      variant_id: variantId,
      clerk_id: user?.id ?? null,
    },
    { onConflict: "email,variant_id" },
  );
  if (error) {
    console.error("[stock-alert]", error.message);
    return NextResponse.json({ error: "unavailable" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
