import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";
import { ensureCustomer, isOwnerUser } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { sessionId } = await params;
  const admin = createAdminClient();
  const customer = await ensureCustomer(user);
  const { data, error } = await admin
    .from("halo_orders")
    .select("id, status, customer_id")
    .eq("stripe_session_id", sessionId)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ status: "pending_payment" });
  if (data.customer_id !== customer.id && !isOwnerUser(user)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  return NextResponse.json({ id: data.id, status: data.status });
}
