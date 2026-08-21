import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { ensureCustomer, isOwnerUser } from "@/lib/auth";
import { fulfillPaidCheckoutSession } from "@/lib/fulfill-checkout";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { sessionId } = await params;
  if (!sessionId.startsWith("cs_")) {
    return NextResponse.json({ error: "Sessione non valida" }, { status: 400 });
  }

  const customer = await ensureCustomer(user);
  let order;
  try {
    order = await fulfillPaidCheckoutSession(sessionId);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sessione non trovata" },
      { status: 404 },
    );
  }

  if (!order) return NextResponse.json({ status: "pending_payment" });
  if (order.customerId !== customer.id && !isOwnerUser(user)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  return NextResponse.json({
    id: order.id,
    status: order.status,
    fulfillment: order.fulfillment,
    totalCents: order.totalCents,
    shippingCents: order.shippingCents,
    items: order.items,
  });
}
