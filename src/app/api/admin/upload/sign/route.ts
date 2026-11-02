import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase";
import { CATALOG_BUCKET, ensureCatalogBucket } from "@/lib/catalog-bucket";
import { createR2UploadUrl, r2Enabled } from "@/lib/r2";

export const runtime = "nodejs";

const MIME_BY_EXT: Record<string, string> = {
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  webp: "image/webp",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  avif: "image/avif",
  gif: "image/gif",
};
const EXTENSIONS = new Set(Object.keys(MIME_BY_EXT));

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

    if (r2Enabled()) {
      const contentType = MIME_BY_EXT[cleanExt];
      const { signedUrl, publicUrl } = await createR2UploadUrl(path, contentType);
      return NextResponse.json({ signedUrl, publicUrl, provider: "r2", contentType });
    }

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
