import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";
import { ensureCustomer } from "@/lib/auth";
import { getPublishedProducts } from "@/lib/catalog";
import { findVariant, productImageForColor } from "@/lib/products";
import { getStoreSettings } from "@/lib/settings";
import { getStripe, integrationIdentifier, isStripeConfigured, siteUrl } from "@/lib/stripe";
import type { Fulfillment } from "@/lib/orders";
import { formatPickupSlot, isPickupWithinHours } from "@/lib/opening-hours";
import { sendOwnerNewOrderEmail, sendPickupReservedEmail } from "@/lib/email";
import { notifyOwnerNewOrder } from "@/lib/whatsapp";

type CartPayload = {
  productId: string;
  variantId?: string;
  size: string;
  color: string;
  quantity: number;
};

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Accedi per confermare l'ordine." }, { status: 401 });

  const body = (await req.json()) as {
    items: CartPayload[];
    fulfillment: Fulfillment;
    note?: string;
    phone?: string;
    pickupAt?: string;
    pickupName?: string;
    shipping?: {
      name: string;
      line1: string;
      city: string;
      postalCode: string;
      province: string;
    };
  };

  if (!body.items?.length) {
    return NextResponse.json({ error: "Il carrello è vuoto." }, { status: 400 });
  }
  if (body.fulfillment !== "pickup" && body.fulfillment !== "shipping") {
    return NextResponse.json({ error: "Scegli ritiro o spedizione." }, { status: 400 });
  }
  if (body.fulfillment === "pickup") {
    if (!body.pickupName?.trim() || !body.phone?.trim() || !body.pickupAt) {
      return NextResponse.json(
        { error: "Per il ritiro servono nome, telefono e orario." },
        { status: 400 },
      );
    }
    if (!isPickupWithinHours(body.pickupAt, 48)) {
      return NextResponse.json(
        { error: "Scegli un orario di ritiro entro 48 ore, negli orari di apertura." },
        { status: 400 },
      );
    }
  } else if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Pagamenti non ancora collegati. Manca la chiave Stripe." },
      { status: 503 },
    );
  }

  const products = await getPublishedProducts();
  const settings = await getStoreSettings();
  const admin = createAdminClient();
  const customer = await ensureCustomer(user);

  const lines: Array<{
    variantId: string;
    productName: string;
    size: string;
    color: string;
    image?: string;
    quantity: number;
    unitPriceCents: number;
  }> = [];

  for (const item of body.items) {
    const product = products.find((row) => row.id === item.productId);
    if (!product) {
      return NextResponse.json({ error: `Capo non trovato: ${item.productId}` }, { status: 400 });
    }
    const variant =
      (item.variantId
        ? product.variants?.find((row) => row.id === item.variantId)
        : findVariant(product, item.size, item.color)) ?? null;
    if (!variant) {
      return NextResponse.json(
        { error: `${product.name}: combinazione taglia/colore non valida.` },
        { status: 400 },
      );
    }
    if (variant.stock < item.quantity) {
      return NextResponse.json(
        { error: `${product.name} ${item.size} ${item.color} non ha scorte sufficienti.` },
        { status: 409 },
      );
    }
    lines.push({
      variantId: variant.id,
      productName: `${product.name} · ${product.subtitle}`,
      size: item.size,
      color: item.color,
      image: productImageForColor(product, item.color),
      quantity: item.quantity,
      unitPriceCents: Math.round(product.price * 100),
    });
  }

  const subtotal = lines.reduce((sum, line) => sum + line.unitPriceCents * line.quantity, 0);
  const shippingCents = body.fulfillment === "shipping" ? settings.shippingItalyCents : 0;
  const total = subtotal + shippingCents;

  const pickupNote =
    body.fulfillment === "pickup" && body.pickupAt
      ? `Ritiro prenotato: ${formatPickupSlot(body.pickupAt)}`
      : "";
  const customerNote = [pickupNote, body.note?.trim()].filter(Boolean).join("\n") || null;

  const { data: order, error: orderError } = await admin
    .from("halo_orders")
    .insert({
      customer_id: customer.id,
      status: body.fulfillment === "pickup" ? "preparing" : "pending_payment",
      fulfillment: body.fulfillment,
      subtotal_cents: subtotal,
      shipping_cents: shippingCents,
      total_cents: total,
      customer_note: customerNote,
      shipping_phone: body.phone?.trim() || customer.phone,
      shipping_name: body.pickupName?.trim() || body.shipping?.name || customer.full_name,
      shipping_line1: body.shipping?.line1 ?? null,
      shipping_city: body.shipping?.city ?? null,
      shipping_postal_code: body.shipping?.postalCode ?? null,
      shipping_province: body.shipping?.province ?? null,
      shipping_country: "IT",
    })
    .select("id")
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: orderError?.message ?? "Ordine non creato." }, { status: 500 });
  }

  const { error: itemsError } = await admin.from("halo_order_items").insert(
    lines.map((line) => ({
      order_id: order.id,
      variant_id: line.variantId,
      product_name: line.productName,
      size: line.size,
      color: line.color,
      image_url: line.image ?? null,
      quantity: line.quantity,
      unit_price_cents: line.unitPriceCents,
    })),
  );
  if (itemsError) {
    await admin.from("halo_orders").delete().eq("id", order.id);
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  const { error: holdError } = await admin.rpc("halo_reserve_stock", {
    p_items: lines.map((line) => ({ variant_id: line.variantId, quantity: line.quantity })),
    p_order_id: order.id,
    p_session_id: null,
    p_minutes: settings.holdMinutes,
  });
  if (holdError) {
    await admin.from("halo_orders").delete().eq("id", order.id);
    return NextResponse.json(
      { error: "Qualcuno ha preso questo capo mentre confermavi. Aggiorna il carrello." },
      { status: 409 },
    );
  }

  if (body.fulfillment === "pickup") {
    const { error: confirmError } = await admin.rpc("halo_confirm_holds", { p_order_id: order.id });
    if (confirmError) {
      await admin.rpc("halo_release_order_holds", { p_order_id: order.id });
      await admin.from("halo_orders").delete().eq("id", order.id);
      return NextResponse.json({ error: "Impossibile confermare il ritiro." }, { status: 500 });
    }

    await admin.from("halo_cart_items").delete().eq("clerk_id", user.id);

    const pickupLabel = body.pickupAt ? formatPickupSlot(body.pickupAt) : null;
    const emailPayload = {
      id: order.id,
      email: customer.email,
      name: body.pickupName?.trim() || customer.full_name,
      status: "preparing" as const,
      fulfillment: "pickup" as const,
      totalCents: total,
      shippingCents: 0,
      pickupLabel,
      note: body.note?.trim() || null,
      items: lines.map((line) => ({
        name: line.productName,
        size: line.size,
        color: line.color,
        quantity: line.quantity,
        unitPriceCents: line.unitPriceCents,
      })),
    };
    await sendPickupReservedEmail(emailPayload);
    await sendOwnerNewOrderEmail(emailPayload);
    await notifyOwnerNewOrder({
      id: order.id,
      total_cents: total,
      fulfillment: "pickup",
      customer_note: customerNote,
      halo_customers: { email: customer.email, full_name: customer.full_name },
      halo_order_items: lines.map((line) => ({
        product_name: line.productName,
        size: line.size,
        color: line.color,
        quantity: line.quantity,
      })),
    });

    return NextResponse.json({ reserved: true, orderId: order.id });
  }

  const stripe = getStripe();
  const origin = siteUrl();
  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    mode: "payment",
    customer_email: customer.email,
    client_reference_id: order.id,
    return_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    expires_at: Math.floor(Date.now() / 1000) + settings.holdMinutes * 60,
    integration_identifier: integrationIdentifier(),
    metadata: {
      order_id: order.id,
      clerk_id: user.id,
      fulfillment: body.fulfillment,
    },
    line_items: [
      ...lines.map((line) => ({
        quantity: line.quantity,
        price_data: {
          currency: "eur",
          unit_amount: line.unitPriceCents,
          product_data: {
            name: line.productName,
            description: `${line.size} · ${line.color}`,
          },
        },
      })),
      ...(shippingCents > 0
        ? [
            {
              quantity: 1,
              price_data: {
                currency: "eur" as const,
                unit_amount: shippingCents,
                product_data: { name: "Spedizione Italia" },
              },
            },
          ]
        : []),
    ],
    ...(body.fulfillment === "shipping"
      ? { shipping_address_collection: { allowed_countries: ["IT"] as const } }
      : {}),
  });

  await admin
    .from("halo_orders")
    .update({ stripe_session_id: session.id, updated_at: new Date().toISOString() })
    .eq("id", order.id);
  await admin
    .from("halo_stock_holds")
    .update({ stripe_session_id: session.id })
    .eq("order_id", order.id);

  return NextResponse.json({ clientSecret: session.client_secret, orderId: order.id });
}
