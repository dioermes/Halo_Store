import type { createAdminClient } from "@/lib/supabase";
import { sendStockBackEmail } from "@/lib/email";
import { siteUrl } from "@/lib/stripe";

type Admin = ReturnType<typeof createAdminClient>;

export async function notifyStockAlerts(client: Admin, variantIds: string[]) {
  const ids = [...new Set(variantIds.filter(Boolean))];
  if (!ids.length) return;

  const { data: variants, error: variantError } = await client
    .from("halo_variants")
    .select("id, size, color, stock, product_id")
    .in("id", ids);
  if (variantError) {
    console.error("[stock-alert]", variantError.message);
    return;
  }

  const inStock = (variants ?? []).filter((row) => (row.stock ?? 0) > 0);
  if (!inStock.length) return;

  const productIds = [...new Set(inStock.map((row) => row.product_id).filter(Boolean))];
  const { data: products, error: productError } = await client
    .from("halo_products")
    .select("id, name, slug")
    .in("id", productIds);
  if (productError) {
    console.error("[stock-alert]", productError.message);
    return;
  }
  const productById = new Map((products ?? []).map((row) => [row.id, row]));

  const inStockIds = inStock.map((row) => row.id);
  const { data: alerts, error: alertError } = await client
    .from("halo_stock_alerts")
    .select("id, email, variant_id")
    .in("variant_id", inStockIds);
  if (alertError) {
    console.error("[stock-alert]", alertError.message);
    return;
  }
  if (!alerts?.length) return;

  const variantById = new Map(inStock.map((row) => [row.id, row]));
  const sent = new Set<string>();

  for (const alert of alerts) {
    const variant = variantById.get(alert.variant_id);
    const product = variant ? productById.get(variant.product_id) : null;
    if (!variant || !product) continue;
    const result = await sendStockBackEmail({
      email: alert.email,
      productName: product.name,
      size: variant.size,
      color: variant.color,
      href: `${siteUrl()}/catalogo`,
    });
    if (result.ok) sent.add(alert.id);
  }

  if (!sent.size) return;
  const { error: deleteError } = await client
    .from("halo_stock_alerts")
    .delete()
    .in("id", [...sent]);
  if (deleteError) console.error("[stock-alert]", deleteError.message);
}
