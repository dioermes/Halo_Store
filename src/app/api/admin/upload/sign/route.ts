import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase";
import { CATALOG_BUCKET, ensureCatalogBucket } from "@/lib/catalog-bucket";

export const runtime = "nodejs";

const EXTENSIONS = new Set(["mp4", "webm", "mov", "webp", "jpg", "jpeg", "png", "avif", "gif"]);

export async function POST(req: Request) {
  try {
    await requireOwner();
    const { name, ext } = (await req.json()) as { name?: string; ext?: string };
    const cleanExt = (ext ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!EXTENSIONS.has(cleanExt)) {
      return NextResponse.json({ error: "Carica una foto o un video." }, { status: 400 });
    }
    const slug =
      (name ?? "media")
        .replace(/\.[^.]+$/, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 60) || "media";
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}-${slug}.${cleanExt}`;

    const admin = createAdminClient();
    await ensureCatalogBucket();
    const { data, error } = await admin.storage.from(CATALOG_BUCKET).createSignedUploadUrl(path);
    if (error || !data) {
      return NextResponse.json({ error: error?.message ?? "Impossibile preparare il caricamento." }, { status: 500 });
    }
    const { data: published } = admin.storage.from(CATALOG_BUCKET).getPublicUrl(path);
    return NextResponse.json({ signedUrl: data.signedUrl, publicUrl: published.publicUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Caricamento non riuscito.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
