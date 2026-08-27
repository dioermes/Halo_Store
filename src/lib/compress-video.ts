import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

let ffmpeg: FFmpeg | null = null;
let loading: Promise<FFmpeg> | null = null;

async function getFfmpeg(onStatus?: (message: string) => void) {
  if (ffmpeg?.loaded) return ffmpeg;
  if (!loading) {
    loading = (async () => {
      onStatus?.("Preparo la compressione video…");
      const instance = new FFmpeg();
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd";
      await instance.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      });
      ffmpeg = instance;
      return instance;
    })().catch((error) => {
      loading = null;
      throw error;
    });
  }
  return loading;
}

export async function compressAdminVideo(file: File, onStatus?: (message: string) => void) {
  const runtime = await getFfmpeg(onStatus);
  onStatus?.("Comprimo il video… può richiedere un minuto");
  const onProgress = ({ progress }: { progress: number }) => {
    const percent = Math.min(99, Math.round((progress || 0) * 100));
    onStatus?.(`Comprimo il video… ${percent}%`);
  };
  runtime.on("progress", onProgress);
  try {
    const inputName = "input.bin";
    const outputName = "output.mp4";
    await runtime.writeFile(inputName, await fetchFile(file));
    try {
      await runtime.exec([
        "-i",
        inputName,
        "-vf",
        "scale=1280:1280:force_original_aspect_ratio=decrease:force_divisible_by=2",
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-crf",
        "28",
        "-preset",
        "veryfast",
        "-movflags",
        "+faststart",
        "-an",
        outputName,
      ]);
    } catch {
      throw new Error("Compressione video non riuscita. Prova un clip più corto.");
    }
    const data = await runtime.readFile(outputName);
    await runtime.deleteFile(inputName).catch(() => undefined);
    await runtime.deleteFile(outputName).catch(() => undefined);
    const bytes = data instanceof Uint8Array ? data : new Uint8Array();
    const copy = new Uint8Array(bytes.byteLength);
    copy.set(bytes);
    const blob = new Blob([copy], { type: "video/mp4" });
    if (blob.size < 64) {
      throw new Error("Compressione video non riuscita. Prova un clip più corto.");
    }
    return new File([blob], `${file.name.replace(/\.[^.]+$/, "") || "video"}.mp4`, { type: "video/mp4" });
  } finally {
    runtime.off("progress", onProgress);
  }
}
