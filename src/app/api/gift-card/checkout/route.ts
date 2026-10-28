import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";
import { ensureCustomer } from "@/lib/auth";
import { GIFT_CARD_AMOUNTS_EUR } from "@/lib/gift-card-constants";
import { getStripe, isStripeConfigured, siteUrl } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Accedi per acquistare una gift card." }, { status: 401 });
    }
    if (!isStripeConfigured()) {
      return NextResponse.json({ error: "I pagamenti non sono disponibili al momento." }, { status: 503 });
    }

    const body = (await request.json()) as { amounts?: number[]; amountCents?: number };
    const amounts = body.amounts ?? (body.amountCents ? [body.amountCents] : []);
    if (
      !amounts.length ||
      amounts.length > 10 ||
      amounts.some(
        (amountCents) =>
          !Number.isSafeInteger(amountCents) ||
          !GIFT_CARD_AMOUNTS_EUR.some((amount) => amount * 100 === amountCents),
      )
    ) {
      return NextResponse.json({ error: "Scegli un importo gift card disponibile." }, { status: 400 });
    }

    const customer = await ensureCustomer(user);
    const admin = createAdminClient();
    const { data: purchases, error: purchaseError } = await admin
      .from("halo_gift_card_purchases")
      .insert(
        amounts.map((amount_cents) => ({
          customer_id: customer.id,
          buyer_email: customer.email,
          amount_cents,
        })),
      )
      .select("id")
    if (purchaseError || !purchases?.length) {
      throw new Error(purchaseError?.message ?? "Impossibile creare l'acquisto gift card.");
    }

    try {
      const origin = siteUrl(request);
      const purchaseIds = purchases.map((purchase) => purchase.id);
      const purchaseIdsJson = JSON.stringify(purchaseIds);
      if (purchaseIdsJson.length > 450) throw new Error("Hai selezionato troppe gift card.");
      const session = await getStripe().checkout.sessions.create({
        mode: "payment",
        customer_email: customer.email,
        client_reference_id: purchaseIds[0],
        success_url: `${origin}/gift-card/conferma?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/#gift-card`,
        metadata: { gift_card_purchase_ids: purchaseIdsJson },
        payment_intent_data: {
          metadata: { gift_card_purchase_ids: purchaseIdsJson },
        },
        line_items: amounts.map((amountCents) => ({
            quantity: 1,
            price_data: {
              currency: "eur",
              unit_amount: amountCents,
              product_data: {
                name: `Gift card Halo Store · €${amountCents / 100}`,
                description: "Codice regalo digitale inviato via email dopo il pagamento.",
              },
            },
          })),
      });

      const { error: sessionError } = await admin
        .from("halo_gift_card_purchases")
        .update({ stripe_session_id: session.id })
        .in("id", purchaseIds);
      if (sessionError) throw new Error(sessionError.message);
      if (!session.url) throw new Error("Stripe non ha restituito il link di pagamento.");
      return NextResponse.json({ url: session.url });
    } catch (error) {
      await admin
        .from("halo_gift_card_purchases")
        .delete()
        .in("id", purchases.map((purchase) => purchase.id))
        .eq("status", "pending");
      throw error;
    }
  } catch (error) {
    console.error("[gift card checkout]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Impossibile avviare il pagamento." },
      { status: 500 },
    );
  }
}
