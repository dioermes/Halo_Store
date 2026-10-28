import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase";

export const runtime = "nodejs";

function parseAmountCents(value: unknown) {
  if (typeof value !== "string" || !/^\d+(?:[.,]\d{1,2})?$/.test(value.trim())) {
    return null;
  }
  const amount = Number(value.trim().replace(",", "."));
  if (!Number.isFinite(amount) || amount <= 0 || amount > 10000000) return null;
  const cents = Math.round(amount * 100);
  return Number.isSafeInteger(cents) ? cents : null;
}

export async function POST(req: Request) {
  let user;
  try {
    user = await requireOwner();
  } catch (error) {
    if (error instanceof Error && error.message === "unauthenticated") {
      return NextResponse.json({ error: "Accedi per riscattare una gift card." }, { status: 401 });
    }
    if (error instanceof Error && error.message === "forbidden") {
      return NextResponse.json({ error: "Non sei autorizzato a riscattare gift card." }, { status: 403 });
    }
    console.error("[admin gift card authorization]", error);
    return NextResponse.json({ error: "Impossibile verificare i permessi." }, { status: 500 });
  }

  let body: { code?: unknown; amount?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Richiesta non valida." }, { status: 400 });
  }

  const code = typeof body.code === "string" ? body.code.trim().toUpperCase().replace(/\s+/g, "") : "";
  if (!/^HALO-[A-F0-9]{4}(?:-[A-F0-9]{4}){4}$/.test(code)) {
    return NextResponse.json({ error: "Inserisci un codice gift card valido." }, { status: 400 });
  }

  const amountCents = parseAmountCents(body.amount);
  if (amountCents === null) {
    return NextResponse.json({ error: "Inserisci un importo valido, maggiore di zero." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin.rpc("halo_redeem_gift_card_in_store", {
    p_code: code,
    p_amount_cents: amountCents,
    p_redeemed_by: user.id,
  });
  if (error) {
    if (error.code === "PGRST202" || /could not find the function.*halo_redeem_gift_card_in_store/i.test(error.message)) {
      console.error("[admin gift card redemption] RPC unavailable; apply migration or reload PostgREST schema");
      return NextResponse.json(
        {
          error:
            "Funzione di riscatto non disponibile nel database. Applica la migrazione gift card in Supabase e aggiorna la cache dello schema.",
        },
        { status: 503 },
      );
    }
    if (/gift_card_invalid\b/i.test(error.message)) {
      return NextResponse.json({ error: "Gift card non trovata o codice non valido." }, { status: 404 });
    }
    if (/gift_card_insufficient_balance/i.test(error.message)) {
      return NextResponse.json({ error: "Credito insufficiente o già riservato per un ordine online." }, { status: 409 });
    }
    if (/gift_card_invalid_amount/i.test(error.message)) {
      return NextResponse.json({ error: "L'importo da addebitare non è valido." }, { status: 400 });
    }
    console.error("[admin gift card redemption]", error.message);
    return NextResponse.json({ error: "Non è stato possibile aggiornare il saldo. Riprova." }, { status: 500 });
  }

  const redemption = Array.isArray(data) ? data[0] : data;
  if (!redemption) {
    console.error("[admin gift card redemption] RPC returned no redemption");
    return NextResponse.json({ error: "Non è stato possibile confermare l'addebito." }, { status: 500 });
  }
  return NextResponse.json({
    code: redemption.code,
    amountCents: redemption.amount_cents,
    balanceCents: redemption.balance_cents,
  });
}
