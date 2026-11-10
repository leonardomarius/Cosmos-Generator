// Copie légère de la vidéo d'exemple pour l'accueil, à chaque `npm run dev`
// et `npm run build`. public/exemple.mp4 (1080×1920 à 18 Mb/s, ~23 Mo) reste
// la source, intacte. La copie garde sa définition, sans le
// son (la vidéo est muette sur l'accueil), et pèse ~4 fois moins ; son affiche
// (la première image) s'affiche pendant le chargement.
// Refaite seulement quand exemple.mp4 change : son empreinte est rangée dans
// les métadonnées de la copie. En cas d'échec, l'accueil affiche exemple.mp4.
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile, rm } from "node:fs/promises";
import { promisify } from "node:util";
import ffmpeg from "ffmpeg-static";

const SOURCE = "public/exemple.mp4";
const VIDEO = "public/exemple-web.mp4";
const POSTER = "public/exemple-web.jpg";
const run = promisify(execFile);
const removeCopy = () => Promise.all([rm(VIDEO, { force: true }), rm(POSTER, { force: true })]);

const source = await readFile(SOURCE).catch(() => null);
if (!source || !ffmpeg) {
  await removeCopy();
  console.warn(`[prepare-web-video] ${source ? "ffmpeg" : SOURCE} introuvable : étape ignorée.`);
  process.exit(0);
}

// "v1" : change à chaque évolution des réglages, pour forcer une nouvelle copie.
const hash = createHash("sha256").update("v1").update(source).digest("hex");
// Sans fichier de sortie, ffmpeg affiche les métadonnées puis échoue.
const probe = await run(ffmpeg, ["-hide_banner", "-i", VIDEO]).catch((error) => error);
if (probe.stderr?.includes(hash)) {
  console.log("[prepare-web-video] copie d'affichage déjà prête.");
  process.exit(0);
}

try {
  // CRF 24 : SSIM 0,989 face à l'original, à la taille affichée sur iPhone.
  await run(ffmpeg, [
    "-y", "-loglevel", "error", "-i", SOURCE, "-an",
    "-c:v", "libx264", "-preset", "slow", "-crf", "24", "-pix_fmt", "yuv420p", "-threads", "4",
    "-movflags", "+faststart", "-metadata", `comment=${hash}`, VIDEO,
  ]);
  await run(ffmpeg, ["-y", "-loglevel", "error", "-i", VIDEO, "-frames:v", "1", "-vf", "scale=720:-2", "-q:v", "4", POSTER]);
  console.log("[prepare-web-video] copie d'affichage créée.");
} catch (error) {
  await removeCopy();
  console.warn(`[prepare-web-video] échec, l'accueil affichera ${SOURCE} : ${error.message}`);
}
