import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase";
import { ensureCatalogBucket } from "@/lib/catalog-bucket";

export const runtime = "nodejs";

const MAX_BYTES = 50 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    await requireOwner();
    const body = (await req.json()) as {
      filename?: string;
      contentType?: string;
      size?: number;
    };
    const size = Number(body.size ?? 0);
    if (!Number.isFinite(size) || size <= 0) {
      return NextResponse.json({ error: "File mancante." }, { status: 400 });
    }
    if (size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Il file supera 50 MB. Comprimi il video (H.264, 1080p) e riprova." },
        { status: 413 },
      );
    }

    const rawName = (body.filename ?? "media.bin").split(/[/\\]/).pop() ?? "media.bin";
    const ext = (rawName.split(".").pop() ?? "bin").toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const admin = createAdminClient();
    await ensureCatalogBucket();
    const { data, error } = await admin.storage.from("halo-catalog").createSignedUploadUrl(path);
    if (error || !data) {
      return NextResponse.json({ error: error?.message ?? "Upload non preparato." }, { status: 500 });
    }
    const { data: published } = admin.storage.from("halo-catalog").getPublicUrl(path);
    return NextResponse.json({
      path: data.path,
      token: data.token,
      signedUrl: data.signedUrl,
      publicUrl: published.publicUrl,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Caricamento non riuscito.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
