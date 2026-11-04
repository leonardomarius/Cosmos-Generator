// Aperçu de 9 s de la vidéo du Père Noël pour l'accueil : une vraie commande
// d'exemple, assemblée par le moteur du site (src/lib/santa-video.ts), dont on
// garde les meilleurs plans. À relancer à la main si la référence change :
//   node scripts/prepare-santa-teaser.mjs chemin/vers/photo.jpg
// La photo reste hors du dépôt. Muet (il tourne en boucle sur l'accueil), avec
// une affiche pour le chargement.
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import ffmpeg from "ffmpeg-static";
import { createJiti } from "jiti";

const VIDEO = "public/effets/pere-noel-apercu.mp4";
const POSTER = "public/effets/pere-noel-apercu.jpg";
const run = promisify(execFile);

const CHILD_NAME = "Emma";
const GIFTS = ["Un vélo rouge", "Un livre de dinosaures", "Une cabane dans le jardin", "Un chien en peluche"];

// Extraits [début, fin] en secondes : le QG, le gag des lutins, la carte qui
// apparaît, puis le sourire et le clin d'œil.
const CLIPS = [
  [0, 2],
  [4.75, 7.25],
  [9.375, 11.375],
  [14.25, 16.75],
];
// Affiche : la carte dans le cadre, ce que le visiteur doit voir en premier.
const POSTER_AT = 11;

const photo = process.argv[2];
if (!photo) throw new Error("Indique le chemin de la photo d'exemple.");

const jiti = createJiti(import.meta.url, { alias: { "@": path.resolve("src") } });
const { SANTA_TEMPLATE } = await jiti.import("../src/config/effects.ts");
const { renderSantaVideo } = await jiti.import("../src/lib/santa-video.ts");

const dir = await mkdtemp(path.join(tmpdir(), "santa-apercu-"));
try {
  const demo = path.join(dir, "demo.mp4");
  await writeFile(demo, await renderSantaVideo(SANTA_TEMPLATE, { photo: await readFile(photo), childName: CHILD_NAME, gifts: GIFTS }));

  const trims = CLIPS.map(([from, to], i) => `[0:v]trim=${from}:${to},setpts=PTS-STARTPTS[c${i}]`);
  const inputs = CLIPS.map((_, i) => `[c${i}]`).join("");
  const graph = [...trims, `${inputs}concat=n=${CLIPS.length}:v=1:a=0[out]`].join(";");

  await mkdir("public/effets", { recursive: true });
  await run(ffmpeg, [
    "-y", "-loglevel", "error", "-i", demo, "-filter_complex", graph, "-map", "[out]", "-an",
    "-c:v", "libx264", "-preset", "slow", "-crf", "22", "-pix_fmt", "yuv420p", "-threads", "4",
    "-movflags", "+faststart", VIDEO,
  ]);
  await run(ffmpeg, ["-y", "-loglevel", "error", "-ss", String(POSTER_AT), "-i", demo, "-frames:v", "1", "-q:v", "4", POSTER]);
  console.log("[prepare-santa-teaser] aperçu créé.");
} finally {
  await rm(dir, { recursive: true, force: true });
}
