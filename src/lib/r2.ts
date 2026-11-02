import { DeleteObjectsCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function config() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET;
  const publicUrl = process.env.R2_PUBLIC_URL?.replace(/\/+$/, "");
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicUrl) return null;
  return { accountId, accessKeyId, secretAccessKey, bucket, publicUrl };
}

export function r2Enabled() {
  return config() !== null;
}

function client(cfg: NonNullable<ReturnType<typeof config>>) {
  return new S3Client({
    region: "auto",
    endpoint: `https://${cfg.accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: cfg.accessKeyId, secretAccessKey: cfg.secretAccessKey },
  });
}

export async function createR2UploadUrl(key: string, contentType: string) {
  const cfg = config();
  if (!cfg) throw new Error("R2 non configurato.");
  const signedUrl = await getSignedUrl(
    client(cfg),
    new PutObjectCommand({
      Bucket: cfg.bucket,
      Key: key,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
    { expiresIn: 600 },
  );
  return { signedUrl, publicUrl: `${cfg.publicUrl}/${key}` };
}

export function r2ObjectKey(url: string): string | null {
  const cfg = config();
  if (!cfg) return null;
  const trimmed = url.trim();
  if (!trimmed.startsWith(`${cfg.publicUrl}/`)) return null;
  try {
    const key = decodeURIComponent(new URL(trimmed).pathname.replace(/^\/+/, ""));
    return key && !key.includes("..") ? key : null;
  } catch {
    return null;
  }
}

export async function deleteR2Objects(urls: string[]) {
  const cfg = config();
  if (!cfg) return;
  const keys = [...new Set(urls.map(r2ObjectKey).filter((key): key is string => Boolean(key)))];
  if (!keys.length) return;
  try {
    await client(cfg).send(
      new DeleteObjectsCommand({
        Bucket: cfg.bucket,
        Delete: { Objects: keys.map((Key) => ({ Key })), Quiet: true },
      }),
    );
  } catch (error) {
    console.error("[r2 delete]", error instanceof Error ? error.message : error);
  }
}
