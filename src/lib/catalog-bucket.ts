import { createAdminClient } from "@/lib/supabase";

export const CATALOG_BUCKET = "halo-catalog";

const CATALOG_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

export async function ensureCatalogBucket() {
  const admin = createAdminClient();
  const { error } = await admin.storage.updateBucket(CATALOG_BUCKET, {
    public: true,
    fileSizeLimit: 50 * 1024 * 1024,
    allowedMimeTypes: CATALOG_MIMES,
  });
  if (error) console.error("[halo-catalog bucket]", error.message);
}

/** Path inside halo-catalog, or null if the URL is not a file we uploaded. */
export function catalogObjectPath(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed.startsWith("http")) return null;
  try {
    const parsed = new URL(trimmed);
    const marker = `/storage/v1/object/public/${CATALOG_BUCKET}/`;
    const at = parsed.pathname.indexOf(marker);
    if (at === -1) return null;
    const path = decodeURIComponent(parsed.pathname.slice(at + marker.length));
    if (!path || path.includes("..") || path.startsWith("/")) return null;
    return path;
  } catch {
    return null;
  }
}

export async function deleteCatalogObjects(urls: string[]) {
  const unique = [...new Set(urls.map(catalogObjectPath).filter((path): path is string => Boolean(path)))];
  if (!unique.length) return;
  const admin = createAdminClient();
  const { error } = await admin.storage.from(CATALOG_BUCKET).remove(unique);
  if (error) console.error("[halo-catalog delete]", error.message);
}
