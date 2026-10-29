import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";
import { ensureCustomer } from "@/lib/auth";
import { getPublishedProducts } from "@/lib/catalog";
import { findVariant, productImageForColor } from "@/lib/products";
import { getStoreSettings } from "@/lib/settings";
import { getStoreContact } from "@/lib/site";
import { getStripe, integrationIdentifier, isStripeConfigured, siteUrl } from "@/lib/stripe";
import type { Fulfillment } from "@/lib/orders";
import { formatPickupSlot, isPickupWithinHours } from "@/lib/opening-hours";
import { sendOwnerNewOrderEmail, sendPickupReservedEmail } from "@/lib/email";
import { notifyOwnerNewOrder } from "@/lib/whatsapp";
import { settleCustomerPendingPayments, type FulfilledOrder } from "@/lib/fulfill-checkout";
import { releasePromoForOrder, reservePromo, resolvePromo } from "@/lib/promo";
import { quoteGiftCard } from "@/lib/gift-cards";
import { GIFT_CARD_AMOUNTS_EUR } from "@/lib/gift-card-constants";

type CartPayload = {
  productId: string;
  variantId?: string;
  size: string;
  color: string;
  quantity: number;
};

type CheckoutProductLine = {
  productName: string;
  size: string;
  color: string;
  quantity: number;
  unitPriceCents: number;
};

function discountedProductLineItems(
  lines: CheckoutProductLine[],
  discountCents: number,
  subtotalCents: number,
) {
  const units = lines.flatMap((line) =>
    Array.from({ length: line.quantity }, () => ({
      line,
      baseCents: line.unitPriceCents,
      discountCents: 0,
      remainder: BigInt(0),
    })),
  );
  if (discountCents > 0) {
    let allocated = 0;
    for (const unit of units) {
      const numerator = BigInt(discountCents) * BigInt(unit.baseCents);
      unit.discountCents = Number(numerator / BigInt(subtotalCents));
      unit.remainder = numerator % BigInt(subtotalCents);
      allocated += unit.discountCents;
    }
    const remaining = discountCents - allocated;
    const byRemainder = units
      .map((unit, index) => ({ index, remainder: unit.remainder }))
      .sort((left, right) =>
        left.remainder === right.remainder ? left.index - right.index :
          left.remainder > right.remainder ? -1 : 1,
      );
    for (let index = 0; index < remaining; index += 1) {
      units[byRemainder[index].index].discountCents += 1;
    }
  }

  const groups = new Map<
    string,
    { line: CheckoutProductLine; unitAmountCents: number; quantity: number }
  >();
  for (const unit of units) {
    const unitAmountCents = unit.baseCents - unit.discountCents;
    const key = JSON.stringify([
      unit.line.productName,
      unit.line.size,
      unit.line.color,
      unitAmountCents,
    ]);
    const group = groups.get(key);
    if (group) group.quantity += 1;
    else groups.set(key, { line: unit.line, unitAmountCents, quantity: 1 });
  }

  return [...groups.values()].map(({ line, unitAmountCents, quantity }) => ({
    quantity,
    price_data: {
      currency: "eur" as const,
      unit_amount: unitAmountCents,
      product_data: {
        name: line.productName,
        description: `${line.size} · ${line.color}`,
      },
    },
  }));
}

function sameCart(
  order: FulfilledOrder,
  lines: Array<{ size: string; color: string; quantity: number }>,
) {
  if (order.items.length !== lines.length) return false;
  const key = (size: string, color: string, quantity: number) =>
    `${size}|${color}|${quantity}`;
  const left = [...order.items.map((item) => key(item.size, item.color, item.quantity))].sort();
  const right = [...lines.map((line) => key(line.size, line.color, line.quantity))].sort();
  return left.join() === right.join();
}

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    return await handleCheckout(req);
  } catch (error) {
    console.error("[checkout session]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Impossibile aprire la cassa." },
      { status: 500 },
    );
  }
}

async function handleCheckout(req: Request) {
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
    promoCode?: string;
    giftCardCode?: string;
    giftCardAmounts?: number[];
  };

  const giftCardAmounts = body.giftCardAmounts ?? [];
  if (
    !Array.isArray(giftCardAmounts) ||
    giftCardAmounts.length > 10 ||
    giftCardAmounts.some(
      (amountCents) =>
        !Number.isSafeInteger(amountCents) ||
        !GIFT_CARD_AMOUNTS_EUR.some((amount) => amount * 100 === amountCents),
    )
  ) {
    return NextResponse.json({ error: "Scegli un importo gift card disponibile." }, { status: 400 });
  }
  if (giftCardAmounts.length > 0 && body.fulfillment === "pickup") {
    return NextResponse.json(
      { error: "Con il ritiro, prenota prima i capi e acquista poi le gift card online." },
      { status: 400 },
    );
  }

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
    const { hours } = await getStoreContact();
    if (!isPickupWithinHours(body.pickupAt, 48, new Date(), hours)) {
      return NextResponse.json(
        { error: "Scegli un orario di ritiro entro 48 ore, negli orari di apertura." },
        { status: 400 },
      );
    }
  } else if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "I pagamenti non sono disponibili in questo momento. Riprova o scrivici." },
      { status: 503 },
    );
  }

  const products = await getPublishedProducts();
  const settings = await getStoreSettings();
  const admin = createAdminClient();
  const customer = await ensureCustomer(user);

  const alreadyPaid = await settleCustomerPendingPayments(customer.id);

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

  if (alreadyPaid && sameCart(alreadyPaid, lines) && giftCardAmounts.length === 0) {
    return NextResponse.json({ alreadyPaid: true, orderId: alreadyPaid.id });
  }

  const subtotal = lines.reduce((sum, line) => sum + line.unitPriceCents * line.quantity, 0);
  const shippingCents = body.fulfillment === "shipping" ? settings.shippingItalyCents : 0;
  const giftCardQuote = body.giftCardCode?.trim()
    ? await quoteGiftCard(body.giftCardCode, subtotal + shippingCents)
    : null;
  if (giftCardQuote && !giftCardQuote.ok) {
    return NextResponse.json({ error: giftCardQuote.error }, { status: 400 });
  }
  let giftCardCents = giftCardQuote?.ok ? giftCardQuote.discountCents : 0;
  let giftCardId = giftCardQuote?.ok ? giftCardQuote.giftCardId : null;
  let discountCents = 0;
  let discountCode: string | null = null;
  let discountKind: "newsletter" | "birthday" | null = null;

  let total = subtotal + shippingCents - giftCardCents;

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
      discount_cents: discountCents,
      discount_code: discountCode,
      discount_kind: discountKind,
      gift_card_id: giftCardId,
      gift_card_discount_cents: giftCardCents,
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

  const abortOrder = async () => {
    await releasePromoForOrder(order.id);
    await admin.rpc("halo_restore_gift_card_hold", { p_order_id: order.id });
    await admin.rpc("halo_release_order_holds", { p_order_id: order.id });
    await admin.from("halo_orders").delete().eq("id", order.id);
  };

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
    await abortOrder();
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  const reserveMinutes =
    body.fulfillment === "shipping"
      ? Math.max(30, settings.holdMinutes)
      : settings.holdMinutes;

  const { error: holdError } = await admin.rpc("halo_reserve_stock", {
    p_items: lines.map((line) => ({ variant_id: line.variantId, quantity: line.quantity })),
    p_order_id: order.id,
    p_session_id: null,
    p_minutes: reserveMinutes,
  });
  if (holdError) {
    console.error("[halo_reserve_stock]", holdError.message);
    await abortOrder();
    const insufficient = /insufficient_stock/i.test(holdError.message);
    return NextResponse.json(
      {
        error: insufficient
          ? "Questo capo non è disponibile in questa taglia e colore. Se hai appena pagato, apri i tuoi ordini. Altrimenti riprova tra un minuto."
          : "Non è stato possibile prenotare le scorte. Riprova tra un minuto.",
      },
      { status: 409 },
    );
  }

  if (giftCardQuote?.ok) {
    const { data: reservedGift, error: giftCardError } = await admin.rpc("halo_reserve_gift_card", {
      p_code: giftCardQuote.code,
      p_order_id: order.id,
      p_requested_cents: subtotal + shippingCents,
      p_minutes: reserveMinutes,
    });
    const reservation = Array.isArray(reservedGift) ? reservedGift[0] : reservedGift;
    if (giftCardError || !reservation) {
      await abortOrder();
      return NextResponse.json(
        { error: giftCardError?.message ?? "Il credito gift card non è più disponibile." },
        { status: 409 },
      );
    }
    giftCardCents = reservation.reserved_cents;
    giftCardId = reservation.gift_card_id;
  }

  if (body.promoCode?.trim()) {
    const merchandiseGiftCardCents = Math.min(subtotal, giftCardCents);
    const resolved = await resolvePromo({
      email: customer.email,
      code: body.promoCode,
      subtotalCents: subtotal - merchandiseGiftCardCents,
      shippingCents,
      paidOnline: body.fulfillment === "shipping",
      settings,
    });
    if (!resolved.ok) {
      await abortOrder();
      return NextResponse.json(
        { error: resolved.error, needNewsletter: Boolean(resolved.needNewsletter) },
        { status: 400 },
      );
    }
    discountCents = resolved.quote.discountCents;
    discountCode = resolved.quote.code;
    discountKind = resolved.quote.kind;
  }

  total = subtotal + shippingCents - giftCardCents - discountCents;
  const { error: updatePricingError } = await admin
    .from("halo_orders")
    .update({
      discount_cents: discountCents,
      discount_code: discountCode,
      discount_kind: discountKind,
      gift_card_id: giftCardId,
      gift_card_discount_cents: giftCardCents,
      total_cents: total,
      updated_at: new Date().toISOString(),
    })
    .eq("id", order.id);
  if (updatePricingError) {
    await abortOrder();
    return NextResponse.json({ error: updatePricingError.message }, { status: 500 });
  }

  if (discountKind) {
    try {
      await reservePromo(customer.email, discountKind, order.id);
    } catch (error) {
      await abortOrder();
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Codice sconto non disponibile." },
        { status: 409 },
      );
    }
  }

  let giftCardPurchaseIds: string[] = [];
  if (giftCardAmounts.length > 0) {
    const { data: purchases, error: purchaseError } = await admin
      .from("halo_gift_card_purchases")
      .insert(
        giftCardAmounts.map((amount_cents) => ({
          customer_id: customer.id,
          buyer_email: customer.email,
          amount_cents,
        })),
      )
      .select("id");
    if (purchaseError || !purchases?.length) {
      await abortOrder();
      return NextResponse.json(
        { error: purchaseError?.message ?? "Impossibile creare l'acquisto gift card." },
        { status: 500 },
      );
    }
    giftCardPurchaseIds = purchases.map((purchase) => purchase.id);
  }

  if (body.fulfillment === "pickup") {
    if (giftCardCents > 0) {
      const { error: giftConsumeError } = await admin.rpc("halo_consume_gift_card_hold", {
        p_order_id: order.id,
      });
      if (giftConsumeError) {
        await abortOrder();
        return NextResponse.json({ error: "Impossibile applicare il credito gift card." }, { status: 500 });
      }
    }
    const { error: confirmError } = await admin.rpc("halo_confirm_holds", { p_order_id: order.id });
    if (confirmError) {
      await abortOrder();
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
  const origin = siteUrl(req);
  let session;
  try {
    const merchandiseGiftCardCents = Math.min(subtotal, giftCardCents);
    const shippingGiftCardCents = Math.max(0, giftCardCents - merchandiseGiftCardCents);
    const totalProductDiscountCents = discountCents + merchandiseGiftCardCents;
    const giftCardPurchaseIdsJson = JSON.stringify(giftCardPurchaseIds);
    if (giftCardPurchaseIdsJson.length > 450) {
      throw new Error("Hai selezionato troppe gift card.");
    }
    const giftCardLines = giftCardAmounts.map((amountCents) => ({
      quantity: 1,
      price_data: {
        currency: "eur" as const,
        unit_amount: amountCents,
        product_data: {
          name: `Gift card Halo Store · €${amountCents / 100}`,
          description: "Codice regalo digitale inviato via email dopo il pagamento.",
        },
      },
    }));
    session = await stripe.checkout.sessions.create({
      ui_mode: "embedded_page",
      mode: "payment",
      customer_email: customer.email,
      client_reference_id: order.id,
      return_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      expires_at: Math.floor(Date.now() / 1000) + reserveMinutes * 60,
      integration_identifier: integrationIdentifier(),
      metadata: {
        order_id: order.id,
        clerk_id: user.id,
        fulfillment: body.fulfillment,
        discount_code: discountCode ?? "",
        ...(giftCardPurchaseIds.length > 0
          ? { gift_card_purchase_ids: giftCardPurchaseIdsJson }
          : {}),
      },
      ...(giftCardPurchaseIds.length > 0
        ? {
            payment_intent_data: {
              metadata: { gift_card_purchase_ids: giftCardPurchaseIdsJson },
              ...(body.fulfillment === "shipping" && body.shipping
                ? {
                    shipping: {
                      name: body.shipping.name,
                      phone: body.phone?.trim() || undefined,
                      address: {
                        line1: body.shipping.line1,
                        city: body.shipping.city,
                        postal_code: body.shipping.postalCode,
                        state: body.shipping.province,
                        country: "IT",
                      },
                    },
                  }
                : {}),
            },
          }
        : body.fulfillment === "shipping" && body.shipping
          ? {
              payment_intent_data: {
                shipping: {
                  name: body.shipping.name,
                  phone: body.phone?.trim() || undefined,
                  address: {
                    line1: body.shipping.line1,
                    city: body.shipping.city,
                    postal_code: body.shipping.postalCode,
                    state: body.shipping.province,
                    country: "IT",
                  },
                },
              },
            }
          : {}),
      line_items: [
        ...discountedProductLineItems(lines, totalProductDiscountCents, subtotal),
        ...(shippingCents - shippingGiftCardCents > 0
          ? [
              {
                quantity: 1,
                price_data: {
                  currency: "eur" as const,
                  unit_amount: shippingCents - shippingGiftCardCents,
                  product_data: { name: "Spedizione Italia" },
                },
              },
            ]
          : []),
        ...giftCardLines,
      ],
      ...(body.fulfillment === "shipping" && body.shipping
        ? { billing_address_collection: "auto" as const }
        : {}),
    });
  } catch (error) {
    if (giftCardPurchaseIds.length > 0) {
      await admin
        .from("halo_gift_card_purchases")
        .delete()
        .in("id", giftCardPurchaseIds)
        .eq("status", "pending");
    }
    await abortOrder();
    const message = error instanceof Error ? error.message : "Stripe ha rifiutato la sessione.";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  await admin
    .from("halo_orders")
    .update({ stripe_session_id: session.id, updated_at: new Date().toISOString() })
    .eq("id", order.id);
  await admin
    .from("halo_stock_holds")
    .update({ stripe_session_id: session.id })
    .eq("order_id", order.id);
  if (giftCardPurchaseIds.length > 0) {
    const { error: purchaseSessionError } = await admin
      .from("halo_gift_card_purchases")
      .update({ stripe_session_id: session.id })
      .in("id", giftCardPurchaseIds);
    if (purchaseSessionError) {
      console.error("[gift card checkout session]", purchaseSessionError.message);
      return NextResponse.json(
        { error: "Non è stato possibile collegare le gift card al pagamento. Riprova." },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ clientSecret: session.client_secret, orderId: order.id });
}
