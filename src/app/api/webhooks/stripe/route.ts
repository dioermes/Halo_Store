import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase";
import { getStripe } from "@/lib/stripe";
import {
  sendOrderPaidEmail,
  sendOwnerNewOrderEmail,
  sendPaymentFailedEmail,
} from "@/lib/email";
import { notifyOwnerNewOrder } from "@/lib/whatsapp";

export const runtime = "nodejs";

async function alreadyProcessed(admin: ReturnType<typeof createAdminClient>, id: string) {
  const { data } = await admin.from("halo_webhook_events").select("id").eq("id", id).maybeSingle();
  return Boolean(data);
}

async function markProcessed(admin: ReturnType<typeof createAdminClient>, id: string) {
  await admin.from("halo_webhook_events").insert({ id, source: "stripe" });
}

async function loadOrder(admin: ReturnType<typeof createAdminClient>, sessionId: string, orderId?: string) {
  if (orderId) {
    const { data } = await admin
      .from("halo_orders")
      .select("*, halo_customers(*), halo_order_items(*)")
      .eq("id", orderId)
      .maybeSingle();
    if (data) return data;
  }
  const { data } = await admin
    .from("halo_orders")
    .select("*, halo_customers(*), halo_order_items(*)")
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

  const admin = createAdminClient();
  if (await alreadyProcessed(admin, event.id)) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object as Stripe.Checkout.Session;
    const order = await loadOrder(admin, session.id, session.metadata?.order_id);
    if (!order) {
      return NextResponse.json({ error: "order missing" }, { status: 404 });
    }
    if (order.status === "pending_payment") {
      await admin.rpc("halo_confirm_holds", { p_order_id: order.id });
      const shipping =
        (session as { collected_information?: { shipping_details?: { name?: string | null; address?: { line1?: string | null; line2?: string | null; city?: string | null; postal_code?: string | null; country?: string | null } } } }).collected_information?.shipping_details ??
        (session as { shipping_details?: { name?: string | null; address?: { line1?: string | null; line2?: string | null; city?: string | null; postal_code?: string | null; country?: string | null } } }).shipping_details;
      const address = shipping?.address;
      const name = shipping?.name;
      await admin
        .from("halo_orders")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
          stripe_payment_intent:
            typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id,
          shipping_name: name ?? order.shipping_name,
          shipping_line1: address?.line1 ?? order.shipping_line1,
          shipping_line2: address?.line2 ?? order.shipping_line2,
          shipping_city: address?.city ?? order.shipping_city,
          shipping_postal_code: address?.postal_code ?? order.shipping_postal_code,
          shipping_country: address?.country ?? order.shipping_country,
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      await admin.from("halo_cart_items").delete().eq("clerk_id", session.metadata?.clerk_id ?? "");

      const payload = {
        id: order.id,
        email: order.halo_customers?.email ?? session.customer_details?.email ?? "",
        name: order.halo_customers?.full_name,
        status: "paid" as const,
        fulfillment: order.fulfillment,
        totalCents: order.total_cents,
        shippingCents: order.shipping_cents,
        items: order.halo_order_items.map((item: { product_name: string; size: string; color: string; quantity: number; unit_price_cents: number }) => ({
          name: item.product_name,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          unitPriceCents: item.unit_price_cents,
        })),
      };
      await sendOrderPaidEmail(payload);
      await sendOwnerNewOrderEmail(payload);
      await notifyOwnerNewOrder(order);
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

  await markProcessed(admin, event.id);
  return NextResponse.json({ received: true });
}
