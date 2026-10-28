import { randomBytes } from "node:crypto";
import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase";
import { formatPrice } from "@/lib/products";
import { sendGiftCardEmail } from "@/lib/email";

export function normalizeGiftCardCode(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

export async function quoteGiftCard(code: string, requestedCents: number) {
  if (!Number.isSafeInteger(requestedCents) || requestedCents <= 0) {
    return { ok: false as const, error: "Il carrello non contiene prodotti su cui applicare la gift card." };
  }
  const normalized = normalizeGiftCardCode(code);
  if (!/^HALO-[A-F0-9]{4}(?:-[A-F0-9]{4}){4}$/.test(normalized)) {
    return { ok: false as const, error: "Il codice gift card non è valido." };
  }

  const admin = createAdminClient();
  const { data: card, error: cardError } = await admin
    .from("halo_gift_cards")
    .select("id, balance_cents")
    .eq("code", normalized)
    .maybeSingle();
  if (cardError) throw new Error(cardError.message);
  if (!card || card.balance_cents <= 0) {
    return { ok: false as const, error: "La gift card non è valida o ha esaurito il credito." };
  }

  const { data: holds, error: holdsError } = await admin
    .from("halo_gift_card_holds")
    .select("amount_cents")
    .eq("gift_card_id", card.id)
    .is("released_at", null)
    .is("consumed_at", null)
    .gt("expires_at", new Date().toISOString());
  if (holdsError) throw new Error(holdsError.message);

  const heldCents = (holds ?? []).reduce((sum, hold) => sum + hold.amount_cents, 0);
  const availableCents = Math.max(0, card.balance_cents - heldCents);
  if (!availableCents) {
    return { ok: false as const, error: "Il credito della gift card è già riservato o esaurito." };
  }
  const discountCents = Math.min(availableCents, Math.max(0, Math.floor(requestedCents)));
  return {
    ok: true as const,
    giftCardId: card.id,
    code: normalized,
    availableCents,
    discountCents,
    remainingAfterCents: availableCents - discountCents,
  };
}

function createGiftCardCode() {
  const chunks = randomBytes(10).toString("hex").toUpperCase().match(/.{1,4}/g);
  if (!chunks || chunks.length !== 5) throw new Error("Impossibile generare il codice gift card.");
  return `HALO-${chunks.join("-")}`;
}

export async function deliverPaidGiftCard(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid") {
    throw new Error("Il pagamento della gift card non risulta completato.");
  }
  const purchaseId = session.metadata?.gift_card_purchase_id;
  if (!purchaseId) throw new Error("Acquisto gift card non indicato nella sessione Stripe.");

  const admin = createAdminClient();
  let issued: {
    gift_card_id: string;
    code: string;
    buyer_email: string;
    amount_cents: number;
  } | null = null;
  let lastError: string | null = null;
  for (let attempt = 0; attempt < 3 && !issued; attempt += 1) {
    const { data, error } = await admin.rpc("halo_issue_gift_card", {
      p_purchase_id: purchaseId,
      p_session_id: session.id,
      p_payment_intent:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id ?? null,
      p_code: createGiftCardCode(),
    });
    if (!error) {
      issued = Array.isArray(data) ? data[0] : data;
      if (issued) break;
    }
    lastError = error?.message ?? "Nessun codice emesso.";
    if (!/duplicate|unique/i.test(lastError)) break;
  }
  if (!issued) throw new Error(`Emissione gift card non riuscita: ${lastError ?? "errore sconosciuto"}`);

  const { data: claimed, error: claimError } = await admin.rpc("halo_claim_gift_card_email", {
    p_purchase_id: purchaseId,
  });
  if (claimError) throw new Error(claimError.message);
  if (!claimed) {
    const { data: purchase, error: purchaseError } = await admin
      .from("halo_gift_card_purchases")
      .select("email_sent_at")
      .eq("id", purchaseId)
      .single();
    if (purchaseError) throw new Error(purchaseError.message);
    if (purchase?.email_sent_at) return;
    throw new Error("Invio email gift card già in corso; sarà ritentato dal webhook.");
  }

  const sent = await sendGiftCardEmail({
    email: issued.buyer_email,
    code: issued.code,
    amount: formatPrice(issued.amount_cents / 100),
  });
  if (!sent.ok) throw new Error(`Email gift card non inviata: ${sent.reason}`);

  const { error: markError } = await admin.rpc("halo_mark_gift_card_email_sent", {
    p_purchase_id: purchaseId,
  });
  if (markError) throw new Error(markError.message);
}

export async function deliverPaidGiftCards(session: Stripe.Checkout.Session) {
  const rawIds = session.metadata?.gift_card_purchase_ids;
  if (!rawIds) return deliverPaidGiftCard(session);
  let purchaseIds: unknown;
  try {
    purchaseIds = JSON.parse(rawIds);
  } catch {
    throw new Error("Elenco acquisti gift card non valido nella sessione Stripe.");
  }
  if (
    !Array.isArray(purchaseIds) ||
    purchaseIds.length === 0 ||
    purchaseIds.length > 10 ||
    purchaseIds.some((id) => typeof id !== "string")
  ) {
    throw new Error("Elenco acquisti gift card non valido nella sessione Stripe.");
  }
  for (const purchaseId of purchaseIds) {
    await deliverPaidGiftCard({
      ...session,
      metadata: { ...session.metadata, gift_card_purchase_id: purchaseId },
    });
  }
}
