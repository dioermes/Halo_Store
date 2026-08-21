import { createPublicClient } from "@/lib/supabase";

const MAX_BYTES = 50 * 1024 * 1024;

async function readJson(response: Response) {
  const raw = await response.text();
  if (!raw) {
    throw new Error(
      response.ok
        ? "Risposta vuota dal server."
        : `Caricamento non riuscito (${response.status}).`,
    );
  }
  try {
    return JSON.parse(raw) as {
      error?: string;
      path?: string;
      token?: string;
      publicUrl?: string;
    };
  } catch {
    throw new Error("Risposta non valida dal server.");
  }
}

export async function uploadAdminFile(file: File): Promise<string> {
  if (file.size > MAX_BYTES) {
    throw new Error("Il file supera 50 MB. Comprimi il video (H.264, 1080p) e riprova.");
  }

  const sign = await fetch("/api/admin/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type || "application/octet-stream",
      size: file.size,
    }),
  });
  const payload = await readJson(sign);
  if (!sign.ok || !payload.path || !payload.token || !payload.publicUrl) {
    throw new Error(payload.error ?? "Impossibile preparare il caricamento.");
  }

  const { error } = await createPublicClient()
    .storage.from("halo-catalog")
    .uploadToSignedUrl(payload.path, payload.token, file, {
      contentType: file.type || "application/octet-stream",
    });
  if (error) throw new Error(error.message);
  return payload.publicUrl;
}
