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
    return JSON.parse(raw) as { error?: string; publicUrl?: string };
  } catch {
    throw new Error("Risposta non valida dal server.");
  }
}

export async function uploadAdminFile(file: File, onStatus?: (message: string) => void) {
  if (file.size > MAX_BYTES) {
    throw new Error("Il file supera 50 MB. Usa un video più corto e riprova.");
  }

  let payload = file;
  if (file.type.startsWith("video/")) {
    const { compressAdminVideo } = await import("@/lib/compress-video");
    payload = await compressAdminVideo(file, onStatus);
  } else {
    onStatus?.("Comprimo la foto…");
  }

  onStatus?.("Carico…");
  const body = new FormData();
  body.append("file", payload);
  const sign = await fetch("/api/admin/upload", { method: "POST", body });
  const data = await readJson(sign);
  if (!sign.ok || !data.publicUrl) {
    throw new Error(data.error ?? "Impossibile caricare il file.");
  }
  return data.publicUrl;
}
