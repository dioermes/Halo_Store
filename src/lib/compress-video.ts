import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

const CORE_MIRRORS = [
  "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd",
  "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd",
];

const ENCODE_MS = 180_000;
const LOAD_MS = 120_000;

let ffmpeg: FFmpeg | null = null;
let loading: Promise<FFmpeg> | null = null;

export type CompressedVideo = { mobile: File; hd: File | null };

function asError(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) return error;
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

function resetFfmpeg() {
  try {
    ffmpeg?.terminate();
  } catch {
    /* ignore */
  }
  ffmpeg = null;
  loading = null;
}

async function loadFrom(base: string) {
  const instance = new FFmpeg();
  await instance.load({
    coreURL: await toBlobURL(`${base}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${base}/ffmpeg-core.wasm`, "application/wasm"),
  });
  return instance;
}

async function getFfmpeg(onStatus?: (message: string) => void) {
  if (ffmpeg?.loaded) return ffmpeg;
  if (!loading) {
    loading = (async () => {
      onStatus?.("Preparo la compressione video…");
      let lastError: unknown;
      for (const base of CORE_MIRRORS) {
        try {
          const instance = await withTimeout(
            loadFrom(base),
            LOAD_MS,
            "La compressione non è partita. Ricarica la pagina e riprova.",
          );
          ffmpeg = instance;
          return instance;
        } catch (error) {
          lastError = error;
        }
      }
      throw asError(lastError, "Impossibile avviare la compressione video.");
    })().catch((error) => {
      loading = null;
      throw asError(error, "Impossibile avviare la compressione video.");
    });
  }
  return loading;
}

function toMp4(data: Uint8Array, name: string) {
  const copy = new Uint8Array(data.byteLength);
  copy.set(data);
  const blob = new Blob([copy], { type: "video/mp4" });
  if (blob.size < 64) {
    throw new Error("Compressione video non riuscita. Prova un clip più corto.");
  }
  return new File([blob], name, { type: "video/mp4" });
}

async function encode(
  runtime: FFmpeg,
  inputName: string,
  outputName: string,
  edge: number,
  crf: number,
  rate?: { maxRate: string; bufferSize: string },
) {
  const args = [
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
  ];
  if (rate) {
    args.push("-maxrate", rate.maxRate, "-bufsize", rate.bufferSize);
  }
  args.push("-preset", "veryfast", "-movflags", "+faststart", "-an", "-y", outputName);
  const code = await withTimeout(
    runtime.exec(args, ENCODE_MS),
    ENCODE_MS + 5_000,
    "La compressione sta impiegando troppo. Prova un clip più corto.",
  );
  if (code !== 0) {
    throw new Error("Compressione video non riuscita. Prova un clip più corto o un altro formato (MP4).");
  }
}

async function readOutput(runtime: FFmpeg, name: string, fileName: string) {
  const data = await runtime.readFile(name);
  const bytes = data instanceof Uint8Array ? data : new Uint8Array();
  const file = toMp4(bytes, fileName);
  await runtime.deleteFile(name).catch(() => undefined);
  return file;
}

export async function compressAdminVideo(file: File, onStatus?: (message: string) => void): Promise<CompressedVideo> {
  const runtime = await getFfmpeg(onStatus);
  const logs: string[] = [];
  const onLog = ({ message }: { message: string }) => {
    if (message) logs.push(message.slice(0, 200));
  };
  const onProgress = ({ progress }: { progress: number }) => {
    const percent = Math.min(99, Math.round((progress || 0) * 100));
    onStatus?.(`Comprimo il video… ${percent}%`);
  };
  runtime.on("log", onLog);
  runtime.on("progress", onProgress);
  const inputName = "input.bin";
  const mobileName = "out-m.mp4";
  const hdName = "out-h.mp4";
  try {
    await runtime.writeFile(inputName, await fetchFile(file));
    onStatus?.("Comprimo la versione telefono… può richiedere un minuto");
    try {
      await encode(runtime, inputName, mobileName, 1280, 18);
    } catch {
      onStatus?.("Riprovo con un file più leggero…");
      await encode(runtime, inputName, mobileName, 960, 23);
    }
    const mobile = await readOutput(runtime, mobileName, "video.mp4");

    onStatus?.("Comprimo la versione HD…");
    let hd: File | null = null;
    try {
      await encode(runtime, inputName, hdName, 1920, 18, { maxRate: "8000k", bufferSize: "16000k" });
      hd = await readOutput(runtime, hdName, "video-hd.mp4");
    } catch {
      hd = null;
    }

    await runtime.deleteFile(inputName).catch(() => undefined);
    return { mobile, hd };
  } catch (error) {
    await resetFfmpeg();
    const detail = logs.at(-1);
    throw asError(
      error,
      detail
        ? "Compressione video non riuscita. Prova un clip più corto o un MP4."
        : "Compressione video non riuscita. Ricarica la pagina e riprova.",
    );
  } finally {
    runtime.off("log", onLog);
    runtime.off("progress", onProgress);
  }
}
