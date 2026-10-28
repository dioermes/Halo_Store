import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { ensureCustomer } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase";

export const runtime = "nodejs";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function getCustomer() {
  const user = await currentUser();
  if (!user) return null;
  return ensureCustomer(user);
}

export async function GET() {
  const customer = await getCustomer();
  if (!customer) return NextResponse.json({ error: "Accedi per visualizzare i preferiti." }, { status: 401 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("halo_product_favorites")
    .select("product_id")
    .eq("customer_id", customer.id);
  if (error) {
    console.error("[account favorites]", error.message);
    return NextResponse.json({ error: "Non è stato possibile caricare i preferiti." }, { status: 500 });
  }
  return NextResponse.json({ productIds: (data ?? []).map((row) => row.product_id) });
}

export async function POST(req: Request) {
  const customer = await getCustomer();
  if (!customer) return NextResponse.json({ error: "Accedi per salvare i preferiti." }, { status: 401 });

  let body: { productId?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Richiesta non valida." }, { status: 400 });
  }
  if (typeof body.productId !== "string" || !uuidPattern.test(body.productId)) {
    return NextResponse.json({ error: "Capo non valido." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: product, error: productError } = await admin
    .from("halo_products")
    .select("id")
    .eq("id", body.productId)
    .eq("published", true)
    .maybeSingle();
  if (productError) {
    console.error("[account favorites product]", productError.message);
    return NextResponse.json({ error: "Non è stato possibile verificare il capo." }, { status: 500 });
  }
  if (!product) return NextResponse.json({ error: "Il capo non è più disponibile." }, { status: 404 });

  const { error } = await admin.from("halo_product_favorites").upsert(
    { customer_id: customer.id, product_id: product.id },
    { onConflict: "customer_id,product_id", ignoreDuplicates: true },
  );
  if (error) {
    console.error("[account favorites add]", error.message);
    return NextResponse.json({ error: "Non è stato possibile aggiungere il preferito." }, { status: 500 });
  }
  return NextResponse.json({ productId: product.id, favorited: true });
}

export async function DELETE(req: Request) {
  const customer = await getCustomer();
  if (!customer) return NextResponse.json({ error: "Accedi per modificare i preferiti." }, { status: 401 });

  let body: { productId?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Richiesta non valida." }, { status: 400 });
  }
  if (typeof body.productId !== "string" || !uuidPattern.test(body.productId)) {
    return NextResponse.json({ error: "Capo non valido." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("halo_product_favorites")
    .delete()
    .eq("customer_id", customer.id)
    .eq("product_id", body.productId);
  if (error) {
    console.error("[account favorites remove]", error.message);
    return NextResponse.json({ error: "Non è stato possibile rimuovere il preferito." }, { status: 500 });
  }
  return NextResponse.json({ productId: body.productId, favorited: false });
}
