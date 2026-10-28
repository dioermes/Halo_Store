const MAX_BYTES = 50 * 1024 * 1024;
const MAX_EDGE = 1400;

async function readJson(response: Response) {
  const raw = await response.text();
  if (!raw) {
    throw new Error(
      response.ok ? "Risposta vuota dal server." : `Caricamento non riuscito (${response.status}).`,
    );
  }
  try {
    return JSON.parse(raw) as { error?: string; signedUrl?: string; publicUrl?: string };
  } catch {
    throw new Error(
      response.status === 413
        ? "Il file è troppo grande per essere caricato."
        : "Risposta non valida dal server.",
    );
  }
}

async function compressImage(file: File): Promise<File> {
  if (file.type === "image/gif") return file;
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.8));
    if (!blob || blob.type !== "image/webp" || blob.size >= file.size) return file;
    return new File([blob], `${file.name.replace(/\.[^.]+$/, "") || "foto"}.webp`, { type: "image/webp" });
  } catch {
    return file;
  }
}

function extensionOf(file: File) {
  if (file.type === "video/mp4") return "mp4";
  if (file.type === "video/webm") return "webm";
  if (file.type === "video/quicktime") return "mov";
  const fromType = file.type.split("/")[1]?.replace("jpeg", "jpg");
  return fromType || file.name.split(".").pop() || "bin";
}

export async function uploadAdminFile(file: File, onStatus?: (message: string) => void) {
  if (file.size > MAX_BYTES) {
    throw new Error("Il file supera 50 MB. Usa un video più corto e riprova.");
  }
  if (!file.type.startsWith("video/") && !file.type.startsWith("image/")) {
    throw new Error("Carica una foto o un video.");
  }

  let payload = file;
  if (file.type.startsWith("video/")) {
    const { compressAdminVideo } = await import("@/lib/compress-video");
    payload = await compressAdminVideo(file, onStatus);
  } else {
    onStatus?.("Comprimo la foto…");
    payload = await compressImage(file);
  }

  onStatus?.("Carico…");
  const signResponse = await fetch("/api/admin/upload/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: payload.name, ext: extensionOf(payload) }),
  });
  const signed = await readJson(signResponse);
  if (!signResponse.ok || !signed.signedUrl || !signed.publicUrl) {
    throw new Error(signed.error ?? "Impossibile preparare il caricamento.");
  }

  const body = new FormData();
  body.append("cacheControl", "31536000");
  body.append("", payload);
  const upload = await fetch(signed.signedUrl, { method: "PUT", body });
  if (!upload.ok) {
    throw new Error(
      upload.status === 413
        ? "Il file è troppo grande per essere caricato."
        : `Caricamento non riuscito (${upload.status}).`,
    );
  }
  return signed.publicUrl;
}
