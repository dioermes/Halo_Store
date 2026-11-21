import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const file = join(
  fileURLToPath(new URL("../node_modules/@ffmpeg/ffmpeg/dist/esm/classes.js", import.meta.url)),
);
const source = readFileSync(file, "utf8");
const next = source.replace(
  /this\.#worker = classWorkerURL \?[\s\S]*?new Worker\(new URL\("\.\/worker\.js", import\.meta\.url\), \{\s*type: "module",\s*\}\);/,
  `this.#worker = new Worker(new URL("./worker.js", import.meta.url), {
                    type: "module",
                });`,
);

if (!next.includes('new URL("./worker.js", import.meta.url)') || next.includes("classWorkerURL ?")) {
  throw new Error("Patch FFmpeg worker non applicata.");
}
if (next !== source) writeFileSync(file, next);
console.log("FFmpeg worker: URL statico per Next/Turbopack.");
