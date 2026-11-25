import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

const CORE_MIRRORS = [
  "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd",
  "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd",
];

const ENCODE_MS = 300_000;
const REMUX_MS = 60_000;
const LOAD_MS = 120_000;
const MIN_OUTPUT = 64;
export const MAX_ORIGINAL_UPLOAD_BYTES = 80 * 1024 * 1024;

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
  if (blob.size < MIN_OUTPUT) {
    throw new Error("Compressione video non riuscita. Prova un clip più corto.");
  }
  return new File([blob], name, { type: "video/mp4" });
}

export function canUploadOriginalVideo(file: File) {
  const name = file.name.toLowerCase();
  const typeOk =
    file.type === "video/mp4" ||
    file.type === "video/quicktime" ||
    name.endsWith(".mp4") ||
    name.endsWith(".mov");
  return typeOk && file.size >= MIN_OUTPUT && file.size <= MAX_ORIGINAL_UPLOAD_BYTES;
}

async function memfsSize(runtime: FFmpeg, name: string) {
  try {
    const data = await runtime.readFile(name);
    return data instanceof Uint8Array ? data.byteLength : 0;
  } catch {
    return 0;
  }
}

async function readOutput(runtime: FFmpeg, name: string, fileName: string) {
  const data = await runtime.readFile(name);
  const bytes = data instanceof Uint8Array ? data : new Uint8Array();
  const file = toMp4(bytes, fileName);
  await runtime.deleteFile(name).catch(() => undefined);
  return file;
}

async function remuxFaststart(runtime: FFmpeg, rawName: string, outputName: string) {
  const fastName = `${outputName}.fast.mp4`;
  try {
    await withTimeout(
      runtime.exec(["-i", rawName, "-c", "copy", "-movflags", "+faststart", "-y", fastName]),
      REMUX_MS,
      "La compressione sta impiegando troppo. Prova un clip più corto.",
    );
    if ((await memfsSize(runtime, fastName)) >= MIN_OUTPUT) {
      await runtime.deleteFile(rawName).catch(() => undefined);
      await runtime.rename(fastName, outputName).catch(() => undefined);
      if ((await memfsSize(runtime, outputName)) >= MIN_OUTPUT) return;
    }
    await runtime.deleteFile(fastName).catch(() => undefined);
  } catch {
    await runtime.deleteFile(fastName).catch(() => undefined);
  }
  if (rawName !== outputName) {
    await runtime.rename(rawName, outputName).catch(() => undefined);
  }
}

async function encode(
  runtime: FFmpeg,
  inputName: string,
  outputName: string,
  edge: number,
  crf: number,
) {
  const rawName = `${outputName}.raw.mp4`;
  await runtime.deleteFile(rawName).catch(() => undefined);
  await runtime.deleteFile(outputName).catch(() => undefined);
  const args = [
    "-i",
    inputName,
    "-vf",
    `scale=${edge}:${edge}:force_original_aspect_ratio=decrease:force_divisible_by=2`,
    "-fpsmax",
    "30",
    "-c:v",
    "libx264",
    "-preset",
    "ultrafast",
    "-profile:v",
    "high",
    "-pix_fmt",
    "yuv420p",
    "-crf",
    String(crf),
    "-an",
    "-y",
    rawName,
  ];
  let timedOut = false;
  const code = await withTimeout(runtime.exec(args), ENCODE_MS, "timeout").catch((error) => {
    timedOut = true;
    return asError(error, "timeout");
  });
  if (typeof code !== "number") {
    timedOut = true;
  }
  const size = await memfsSize(runtime, rawName);
  if (size >= MIN_OUTPUT) {
    await remuxFaststart(runtime, rawName, outputName);
    if ((await memfsSize(runtime, outputName)) >= MIN_OUTPUT) return;
    if ((await memfsSize(runtime, rawName)) >= MIN_OUTPUT) {
      await runtime.rename(rawName, outputName).catch(() => undefined);
      if ((await memfsSize(runtime, outputName)) >= MIN_OUTPUT) return;
    }
  }
  await runtime.deleteFile(rawName).catch(() => undefined);
  await runtime.deleteFile(outputName).catch(() => undefined);
  if (timedOut || code === 1) {
    throw new Error("La compressione sta impiegando troppo. Prova un clip più corto.");
  }
  throw new Error("Compressione video non riuscita. Prova un clip più corto o un altro formato (MP4).");
}

async function encodeIfPossible(
  runtime: FFmpeg,
  inputName: string,
  outputName: string,
  edge: number,
  crf: number,
) {
  try {
    await encode(runtime, inputName, outputName, edge, crf);
    return (await memfsSize(runtime, outputName)) >= MIN_OUTPUT;
  } catch {
    return false;
  }
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
    onStatus?.("Comprimo la versione telefono… può richiedere qualche minuto");
    let mobileOk = await encodeIfPossible(runtime, inputName, mobileName, 1280, 23);
    if (!mobileOk) {
      onStatus?.("Riprovo con un file più leggero…");
      mobileOk = await encodeIfPossible(runtime, inputName, mobileName, 960, 28);
    }

    let mobile: File;
    if (mobileOk) {
      mobile = await readOutput(runtime, mobileName, "video.mp4");
    } else if (canUploadOriginalVideo(file)) {
      onStatus?.("Salvo il file originale (compressione troppo pesante)…");
      await runtime.deleteFile(inputName).catch(() => undefined);
      resetFfmpeg();
      return { mobile: file, hd: null };
    } else {
      throw new Error("Compressione video non riuscita. Prova un clip più corto o un MP4 sotto i 80 MB.");
    }

    onStatus?.("Comprimo la versione HD…");
    let hd: File | null = null;
    try {
      const hdOk = await encodeIfPossible(runtime, inputName, hdName, 1920, 23);
      if (hdOk) hd = await readOutput(runtime, hdName, "video-hd.mp4");
    } catch {
      hd = null;
    }
    if (!hd && canUploadOriginalVideo(file)) {
      onStatus?.("Uso il file originale per il PC…");
      hd = file;
    }

    await runtime.deleteFile(inputName).catch(() => undefined);
    await runtime.deleteFile(mobileName).catch(() => undefined);
    await runtime.deleteFile(hdName).catch(() => undefined);
    return { mobile, hd };
  } catch (error) {
    resetFfmpeg();
    if (canUploadOriginalVideo(file)) {
      onStatus?.("Salvo il file originale (compressione troppo pesante)…");
      return { mobile: file, hd: null };
    }
    throw asError(
      error,
      logs.at(-1)
        ? "Compressione video non riuscita. Prova un clip più corto o un MP4."
        : "Compressione video non riuscita. Ricarica la pagina e riprova.",
    );
  } finally {
    try {
      runtime.off("log", onLog);
      runtime.off("progress", onProgress);
    } catch {
      /* worker already terminated */
    }
  }
}
