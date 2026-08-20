import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { gallery, products } from "./generate-halo-seed.mjs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const i = line.indexOf("=");
      return [line.slice(0, i), line.slice(i + 1)];
    }),
);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, ""), env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const { error: wipeImages } = await supabase.from("halo_product_images").delete().neq("id", "00000000-0000-0000-0000-000000000000");
const { error: wipeVariants } = await supabase.from("halo_variants").delete().neq("id", "00000000-0000-0000-0000-000000000000");
const { error: wipeProducts } = await supabase.from("halo_products").delete().neq("id", "00000000-0000-0000-0000-000000000000");
if (wipeImages || wipeVariants || wipeProducts) {
  console.error(wipeImages?.message ?? wipeVariants?.message ?? wipeProducts?.message);
  process.exit(1);
}

for (const [index, product] of products.entries()) {
  const { data, error } = await supabase
    .from("halo_products")
    .insert({
      slug: product.slug,
      name: product.name,
      subtitle: product.subtitle,
      category: product.category,
      price_cents: product.price * 100,
      compare_at_cents: product.compareAt ? product.compareAt * 100 : null,
      fabric: product.fabric,
      fit: product.fit,
      care: product.care,
      description: product.description,
      badge: product.badge ?? null,
      published: true,
      sort_order: index,
    })
    .select("id")
    .single();
  if (error || !data) {
    console.error(product.slug, error?.message);
    process.exit(1);
  }

  const images = gallery(product).map((url, imageIndex) => ({
    product_id: data.id,
    url,
    alt: product.name,
    sort_order: imageIndex,
  }));
  const { error: imageError } = await supabase.from("halo_product_images").insert(images);
  if (imageError) {
    console.error("images", product.slug, imageError.message);
    process.exit(1);
  }

  const variants = [];
  let remaining = product.stock;
  for (const color of product.colors) {
    for (const size of product.sizes) {
      const qty = remaining > 0 ? 1 : 0;
      if (qty) remaining -= 1;
      variants.push({
        product_id: data.id,
        size,
        color,
        sku: `${product.slug}-${size}-${color}`.toLowerCase().replaceAll(" ", "-").replaceAll("'", ""),
        stock: qty,
        low_stock_at: 2,
      });
    }
  }
  if (remaining > 0 && variants[0]) variants[0].stock += remaining;

  const { error: variantError } = await supabase.from("halo_variants").insert(variants);
  if (variantError) {
    console.error("variants", product.slug, variantError.message);
    process.exit(1);
  }
}

const [{ count: productCount }, { count: variantCount }, { count: imageCount }] = await Promise.all([
  supabase.from("halo_products").select("*", { count: "exact", head: true }),
  supabase.from("halo_variants").select("*", { count: "exact", head: true }),
  supabase.from("halo_product_images").select("*", { count: "exact", head: true }),
]);

console.log(`seeded products=${productCount} variants=${variantCount} images=${imageCount}`);
