import sharp from "sharp";

const MAX_EDGE = 1400;
const TARGET_BYTES = 420_000;

export async function compressAdminImage(input: Buffer) {
  const meta = await sharp(input, { failOn: "none", animated: false }).rotate().metadata();
  const width = meta.width ?? MAX_EDGE;
  const height = meta.height ?? MAX_EDGE;
  const longEdge = Math.max(width, height);

  const encode = (quality: number) => {
    let pipeline = sharp(input, { failOn: "none", animated: false }).rotate();
    if (longEdge > MAX_EDGE) {
      pipeline = pipeline.resize({
        width: width >= height ? MAX_EDGE : undefined,
        height: height > width ? MAX_EDGE : undefined,
        fit: "inside",
        withoutEnlargement: true,
      });
    }
    return pipeline.webp({ quality, effort: 4 }).toBuffer();
  };

  let quality = 78;
  let output = await encode(quality);
  while (output.length > TARGET_BYTES && quality > 48) {
    quality -= 8;
    output = await encode(quality);
  }

  const alreadySmall =
    output.length >= input.length &&
    longEdge <= MAX_EDGE &&
    (meta.format === "jpeg" || meta.format === "webp");
  if (alreadySmall) {
    return {
      buffer: input,
      contentType: meta.format === "webp" ? "image/webp" : "image/jpeg",
      ext: meta.format === "webp" ? "webp" : "jpg",
    };
  }

  return { buffer: output, contentType: "image/webp" as const, ext: "webp" };
}
