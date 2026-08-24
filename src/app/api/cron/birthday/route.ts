import { NextResponse } from "next/server";
import { createAdminClient, isAdminConfigured } from "@/lib/supabase";
import { getStoreSettings } from "@/lib/settings";
import { sendBirthdayPromoEmail } from "@/lib/email";
import { isBirthdayToday, type SubscriberRow } from "@/lib/promo";

export const runtime = "nodejs";

function authorized(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  const vercelCron = req.headers.get("x-vercel-cron");
  if (secret) return auth === `Bearer ${secret}`;
  if (process.env.NODE_ENV !== "production") return true;
  return Boolean(vercelCron);
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
  }
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "Supabase admin non configurato." }, { status: 503 });
  }

  const settings = await getStoreSettings();
  const admin = createAdminClient();
  const year = Number(
    new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome", year: "numeric" }).format(new Date()),
  );

  const { data, error } = await admin
    .from("halo_subscribers")
    .select(
      "email, birthday, marketing_opt_in, welcome_email_sent_at, welcome_redeemed_at, welcome_order_id, birthday_email_year, birthday_redeemed_at, birthday_order_id",
    )
    .eq("marketing_opt_in", true);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const due = ((data ?? []) as SubscriberRow[]).filter(
    (row) => isBirthdayToday(row.birthday) && row.birthday_email_year !== year,
  );

  let sent = 0;
  for (const row of due) {
    const sent = await sendBirthdayPromoEmail({
      email: row.email,
      code: settings.birthdayCode,
      percent: settings.birthdayDiscountPercent,
      validDays: settings.birthdayValidDays,
    });
    if (!sent.ok) {
      console.error("[birthday cron send]", row.email, sent.reason);
      continue;
    }
    const { error: markError } = await admin
      .from("halo_subscribers")
      .update({
        birthday_email_year: year,
        updated_at: new Date().toISOString(),
      })
      .eq("email", row.email);
    if (markError) console.error("[birthday cron mark]", markError.message);
    else sent += 1;
  }

  return NextResponse.json({ ok: true, due: due.length, sent });
}
