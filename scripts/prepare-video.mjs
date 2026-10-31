// Prépare automatiquement la vidéo de référence, à chaque `npm run dev` et
// `npm run build` : envoi sur le stockage fal.ai, puis écriture de l'URL dans
// src/config/reference-video.json. La vidéo part telle quelle (fps et son
// d'origine) : les modèles facturent à la seconde, pas à l'image.
// Rien à faire à la main : il suffit de remplacer public/exemple.mp4.
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { fal } from "@fal-ai/client";

const SOURCE = "public/exemple.mp4";
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

// "v2" : change à chaque évolution de la préparation, pour forcer un nouvel envoi.
const hash = createHash("sha256").update("v2").update(source).digest("hex");
const previous = JSON.parse(await readFile(OUTPUT, "utf8").catch(() => "{}"));
if (previous.url && previous.hash === hash) {
  console.log("[prepare-video] vidéo de référence déjà prête.");
  process.exit(0);
}

fal.config({ credentials: process.env.FAL_KEY });
const url = await fal.storage.upload(new Blob([source], { type: "video/mp4" }));
await writeFile(OUTPUT, JSON.stringify({ hash, url }, null, 2) + "\n");
console.log("[prepare-video] vidéo de référence envoyée.");
