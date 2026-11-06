// Prépare automatiquement les vidéos de référence, à chaque `npm run dev` et
// `npm run build` : envoi sur le stockage fal.ai, puis écriture de l'URL dans
// le fichier JSON de chaque vidéo. La vidéo part telle quelle (fps et son
// d'origine) : les modèles facturent à la seconde, pas à l'image.
// Rien à faire à la main : il suffit de remplacer le fichier source.
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { fal } from "@fal-ai/client";

const VIDEOS = [
  { source: "public/exemple.mp4", output: "src/config/reference-video.json" },
  { source: "public/exemples/statue-sculpteur.mp4", output: "src/config/statue-video.json" },
];

if (!process.env.FAL_KEY) {
  console.warn("[prepare-video] FAL_KEY manquant dans .env.local : étape ignorée.");
  process.exit(0);
}
fal.config({ credentials: process.env.FAL_KEY });

for (const { source: path, output } of VIDEOS) {
  const source = await readFile(path).catch(() => null);
  if (!source) {
    console.warn(`[prepare-video] ${path} introuvable : étape ignorée.`);
    continue;
  }
  // "v2" : change à chaque évolution de la préparation, pour forcer un nouvel envoi.
  const hash = createHash("sha256").update("v2").update(source).digest("hex");
  const previous = JSON.parse(await readFile(output, "utf8").catch(() => "{}"));
  if (previous.url && previous.hash === hash) {
    console.log(`[prepare-video] ${path} déjà prête.`);
    continue;
  }
  const url = await fal.storage.upload(new Blob([source], { type: "video/mp4" }));
  await writeFile(output, JSON.stringify({ hash, url }, null, 2) + "\n");
  console.log(`[prepare-video] ${path} envoyée.`);
}
