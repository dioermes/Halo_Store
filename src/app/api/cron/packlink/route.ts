import { NextResponse } from "next/server";
import { isAdminConfigured } from "@/lib/supabase";
import { syncOpenPacklinkOrders } from "@/lib/packlink-order-sync";

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
  const results = await syncOpenPacklinkOrders();
  return NextResponse.json({ ok: true, checked: results.length, results });
}
