import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { sendOrderPaidEmail, sendOwnerNewOrderEmail } from "@/lib/email";
import { notifyOwnerNewOrder } from "@/lib/whatsapp";
import { releasePromoForOrder } from "@/lib/promo";

export type FulfilledOrder = {
  id: string;
  customerId: string;
  status: string;
  fulfillment: string;
  totalCents: number;
  shippingCents: number;
  items: Array<{
    name: string;
    size: string;
    color: string;
    quantity: number;
    unitPriceCents: number;
    imageUrl: string | null;
  }>;
};

type OrderRow = {
  id: string;
  status: string;
  fulfillment: string;
  total_cents: number;
  shipping_cents: number;
  customer_id: string;
  shipping_name: string | null;
  shipping_line1: string | null;
  shipping_line2: string | null;
  shipping_city: string | null;
  shipping_postal_code: string | null;
  shipping_country: string | null;
  halo_customers: { email: string; full_name: string | null } | null;
  halo_order_items: Array<{
    product_name: string;
    size: string;
    color: string;
    quantity: number;
    unit_price_cents: number;
    image_url: string | null;
  }>;
};

function toPayload(order: OrderRow): FulfilledOrder {
  return {
    id: order.id,
    customerId: order.customer_id,
    status: order.status,
    fulfillment: order.fulfillment,
    totalCents: order.total_cents,
    shippingCents: order.shipping_cents,
    items: (order.halo_order_items ?? []).map((item) => ({
      name: item.product_name,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      unitPriceCents: item.unit_price_cents,
      imageUrl: item.image_url,
    })),
  };
}

async function loadOrder(admin: ReturnType<typeof createAdminClient>, sessionId: string, orderId?: string) {
  if (orderId) {
    const { data } = await admin
      .from("halo_orders")
      .select("*, halo_customers(*), halo_order_items(*)")
      .eq("id", orderId)
      .maybeSingle();
    if (data) return data as OrderRow;
  }
  const { data } = await admin
    .from("halo_orders")
    .select("*, halo_customers(*), halo_order_items(*)")
    .eq("stripe_session_id", sessionId)
    .maybeSingle();
  return (data as OrderRow | null) ?? null;
}

type SessionShipping = {
  name?: string | null;
  address?: {
    line1?: string | null;
    line2?: string | null;
    city?: string | null;
    postal_code?: string | null;
    country?: string | null;
  } | null;
};

function shippingFromSession(session: Stripe.Checkout.Session): SessionShipping {
  const extra = session as Stripe.Checkout.Session & {
    collected_information?: { shipping_details?: SessionShipping | null };
    shipping_details?: SessionShipping | null;
  };
  return extra.collected_information?.shipping_details ?? extra.shipping_details ?? {};
}

export async function fulfillPaidCheckoutSession(
  sessionId: string,
  existing?: Stripe.Checkout.Session,
): Promise<FulfilledOrder | null> {
  const admin = createAdminClient();
  const session = existing ?? (await getStripe().checkout.sessions.retrieve(sessionId));
  const order = await loadOrder(admin, session.id, session.metadata?.order_id);
  if (!order) return null;

  const paid = session.payment_status === "paid" || session.status === "complete";
  if (paid && order.status === "pending_payment") {
    const { error: holdError } = await admin.rpc("halo_confirm_holds", { p_order_id: order.id });
    if (holdError) {
      console.error("[halo_confirm_holds]", holdError.message);
      throw new Error(`Stock non scalato dopo il pagamento: ${holdError.message}`);
    }
    const shipping = shippingFromSession(session);
    const address = shipping.address;
    const { data: updated } = await admin
      .from("halo_orders")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        stripe_session_id: session.id,
        stripe_payment_intent:
          typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id,
        shipping_name: shipping.name ?? order.shipping_name,
        shipping_line1: address?.line1 ?? order.shipping_line1,
        shipping_line2: address?.line2 ?? order.shipping_line2,
        shipping_city: address?.city ?? order.shipping_city,
        shipping_postal_code: address?.postal_code ?? order.shipping_postal_code,
        shipping_country: address?.country ?? order.shipping_country,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id)
      .eq("status", "pending_payment")
      .select("id");

    if (!updated?.length) {
      const { data: current } = await admin
        .from("halo_orders")
        .select("*, halo_customers(*), halo_order_items(*)")
        .eq("id", order.id)
        .single();
      return current ? toPayload(current as OrderRow) : toPayload({ ...order, status: "paid" });
    }

    await admin.from("halo_cart_items").delete().eq("clerk_id", session.metadata?.clerk_id ?? "");

    const email = {
      id: order.id,
      email: order.halo_customers?.email ?? session.customer_details?.email ?? "",
      name: order.halo_customers?.full_name,
      status: "paid" as const,
      fulfillment: order.fulfillment as "pickup" | "shipping",
      totalCents: order.total_cents,
      shippingCents: order.shipping_cents,
      items: (order.halo_order_items ?? []).map((item) => ({
        name: item.product_name,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        unitPriceCents: item.unit_price_cents,
      })),
    };
    try {
      await sendOrderPaidEmail(email);
      await sendOwnerNewOrderEmail(email);
      notifyOwnerNewOrder(order);
    } catch (error) {
      console.error("[order notify]", error);
    }

    return { ...toPayload(order), status: "paid" };
  }

  return toPayload(order);
}

/** Completa i pagamenti già andati a buon fine; libera le prenotazioni dei checkout abbandonati. */
export async function settleCustomerPendingPayments(customerId: string): Promise<FulfilledOrder | null> {
  const admin = createAdminClient();
  const { data: pending } = await admin
    .from("halo_orders")
    .select("id, stripe_session_id")
    .eq("customer_id", customerId)
    .eq("status", "pending_payment");

  let paid: FulfilledOrder | null = null;

  for (const row of pending ?? []) {
    if (row.stripe_session_id && isStripeConfigured()) {
      try {
        const fulfilled = await fulfillPaidCheckoutSession(row.stripe_session_id);
        if (fulfilled && fulfilled.status !== "pending_payment") {
          paid = fulfilled;
          continue;
        }
        const session = await getStripe().checkout.sessions.retrieve(row.stripe_session_id);
        if (session.status === "open") {
          await getStripe().checkout.sessions.expire(row.stripe_session_id);
        }
      } catch (error) {
        console.error("[settle pending checkout]", row.id, error);
        continue;
      }
    }

    const { error: releaseError } = await admin.rpc("halo_release_order_holds", {
      p_order_id: row.id,
    });
    if (releaseError) console.error("[halo_release_order_holds]", releaseError.message);
    await releasePromoForOrder(row.id);

    await admin
      .from("halo_orders")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("id", row.id)
      .eq("status", "pending_payment");
  }

  return paid;
}
