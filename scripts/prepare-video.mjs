// Prépare automatiquement la vidéo de référence, à chaque `npm run dev` et
// `npm run build` : conversion en 16 fps (fal facture à la frame), extraction
// d'une image de la scène (elle sert à créer le personnage dans la bonne pose),
// envoi des deux sur le stockage fal.ai, puis écriture des URL dans
// src/config/reference-video.json.
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
const FRAME = `${CACHE_DIR}/exemple-scene.jpg`;
// Instant de la vidéo où la personne est entière et bien visible.
const FRAME_AT_SECONDS = "0.5";
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
if (previous.url && previous.sceneUrl && previous.hash === hash) {
  console.log("[prepare-video] vidéo de référence déjà prête.");
  process.exit(0);
}

await mkdir(CACHE_DIR, { recursive: true });
const run = promisify(execFile);
await run(ffmpegPath, [
  "-y", "-i", SOURCE,
  "-r", "16", "-an",
  "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18",
  CONVERTED,
]);
await run(ffmpegPath, [
  "-y", "-ss", FRAME_AT_SECONDS, "-i", SOURCE,
  "-frames:v", "1", "-q:v", "2",
  FRAME,
]);

fal.config({ credentials: process.env.FAL_KEY });
const url = await fal.storage.upload(
  new Blob([await readFile(CONVERTED)], { type: "video/mp4" }),
);
const sceneUrl = await fal.storage.upload(
  new Blob([await readFile(FRAME)], { type: "image/jpeg" }),
);
await writeFile(OUTPUT, JSON.stringify({ hash, url, sceneUrl }, null, 2) + "\n");
console.log("[prepare-video] vidéo de référence convertie et envoyée.");
