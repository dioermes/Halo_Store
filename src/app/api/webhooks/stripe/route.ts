import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase";
import { getStripe } from "@/lib/stripe";
import { fulfillPaidCheckoutSession } from "@/lib/fulfill-checkout";
import { sendPaymentFailedEmail } from "@/lib/email";

export const runtime = "nodejs";

async function alreadyProcessed(admin: ReturnType<typeof createAdminClient>, id: string) {
  const { data } = await admin.from("halo_webhook_events").select("id").eq("id", id).maybeSingle();
  return Boolean(data);
}

async function loadOrder(admin: ReturnType<typeof createAdminClient>, sessionId: string, orderId?: string) {
  if (orderId) {
    const { data } = await admin
      .from("halo_orders")
      .select("*, halo_customers(*)")
      .eq("id", orderId)
      .maybeSingle();
    if (data) return data;
  }
  const { data } = await admin
    .from("halo_orders")
    .select("*, halo_customers(*)")
    .eq("stripe_session_id", sessionId)
    .maybeSingle();
  return data;
}

export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook secret missing" }, { status: 500 });

  const raw = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "No signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, signature, secret);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }

  try {
    const admin = createAdminClient();
    if (await alreadyProcessed(admin, event.id)) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      const session = event.data.object as Stripe.Checkout.Session;
      const order = await fulfillPaidCheckoutSession(session.id, session);
      if (!order) {
        return NextResponse.json({ error: "order missing" }, { status: 404 });
      }
    }

    if (event.type === "checkout.session.expired" || event.type === "checkout.session.async_payment_failed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const order = await loadOrder(admin, session.id, session.metadata?.order_id);
      if (order && order.status === "pending_payment") {
        await admin.rpc("halo_release_order_holds", { p_order_id: order.id });
        await admin
          .from("halo_orders")
          .update({ status: "cancelled", updated_at: new Date().toISOString() })
          .eq("id", order.id);
        if (order.halo_customers?.email) {
          await sendPaymentFailedEmail(order.halo_customers.email, order.halo_customers.full_name);
        }
      }
    }

    const { error: markError } = await admin.from("halo_webhook_events").insert({ id: event.id, source: "stripe" });
    if (markError && !/duplicate|unique/i.test(markError.message)) {
      console.error("[halo_webhook_events]", markError.message);
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "webhook failed";
    console.error("[stripe webhook]", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
