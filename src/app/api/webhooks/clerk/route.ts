import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest, NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/email";
import { createAdminClient, isAdminConfigured } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  if (!process.env.CLERK_WEBHOOK_SIGNING_SECRET) {
    return NextResponse.json({ error: "Webhook non configurato" }, { status: 500 });
  }

  let evt;
  try {
    evt = await verifyWebhook(req);
  } catch (error) {
    console.error("Clerk webhook verification failed", error);
    return new Response("Verification failed", { status: 400 });
  }

  if (!isAdminConfigured()) {
    return NextResponse.json({ skipped: true });
  }

  const admin = createAdminClient();

  if (evt.type === "user.created" || evt.type === "user.updated") {
    const email = evt.data.email_addresses?.[0]?.email_address ?? "";
    const fullName = [evt.data.first_name, evt.data.last_name].filter(Boolean).join(" ").trim();
    const { data: customer } = await admin
      .from("halo_customers")
      .upsert(
        {
          clerk_id: evt.data.id,
          email,
          full_name: fullName || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "clerk_id" },
      )
      .select("id")
      .single();
    if (customer && evt.type === "user.created") {
      await admin.from("halo_consents").upsert(
        { customer_id: customer.id, source: "clerk_user.created" },
        { onConflict: "customer_id", ignoreDuplicates: true },
      );
      if (email) {
        await sendWelcomeEmail(email, fullName || null);
      }
    }
  }

  if (evt.type === "user.deleted" && evt.data.id) {
    await admin.from("halo_customers").delete().eq("clerk_id", evt.data.id);
  }

  return NextResponse.json({ ok: true });
}
