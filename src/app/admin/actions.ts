"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase";
import { saveStoreSettings } from "@/lib/settings";
import {
  getCatalogMerch,
  addCatalogTag,
  asHexColor,
  dropProductFromHomeSections,
  getSiteAppearance,
  parseHomeSectionsPayload,
  patchSiteAppearance,
  productKey,
  removeProductMerch,
  saveCatalogMerch,
  saveSiteAppearance,
  sanitizeHomeSections,
  setProductMerch,
  type HomeSection,
  type SiteAppearance,
  type SiteMedia,
  type SiteMediaSlot,
} from "@/lib/site";
import { getAllProductsAdmin } from "@/lib/catalog";
import { sendMarketingEmail, sendOrderStatusEmail, statusMailNeeded } from "@/lib/email";
import { getStripe } from "@/lib/stripe";
import type { OrderStatus } from "@/lib/orders";
import { releasePromoForOrder } from "@/lib/promo";
import { unsubscribeUrl } from "@/lib/unsubscribe";
import {
  BUILTIN_CATEGORY_IDS,
  deleteStoreCategory,
  ensureStoreCategory,
  saveCategoryOverride,
  updateStoreCategory,
} from "@/lib/categories";
import type { StoreCategory } from "@/lib/products";

async function admin() {
  await requireOwner();
  return createAdminClient();
}

export type SaveProductState = { error: string };

function saveErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  if (/halo_products_slug|halo_products_pkey/i.test(message) || (/duplicate key|unique/i.test(message) && /slug/i.test(message))) {
    return "Questo indirizzo in vetrina è già usato da un altro capo.";
  }
  if (/halo_images_product_color|halo_product_images/i.test(message)) {
    return "Due foto usano lo stesso nome colore. Dai a ogni colore un nome diverso.";
  }
  if (/halo_variants|sku|product_id.*size.*color/i.test(message)) {
    return "Taglia e colore si ripetono. Controlla le colorazioni e salva di nuovo.";
  }
  if (/duplicate key|unique/i.test(message)) {
    return "Qualche dato del capo è già presente. Controlla taglie, colori e indirizzo in vetrina.";
  }
  if (message) return message;
  return "Non è stato possibile salvare il capo. Riprova.";
}

function isCategoryConstraintError(message: string) {
  return /check constraint|23514|halo_products_category/i.test(message);
}

async function syncProductVariants(
  client: ReturnType<typeof createAdminClient>,
  productId: string,
  variants: Array<{ size: string; color: string; stock: number }>,
) {
  const unique: Array<{ size: string; color: string; stock: number }> = [];
  const seen = new Set<string>();
  for (const variant of variants) {
    const size = variant.size.trim();
    const color = variant.color.trim();
    if (!size || !color) continue;
    const key = `${size.toLowerCase()}::${color.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push({ size, color, stock: Number(variant.stock) || 0 });
  }
  if (!unique.length) {
    throw new Error("Aggiungi almeno una taglia e un colore.");
  }

  const { data: existing, error: readError } = await client
    .from("halo_variants")
    .select("id, size, color")
    .eq("product_id", productId);
  if (readError) throw new Error(readError.message);

  const byKey = new Map(
    (existing ?? []).map((row) => [`${row.size.toLowerCase()}::${row.color.toLowerCase()}`, row]),
  );
  const keep = new Set<string>();

  for (const variant of unique) {
    const key = `${variant.size.toLowerCase()}::${variant.color.toLowerCase()}`;
    const row = byKey.get(key);
    if (row) {
      keep.add(row.id);
      const { error } = await client
        .from("halo_variants")
        .update({ stock: variant.stock, size: variant.size, color: variant.color })
        .eq("id", row.id);
      if (error) throw new Error(error.message);
      continue;
    }
    const sku = `hv-${productId.slice(0, 8)}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const { error } = await client.from("halo_variants").insert({
      product_id: productId,
      size: variant.size,
      color: variant.color,
      stock: variant.stock,
      sku,
      low_stock_at: 2,
    });
    if (error) throw new Error(error.message);
  }

  for (const row of existing ?? []) {
    if (keep.has(row.id)) continue;
    const { error } = await client.from("halo_variants").delete().eq("id", row.id);
    if (error) {
      const { error: zeroError } = await client.from("halo_variants").update({ stock: 0 }).eq("id", row.id);
      if (zeroError) throw new Error(zeroError.message);
    }
  }
}

export async function createCategoryAction(input: {
  id?: string;
  label: string;
  hint?: string;
}): Promise<{ category: StoreCategory } | { error: string }> {
  try {
    await requireOwner();
    const category = await ensureStoreCategory(input);
    revalidatePath("/");
    revalidatePath("/admin/catalogo");
    return { category };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Tipologia non creata." };
  }
}

export async function updateCategoryAction(input: {
  id: string;
  label: string;
  hint?: string;
}): Promise<{ category: StoreCategory } | { error: string }> {
  try {
    await requireOwner();
    const category = await updateStoreCategory(input);
    revalidatePath("/");
    revalidatePath("/admin/catalogo");
    return { category };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Tipologia non aggiornata." };
  }
}

export async function deleteCategoryAction(id: string): Promise<{ ok: true } | { error: string }> {
  try {
    await requireOwner();
    await deleteStoreCategory(id);
    revalidatePath("/");
    revalidatePath("/admin/catalogo");
    return { ok: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Tipologia non eliminata." };
  }
}

export async function saveProductAction(
  _prev: SaveProductState,
  formData: FormData,
): Promise<SaveProductState> {
  let productId = "";
  try {
    const client = await admin();
    const id = String(formData.get("id") ?? "");
    const wantedCategory = String(formData.get("category") ?? "top");
    const payload = {
      slug: String(formData.get("slug") ?? "").trim(),
      name: String(formData.get("name") ?? "").trim(),
      subtitle: String(formData.get("subtitle") ?? "").trim(),
      category: wantedCategory,
      price_cents: Math.round(Number(formData.get("price") ?? 0) * 100),
      compare_at_cents: formData.get("compareAt")
        ? Math.round(Number(formData.get("compareAt")) * 100)
        : null,
      fabric: String(formData.get("fabric") ?? ""),
      fit: String(formData.get("fit") ?? ""),
      care: String(formData.get("care") ?? ""),
      description: String(formData.get("description") ?? ""),
      badge: String(formData.get("badge") ?? "") || null,
      published: formData.get("published") === "on",
      updated_at: new Date().toISOString(),
    };

    if (!payload.name || !payload.slug) {
      return { error: "Servono nome e slug." };
    }

    await ensureStoreCategory({
      id: wantedCategory,
      label: String(formData.get("categoryLabel") ?? "").trim() || wantedCategory,
      hint: String(formData.get("categoryHint") ?? "").trim(),
    });

    productId = id.trim();
    if (!productId) {
      const { data: existing } = await client
        .from("halo_products")
        .select("id")
        .eq("slug", payload.slug)
        .maybeSingle();
      productId = existing?.id ?? "";
    }

    const write = async (category: string) => {
      const row = { ...payload, category };
      if (productId) return client.from("halo_products").update(row).eq("id", productId);
      return client.from("halo_products").insert(row).select("id").single();
    };

    let written = await write(wantedCategory);
    if (written.error && isCategoryConstraintError(written.error.message)) {
      written = await write("top");
      if (written.error) throw new Error(written.error.message);
      if (!productId) {
        const inserted = written.data as { id?: string } | null;
        if (!inserted?.id) throw new Error("Insert failed");
        productId = inserted.id;
      }
      await saveCategoryOverride(productId, wantedCategory);
    } else if (written.error) {
      throw new Error(written.error.message);
    } else {
      if (!productId) {
        const inserted = written.data as { id?: string } | null;
        if (!inserted?.id) throw new Error("Insert failed");
        productId = inserted.id;
      }
      if (BUILTIN_CATEGORY_IDS.includes(wantedCategory)) {
        await saveCategoryOverride(productId, null);
      } else {
        await saveCategoryOverride(productId, wantedCategory);
      }
    }

    const imagesPayload = JSON.parse(String(formData.get("imagesJson") ?? "{}")) as {
      cover?: string;
      colors?: Array<{ name: string; url: string }>;
      extras?: string[];
    };
    const cover = imagesPayload.cover?.trim() || imagesPayload.colors?.find((row) => row.url)?.url || "";
    const colorPhotos: Array<{ name: string; url: string }> = [];
    const colorNames = new Set<string>();
    for (const row of imagesPayload.colors ?? []) {
      const name = row.name.trim();
      if (!name || !row.url) continue;
      const key = name.toLowerCase();
      if (colorNames.has(key)) continue;
      colorNames.add(key);
      colorPhotos.push({ name, url: row.url });
    }
    const extras = (imagesPayload.extras ?? []).filter(
      (url) => url && url !== cover && !colorPhotos.some((row) => row.url === url),
    );

    await client.from("halo_product_images").delete().eq("product_id", productId);
    const imageRows = [
      ...(cover
        ? [{ product_id: productId, url: cover, alt: payload.name, sort_order: 0, color: null as string | null }]
        : []),
      ...extras.map((url, index) => ({
        product_id: productId,
        url,
        alt: payload.name,
        sort_order: index + 1,
        color: null as string | null,
      })),
      ...colorPhotos.map((row, index) => ({
        product_id: productId,
        url: row.url,
        alt: `color:${row.name}`,
        sort_order: extras.length + index + 1,
        color: row.name,
      })),
    ];
    if (imageRows.length) {
      const { error: imageError } = await client.from("halo_product_images").insert(imageRows);
      if (imageError) {
        const fallback = imageRows.map(({ product_id, url, alt, sort_order }) => ({
          product_id,
          url,
          alt,
          sort_order,
        }));
        const { error: retryError } = await client.from("halo_product_images").insert(fallback);
        if (retryError) throw new Error(retryError.message);
      }
    }

    const variantsRaw = String(formData.get("variantsJson") ?? "[]");
    const variants = JSON.parse(variantsRaw) as Array<{
      size: string;
      color: string;
      stock: number;
    }>;
    await syncProductVariants(client, productId, variants);

    const merch = await getCatalogMerch();
    const badge = String(formData.get("badge") ?? "");
    const price = Number(formData.get("price") ?? 0);
    const compareRaw = String(formData.get("compareAt") ?? "").trim();
    const compareAt = compareRaw === "" ? 0 : Number(compareRaw);
    const discounted = Boolean(compareAt && compareAt > price);
    let customTagIds: string[] = [];
    try {
      const parsed = JSON.parse(String(formData.get("customTagIds") ?? "[]"));
      customTagIds = Array.isArray(parsed)
        ? parsed.filter((id): id is string => typeof id === "string" && id.length > 0)
        : [];
    } catch {
      customTagIds = [];
    }
    await saveCatalogMerch(
      setProductMerch(merch, productId, {
        newArrival: formData.get("isNewArrival") === "on" || /nuovo arrivo/i.test(badge),
        bestseller: formData.get("isBestseller") === "on" || /best seller/i.test(badge),
        sale: discounted || formData.get("isOnSale") === "on" || /saldi|sconto/i.test(badge),
        keywords: String(formData.get("searchKeywords") ?? ""),
        customTagIds,
      }),
    );
  } catch (error) {
    return { error: saveErrorMessage(error) };
  }

  revalidatePath("/");
  revalidatePath("/catalogo");
  revalidatePath("/admin");
  revalidatePath("/admin/catalogo");
  revalidatePath("/admin/sito");
  redirect(`/admin/catalogo/${productId}?salvato=1`);
}

export async function createCatalogTagAction(label: string) {
  await requireOwner();
  const merch = await getCatalogMerch();
  const next = addCatalogTag(merch, label);
  await saveCatalogMerch(next.merch);
  revalidatePath("/admin/catalogo");
  revalidatePath("/admin/sito");
  revalidatePath("/");
  return next.tag;
}

export async function togglePublishedAction(id: string, published: boolean) {
  const client = await admin();
  await client.from("halo_products").update({ published, updated_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/catalogo");
  revalidatePath("/admin/sito");
}

export async function togglePublishedFormAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const published = String(formData.get("published") ?? "") === "1";
  await togglePublishedAction(id, published);
}

export async function deleteProductAction(formData: FormData) {
  const client = await admin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) throw new Error("Capo mancante.");

  const { data: variants } = await client.from("halo_variants").select("id").eq("product_id", id);
  const variantIds = (variants ?? []).map((row) => row.id);
  if (variantIds.length) {
    await client.from("halo_stock_holds").delete().in("variant_id", variantIds);
    await client.from("halo_order_items").update({ variant_id: null }).in("variant_id", variantIds);
  }

  const { error } = await client.from("halo_products").delete().eq("id", id);
  if (error) throw new Error(error.message);

  const merch = await getCatalogMerch();
  await saveCatalogMerch(removeProductMerch(merch, id));
  const appearance = await getSiteAppearance();
  await saveSiteAppearance({
    ...appearance,
    homeSections: dropProductFromHomeSections(appearance.homeSections, id),
  });
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/catalogo");
  revalidatePath("/admin/sito");
}

export async function updateOrderAction(formData: FormData) {
  const client = await admin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as OrderStatus;
  const trackingCode = String(formData.get("trackingCode") ?? "").trim() || null;
  const trackingCarrier = String(formData.get("trackingCarrier") ?? "").trim() || null;

  const { data: current } = await client
    .from("halo_orders")
    .select("*, halo_customers(*), halo_order_items(*)")
    .eq("id", id)
    .single();
  if (!current) throw new Error("Ordine non trovato");

  if (status === "refunded" && current.status !== "refunded") {
    await releasePromoForOrder(id);
    if (current.stripe_payment_intent) {
      const stripe = getStripe();
      await stripe.refunds.create({ payment_intent: current.stripe_payment_intent });
    }
  }
  if (status === "cancelled" && current.status !== "cancelled") {
    await releasePromoForOrder(id);
    if (current.status === "pending_payment") {
      await client.rpc("halo_release_order_holds", { p_order_id: id });
    } else if (
      current.fulfillment === "pickup" &&
      (current.status === "preparing" || current.status === "ready_for_pickup")
    ) {
      for (const item of current.halo_order_items as Array<{
        variant_id: string | null;
        quantity: number;
      }>) {
        if (!item.variant_id) continue;
        const { data: variant } = await client
          .from("halo_variants")
          .select("id, stock")
          .eq("id", item.variant_id)
          .maybeSingle();
        if (variant) {
          await client
            .from("halo_variants")
            .update({ stock: variant.stock + item.quantity })
            .eq("id", variant.id);
        }
      }
    }
  }

  await client
    .from("halo_orders")
    .update({
      status,
      tracking_code: trackingCode,
      tracking_carrier: trackingCarrier,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  let mailed = false;
  if (statusMailNeeded(status) && status !== "paid") {
    const mail = await sendOrderStatusEmail({
      id: current.id,
      email: current.halo_customers?.email ?? "",
      name: current.halo_customers?.full_name,
      status,
      fulfillment: current.fulfillment,
      totalCents: current.total_cents,
      shippingCents: current.shipping_cents,
      trackingCode,
      trackingCarrier,
      items: current.halo_order_items.map((item: { product_name: string; size: string; color: string; quantity: number; unit_price_cents: number }) => ({
        name: item.product_name,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        unitPriceCents: item.unit_price_cents,
      })),
    });
    mailed = mail.ok;
    if (!mail.ok) {
      console.error("[order status email]", status, current.id, mail.reason);
    }
  }

  revalidatePath("/admin/ordini");
  revalidatePath(`/admin/ordini/${id}`);
  const query = new URLSearchParams({ ok: "1", stato: status });
  if (statusMailNeeded(status) && status !== "paid") {
    query.set("mail", mailed ? "1" : "0");
  }
  redirect(`/admin/ordini/${id}?${query.toString()}`);
}

export async function saveSettingsAction(formData: FormData) {
  await requireOwner();
  const clampPercent = (value: unknown, fallback: number) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    return Math.min(80, Math.max(0, Math.round(n)));
  };
  const code = (value: unknown, fallback: string) => {
    const next = String(value ?? "")
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "");
    return next || fallback;
  };
  await saveStoreSettings({
    shippingItalyCents: Math.round(Number(formData.get("shipping")) * 100),
    lowStockAt: Number(formData.get("lowStockAt") ?? 2),
    holdMinutes: Number(formData.get("holdMinutes") ?? 20),
    newsletterDiscountPercent: clampPercent(formData.get("newsletterPercent"), 10),
    newsletterCode: code(formData.get("newsletterCode"), "HALO10"),
    birthdayDiscountPercent: clampPercent(formData.get("birthdayPercent"), 15),
    birthdayCode: code(formData.get("birthdayCode"), "COMPLEANNO"),
    birthdayValidDays: Math.min(60, Math.max(1, Number(formData.get("birthdayValidDays") ?? 14))),
  });
  revalidatePath("/admin/impostazioni");
}

export async function saveSiteAppearanceAction(formData: FormData) {
  await requireOwner();
  const current = await getSiteAppearance();
  const media = (prefix: SiteMediaSlot) => {
    const url = String(formData.get(`${prefix}Url`) ?? "").trim();
    const kind = String(formData.get(`${prefix}Kind`) ?? "image") === "video" ? "video" : "image";
    if (!url) return current[prefix];
    return { url, kind } satisfies SiteMedia;
  };
  const catalog = await getAllProductsAdmin();
  let parsed: unknown = current.homeSections;
  try {
    parsed = JSON.parse(String(formData.get("homeSections") ?? "[]"));
  } catch {
    parsed = current.homeSections;
  }
  const next: SiteAppearance = {
    heroDesktop: media("heroDesktop"),
    heroMobile: media("heroMobile"),
    homeSections: sanitizeHomeSections(parseHomeSectionsPayload(parsed), catalog),
    soldOutBadgeBg: asHexColor(formData.get("soldOutBadgeBg"), current.soldOutBadgeBg),
    soldOutBadgeFg: asHexColor(formData.get("soldOutBadgeFg"), current.soldOutBadgeFg),
  };
  await saveSiteAppearance(next);
  revalidatePath("/");
  revalidatePath("/catalogo");
  revalidatePath("/admin/sito");
  redirect("/admin/sito?salvato=1");
}

export async function saveSiteMediaSlotAction(
  slot: SiteMediaSlot,
  url: string,
  kind: "image" | "video",
) {
  await requireOwner();
  const slots: SiteMediaSlot[] = ["heroDesktop", "heroMobile"];
  if (!url || !slots.includes(slot)) {
    throw new Error("Media non valido.");
  }
  await patchSiteAppearance({ [slot]: { url, kind } });
  revalidatePath("/");
  revalidatePath("/admin/sito");
}

export async function saveHomeSectionInterludeAction(
  sectionId: string,
  url: string,
  kind: "image" | "video",
) {
  await requireOwner();
  if (!url || !sectionId) throw new Error("Media non valido.");
  const current = await getSiteAppearance();
  if (!current.homeSections.some((section) => section.id === sectionId)) return;
  const homeSections: HomeSection[] = current.homeSections.map((section) =>
    section.id === sectionId ? { ...section, interlude: { url, kind } } : section,
  );
  await saveSiteAppearance({ ...current, homeSections });
  revalidatePath("/");
  revalidatePath("/admin/sito");
}

export async function sendNewsletterAction(formData: FormData) {
  const client = await admin();
  const subject = String(formData.get("subject") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!subject || !body) throw new Error("Oggetto e testo obbligatori");

  const emails = new Set<string>();

  const { data: rows } = await client
    .from("halo_consents")
    .select("email_marketing, halo_customers(email)")
    .eq("email_marketing", true);

  for (const row of rows ?? []) {
    const customer = row.halo_customers as { email?: string } | { email?: string }[] | null;
    const email = Array.isArray(customer) ? customer[0]?.email : customer?.email;
    if (email) emails.add(email.toLowerCase());
  }

  const { data: subscribers } = await client
    .from("halo_subscribers")
    .select("email")
    .eq("marketing_opt_in", true);
  for (const row of subscribers ?? []) {
    if (row.email) emails.add(String(row.email).toLowerCase());
  }

  for (const email of emails) {
    const unsub = unsubscribeUrl(email);
    await sendMarketingEmail(email, subject, `<p style="white-space:pre-wrap">${body}</p>`, unsub);
  }
  revalidatePath("/admin/impostazioni");
}
