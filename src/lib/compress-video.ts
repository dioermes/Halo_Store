import { fetchFile, toBlobURL } from "@ffmpeg/util";

type FfmpegRuntime = {
  loaded: boolean;
  load: (config: Record<string, string>) => Promise<unknown>;
  on: (event: "progress", cb: (data: { progress: number }) => void) => void;
  off: (event: "progress", cb: (data: { progress: number }) => void) => void;
  writeFile: (name: string, data: Uint8Array) => Promise<void>;
  exec: (args: string[]) => Promise<unknown>;
  readFile: (name: string) => Promise<Uint8Array>;
  deleteFile: (name: string) => Promise<void>;
};

const FFMPEG_ESM = "https://unpkg.com/@ffmpeg/ffmpeg@0.12.15/dist/esm";
const CORE_UMD = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd";

let ffmpeg: FfmpegRuntime | null = null;
let loading: Promise<FfmpegRuntime> | null = null;

async function importFfmpegClass() {
  const load = new Function("url", "return import(url)") as (url: string) => Promise<{
    FFmpeg: new () => FfmpegRuntime;
  }>;
  const { FFmpeg } = await load(`${FFMPEG_ESM}/index.js`);
  return FFmpeg;
}

async function getFfmpeg(onStatus?: (message: string) => void) {
  if (ffmpeg?.loaded) return ffmpeg;
  if (!loading) {
    loading = (async () => {
      onStatus?.("Preparo la compressione video…");
      const FFmpeg = await importFfmpegClass();
      const instance = new FFmpeg();
      await instance.load({
        classWorkerURL: `${FFMPEG_ESM}/worker.js`,
        coreURL: await toBlobURL(`${CORE_UMD}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${CORE_UMD}/ffmpeg-core.wasm`, "application/wasm"),
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
    const encode = (edge: number, crf: number, maxRate: string, bufferSize: string) =>
      runtime.exec([
        "-i",
        inputName,
        "-vf",
        `scale=${edge}:${edge}:force_original_aspect_ratio=decrease:force_divisible_by=2`,
        "-c:v",
        "libx264",
        "-profile:v",
        "high",
        "-pix_fmt",
        "yuv420p",
        "-crf",
        String(crf),
        "-maxrate",
        maxRate,
        "-bufsize",
        bufferSize,
        "-preset",
        "veryfast",
        "-movflags",
        "+faststart",
        "-an",
        "-y",
        outputName,
      ]);
    try {
      await encode(1280, 20, "3500k", "7000k");
      const first = await runtime.readFile(outputName);
      if (first.length > 20 * 1024 * 1024) {
        onStatus?.("Video lungo, riduco un po’ il peso…");
        await encode(1280, 22, "2500k", "5000k");
      }
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
