import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/auth";

export async function GET(req: Request) {
  await requireOwner();
  const src = new URL(req.url).searchParams.get("src") ?? "";
  const supabase = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
  const origin = new URL(req.url).origin;
  const allowed =
    (supabase && src.startsWith(`${supabase}/storage/`)) || src.startsWith(`${origin}/`);
  if (!allowed) {
    return NextResponse.json({ error: "Sorgente non consentita" }, { status: 403 });
  }

  const response = await fetch(src);
  if (!response.ok || !response.body) {
    return NextResponse.json({ error: "Foto non trovata" }, { status: 404 });
  }

  return new Response(response.body, {
    headers: {
      "Content-Type": response.headers.get("Content-Type") ?? "image/jpeg",
      "Cache-Control": "private, max-age=60",
    },
  });
}
