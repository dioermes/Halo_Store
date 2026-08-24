import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getPublishedProducts } from "@/lib/catalog";
import { findVariant } from "@/lib/products";
import { getStoreSettings } from "@/lib/settings";
import { resolvePromo } from "@/lib/promo";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Accedi per usare un codice sconto." }, { status: 401 });

  const body = (await req.json()) as {
    code?: string;
    fulfillment?: "pickup" | "shipping";
    items?: Array<{ productId: string; variantId?: string; size: string; color: string; quantity: number }>;
  };

  if (!body.items?.length) {
    return NextResponse.json({ error: "Il carrello è vuoto." }, { status: 400 });
  }

  const products = await getPublishedProducts();
  let subtotalCents = 0;
  for (const item of body.items) {
    const product = products.find((row) => row.id === item.productId);
    if (!product) return NextResponse.json({ error: "Un capo del carrello non è più in vetrina." }, { status: 400 });
    const variant =
      (item.variantId
        ? product.variants?.find((row) => row.id === item.variantId)
        : findVariant(product, item.size, item.color)) ?? null;
    if (!variant) return NextResponse.json({ error: "Combinazione taglia/colore non valida." }, { status: 400 });
    subtotalCents += Math.round(product.price * 100) * item.quantity;
  }

  const settings = await getStoreSettings();
  const shippingCents = body.fulfillment === "shipping" ? settings.shippingItalyCents : 0;
  const email = user.emailAddresses[0]?.emailAddress ?? "";
  const resolved = await resolvePromo({
    email,
    code: body.code ?? "",
    subtotalCents,
    shippingCents,
    paidOnline: body.fulfillment === "shipping",
    settings,
  });
  if (!resolved.ok) {
    return NextResponse.json(
      { error: resolved.error, needNewsletter: Boolean(resolved.needNewsletter) },
      { status: 400 },
    );
  }

  return NextResponse.json({
    ...resolved.quote,
    subtotalCents,
    shippingCents,
    totalCents: subtotalCents + shippingCents - resolved.quote.discountCents,
  });
}
