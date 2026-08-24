import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { createAdminClient, isAdminConfigured } from "@/lib/supabase";
import { getStoreSettings } from "@/lib/settings";
import { sendNewsletterWelcomeEmail } from "@/lib/email";
import {
  isValidBirthday,
  isValidEmail,
  normalizeEmail,
} from "@/lib/promo";

export const runtime = "nodejs";

export async function GET() {
  const settings = await getStoreSettings();
  return NextResponse.json({
    newsletterPercent: settings.newsletterDiscountPercent,
    birthdayPercent: settings.birthdayDiscountPercent,
    birthdayValidDays: settings.birthdayValidDays,
    newsletterCode: settings.newsletterCode,
  });
}

export async function POST(req: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "Iscrizione non disponibile in questo momento." }, { status: 503 });
  }

  const body = (await req.json()) as { email?: string; birthday?: string };
  const email = normalizeEmail(body.email ?? "");
  const birthday = String(body.birthday ?? "").slice(0, 10);

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Inserisci una email valida." }, { status: 400 });
  }
  if (!isValidBirthday(birthday)) {
    return NextResponse.json({ error: "Inserisci una data di compleanno valida." }, { status: 400 });
  }

  const settings = await getStoreSettings();
  const admin = createAdminClient();
  const now = new Date().toISOString();

  const { data: existing, error: existingError } = await admin
    .from("halo_subscribers")
    .select("email, welcome_email_sent_at, marketing_opt_in")
    .eq("email", email)
    .maybeSingle();

  if (existingError) {
    console.error("[newsletter subscribe]", existingError.message);
    return NextResponse.json(
      { error: "Iscrizione non disponibile in questo momento." },
      { status: 503 },
    );
  }

  const { error: upsertError } = await admin.from("halo_subscribers").upsert(
    {
      email,
      birthday,
      marketing_opt_in: true,
      source: "popup",
      updated_at: now,
    },
    { onConflict: "email" },
  );
  if (upsertError) {
    console.error("[newsletter subscribe]", upsertError.message);
    return NextResponse.json({ error: "Iscrizione non disponibile in questo momento." }, { status: 500 });
  }

  const { data: customer } = await admin.from("halo_customers").select("id").ilike("email", email).maybeSingle();
  if (customer) {
    await admin.from("halo_consents").upsert(
      {
        customer_id: customer.id,
        email_marketing: true,
        email_marketing_at: now,
        source: "newsletter",
        updated_at: now,
      },
      { onConflict: "customer_id" },
    );
  } else {
    const user = await currentUser();
    const userEmail = user?.emailAddresses[0]?.emailAddress?.toLowerCase();
    if (user && userEmail === email) {
      const { data: byClerk } = await admin
        .from("halo_customers")
        .select("id")
        .eq("clerk_id", user.id)
        .maybeSingle();
      if (byClerk) {
        await admin.from("halo_consents").upsert(
          {
            customer_id: byClerk.id,
            email_marketing: true,
            email_marketing_at: now,
            source: "newsletter",
            updated_at: now,
          },
          { onConflict: "customer_id" },
        );
      }
    }
  }

  const sent = await sendNewsletterWelcomeEmail({
    email,
    code: settings.newsletterCode,
    percent: settings.newsletterDiscountPercent,
    birthdayCode: settings.birthdayCode,
    birthdayPercent: settings.birthdayDiscountPercent,
  });
  if (!sent.ok) {
    console.error("[newsletter welcome]", sent.reason);
    return NextResponse.json(
      { error: "Non siamo riusciti a inviarti la mail. Riprova tra poco." },
      { status: 503 },
    );
  }
  await admin
    .from("halo_subscribers")
    .update({ welcome_email_sent_at: now, updated_at: now })
    .eq("email", email);

  return NextResponse.json({
    ok: true,
    already: Boolean(existing?.marketing_opt_in),
    emailed: true,
  });
}
