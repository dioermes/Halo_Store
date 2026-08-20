/**
 * Ricava dal logo originale (marchio bordeaux su fondo nero) uno stencil PNG
 * bianco con canale alpha, piu l'icona del sito.
 *
 * Lo stencil serve come mask-image: il colore lo decide il CSS, cosi lo stesso
 * file rende il marchio in avorio nella nav e in oro sfumato nella hero.
 * L'alpha viene dal croma e non dalla luminosita, perche il file di partenza ha
 * un'ombra grigia che va scartata mentre le sfumature del bordeaux vanno tenute.
 *
 * Uso: node scripts/build-logo.mjs <percorso-logo-originale>
 */
import sharp from "sharp";

const SRC = process.argv[2];
if (!SRC) {
  console.error("Serve il percorso del logo originale.");
  process.exit(1);
}

const STENCIL_OUT = "public/logo-halo.png";
const ICON_OUT = "src/app/icon.png";
const INK = { r: 10, g: 10, b: 11 };
const IVORY = { r: 245, g: 243, b: 239 };

const { data, info } = await sharp(SRC)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;

const chroma = new Uint8Array(width * height);
const histogram = new Uint32Array(256);

for (let p = 0; p < width * height; p += 1) {
  const i = p * channels;
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  const value = Math.max(r, g, b) - Math.min(r, g, b);
  chroma[p] = value;
  histogram[value] += 1;
}

// Il croma piu ricorrente fra i pixel saturi e quello del bordeaux pieno:
// e il valore che corrisponde a opacita 100%.
let peak = 1;
for (let value = 20; value < 256; value += 1) {
  if (histogram[value] > histogram[peak]) peak = value;
}

const rawAlpha = Buffer.alloc(width * height);
for (let p = 0; p < width * height; p += 1) {
  rawAlpha[p] = Math.min(255, Math.round((chroma[p] / peak) * 255));
}

// Il file di partenza e compresso e lascia pulviscolo lungo i contorni. Una
// sfocatura minima seguita da una curva di contrasto ripulisce i puntini
// isolati e rimette a fuoco il bordo, invece di smussarlo.
const LOW = 0.38;
const HIGH = 0.62;
const slope = 1 / (HIGH - LOW);
const alpha = await sharp(rawAlpha, { raw: { width, height, channels: 1 } })
  .blur(0.9)
  .linear(slope, -LOW * 255 * slope)
  // Senza questo sharp restituisce il raw promosso a tre canali e l'alpha
  // finirebbe letto sfalsato.
  .toColourspace("b-w")
  .raw()
  .toBuffer();

if (alpha.length !== width * height) {
  throw new Error(`alpha inatteso: ${alpha.length} invece di ${width * height}`);
}

const stencil = Buffer.alloc(width * height * 4);
let minX = width;
let minY = height;
let maxX = -1;
let maxY = -1;

for (let p = 0; p < width * height; p += 1) {
  const o = p * 4;
  stencil[o] = 255;
  stencil[o + 1] = 255;
  stencil[o + 2] = 255;
  stencil[o + 3] = alpha[p];

  if (alpha[p] > 8) {
    const x = p % width;
    const y = (p / width) | 0;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
}

const box = {
  left: minX,
  top: minY,
  width: maxX - minX + 1,
  height: maxY - minY + 1,
};

const cropped = sharp(stencil, { raw: { width, height, channels: 4 } }).extract(box);

// Nella hero il marchio arriva a circa 430 px CSS, quindi 1,5 volte il ritaglio
// nativo copre anche i display retina senza appesantire il primo caricamento.
await cropped
  .clone()
  .resize({ width: Math.round(box.width * 1.5), kernel: "lanczos3" })
  .png({ compressionLevel: 9, palette: true })
  .toFile(STENCIL_OUT);

// Icona quadrata: marchio avorio su fondo ink, con margine per non toccare i bordi.
const iconSize = 512;
const markWidth = Math.round(iconSize * 0.78);
const mark = await cropped
  .clone()
  .resize({ width: markWidth, kernel: "lanczos3" })
  .tint(IVORY)
  .png()
  .toBuffer();

await sharp({
  create: {
    width: iconSize,
    height: iconSize,
    channels: 4,
    background: { ...INK, alpha: 1 },
  },
})
  .composite([{ input: mark, gravity: "center" }])
  .png({ compressionLevel: 9 })
  .toFile(ICON_OUT);

console.log(`croma di riferimento: ${peak}`);
console.log(`ritaglio: ${box.width}x${box.height} da (${box.left}, ${box.top})`);
console.log(`stencil: ${STENCIL_OUT} (${Math.round(box.width * 1.5)}px di larghezza)`);
console.log(`icona:   ${ICON_OUT} (${iconSize}px)`);
console.log(`proporzione da usare nel CSS: ${box.width}/${box.height}`);
