// Prépare automatiquement la vidéo de référence, à chaque `npm run dev` et
// `npm run build` : conversion en 16 fps (fal facture à la frame), envoi sur
// le stockage fal.ai, puis écriture de l'URL dans src/config/reference-video.json.
// Rien à faire à la main : il suffit de remplacer public/exemple.mp4.
import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { promisify } from "node:util";
import ffmpegPath from "ffmpeg-static";
import { fal } from "@fal-ai/client";

const SOURCE = "public/exemple.mp4";
const CACHE_DIR = ".cache";
const CONVERTED = `${CACHE_DIR}/exemple-16fps.mp4`;
const OUTPUT = "src/config/reference-video.json";

const source = await readFile(SOURCE).catch(() => null);
if (!source) {
  console.warn(`[prepare-video] ${SOURCE} introuvable : étape ignorée.`);
  process.exit(0);
}
if (!process.env.FAL_KEY) {
  console.warn("[prepare-video] FAL_KEY manquant dans .env.local : étape ignorée.");
  process.exit(0);
}

const hash = createHash("sha256").update(source).digest("hex");
const previous = JSON.parse(await readFile(OUTPUT, "utf8").catch(() => "{}"));
if (previous.url && previous.hash === hash) {
  console.log("[prepare-video] vidéo de référence déjà prête.");
  process.exit(0);
}

await mkdir(CACHE_DIR, { recursive: true });
await promisify(execFile)(ffmpegPath, [
  "-y", "-i", SOURCE,
  "-r", "16", "-an",
  "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18",
  CONVERTED,
]);

fal.config({ credentials: process.env.FAL_KEY });
const url = await fal.storage.upload(
  new Blob([await readFile(CONVERTED)], { type: "video/mp4" }),
);
await writeFile(OUTPUT, JSON.stringify({ hash, url }, null, 2) + "\n");
console.log("[prepare-video] vidéo de référence convertie et envoyée.");
