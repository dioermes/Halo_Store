import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase";
import { ensureCatalogBucket } from "@/lib/catalog-bucket";
import { compressAdminImage } from "@/lib/compress-image";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 50 * 1024 * 1024;

function safeName(filename: string, ext: string) {
  const base = filename.split(/[/\\]/).pop()?.replace(/\.[^.]+$/, "") ?? "media";
  const slug = base.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "media";
  return `${Date.now()}-${Math.random().toString(36).slice(2)}-${slug}.${ext}`;
}

export async function POST(req: Request) {
  try {
    await requireOwner();
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File) || !file.size) {
      return NextResponse.json({ error: "File mancante." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Il file supera 50 MB. Usa un video più corto e riprova." },
        { status: 413 },
      );
    }

    const type = file.type || "application/octet-stream";
    const bytes = Buffer.from(await file.arrayBuffer());
    let body: Buffer = bytes;
    let contentType = type;
    let ext = (file.name.split(".").pop() ?? "bin").toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";

    if (type.startsWith("image/")) {
      const compressed = await compressAdminImage(bytes);
      body = Buffer.from(compressed.buffer);
      contentType = compressed.contentType;
      ext = compressed.ext;
    } else if (!type.startsWith("video/")) {
      return NextResponse.json({ error: "Carica una foto o un video." }, { status: 400 });
    } else {
      contentType = "video/mp4";
      ext = "mp4";
    }

    const path = safeName(file.name, ext);
    const admin = createAdminClient();
    await ensureCatalogBucket();
    const { error } = await admin.storage.from("halo-catalog").upload(path, body, {
      contentType,
      upsert: false,
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const { data: published } = admin.storage.from("halo-catalog").getPublicUrl(path);
    return NextResponse.json({ publicUrl: published.publicUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Caricamento non riuscito.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
