import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

const CORE_UMD = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd";

let ffmpeg: FFmpeg | null = null;
let loading: Promise<FFmpeg> | null = null;

function asError(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error;
  if (typeof error === "string" && error.trim()) return new Error(error);
  return new Error(fallback);
}

function withTimeout<T>(promise: Promise<T>, ms: number, message: string) {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        window.clearTimeout(timer);
        reject(asError(error, message));
      },
    );
  });
}

async function getFfmpeg(onStatus?: (message: string) => void) {
  if (ffmpeg?.loaded) return ffmpeg;
  if (!loading) {
    loading = (async () => {
      onStatus?.("Preparo la compressione video…");
      const instance = new FFmpeg();
      await withTimeout(
        instance.load({
          coreURL: await toBlobURL(`${CORE_UMD}/ffmpeg-core.js`, "text/javascript"),
          wasmURL: await toBlobURL(`${CORE_UMD}/ffmpeg-core.wasm`, "application/wasm"),
        }),
        90_000,
        "La compressione non è partita. Ricarica la pagina e riprova.",
      );
      ffmpeg = instance;
      return instance;
    })().catch((error) => {
      loading = null;
      throw asError(error, "Impossibile avviare la compressione video.");
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
    } catch (error) {
      throw asError(error, "Compressione video non riuscita. Prova un clip più corto.");
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
