// Dernière étape d'une commande, sans IA : la vidéo générée reçoit le son
// d'origine (sans réencodage), la mention « Généré par IA » et, si le preset le
// demande, retrouve le décor d'origine autour de la personne. Tout passe par
// ffmpeg, comme src/lib/santa-video.ts.
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import ffmpegPath from "ffmpeg-static";
import type { PresetSpec } from "@/lib/presets/spec";

const run = promisify(execFile);

// Fichiers du preset, inclus dans le déploiement par next.config.ts : sans le
// commentaire turbopackIgnore, Next embarquerait tout le projet.
const fromRoot = (file: string) => path.resolve(/*turbopackIgnore: true*/ process.cwd(), file);

export function presetAsset(preset: PresetSpec, relative: string): string {
  return fromRoot(path.join("presets", preset.id, relative));
}

// Marge de la mention, en pixels sur la largeur de référence.
const LABEL_MARGIN = 24;

async function ffmpeg(args: string[], cwd: string) {
  if (!ffmpegPath) throw new Error("ffmpeg introuvable pour cette plateforme");
  await run(ffmpegPath, ["-hide_banner", "-loglevel", "error", "-y", ...args], { cwd, maxBuffer: 10 * 1024 * 1024 });
}

export type AssembleOptions = {
  // Extrait [début, fin] en secondes : essais du Preset Lab sur une partie de la
  // vidéo. Les commandes des clients utilisent toujours la vidéo entière.
  clip?: [number, number];
};

// Graphe ffmpeg : entrée 0 la vidéo générée, 1 la mention, puis 2 la vidéo
// d'origine et 3 le masque si le décor d'origine est recollé.
export function assembleGraph(preset: PresetSpec): string {
  const { width, height, fps } = preset.reference;
  const fit = `fps=${fps},scale=${width}:${height}:flags=lanczos,setsar=1`;
  const position = `overlay=W-w-${LABEL_MARGIN}:H-h-${LABEL_MARGIN}`;
  if (!preset.post.composite_mask) {
    return `[0:v]${fit},format=yuv420p[generated];[generated][1:v]${position}[out]`;
  }
  return [
    `[0:v]${fit},format=yuv420p[generated]`,
    `[2:v]${fit},format=yuv420p[scene]`,
    `[3:v]${fit},format=gray[mask]`,
    // Le masque devient la transparence de la vidéo générée, posée sur la scène.
    `[generated][mask]alphamerge[person]`,
    `[scene][person]overlay=0:0:shortest=1,format=yuv420p[merged]`,
    `[merged][1:v]${position}[out]`,
  ].join(";");
}

// Vidéo finale d'une commande, et sa planche d'images (une par seconde).
export async function assembleVideo(
  preset: PresetSpec,
  generated: Buffer,
  options: AssembleOptions = {},
): Promise<{ video: Buffer; sheet: Buffer }> {
  const { assets } = preset.reference;
  const dir = await mkdtemp(path.join(tmpdir(), "preset-"));
  try {
    await writeFile(path.join(dir, "generated.mp4"), generated);
    const trim = options.clip ? ["-ss", String(options.clip[0]), "-t", String(options.clip[1] - options.clip[0])] : [];
    const sceneInputs = preset.post.composite_mask
      ? [...trim, "-i", presetAsset(preset, assets.raw), ...trim, "-i", presetAsset(preset, assets.mask)]
      : [];
    const audioIndex = preset.post.composite_mask ? 4 : 2;
    await ffmpeg(
      [
        "-i", "generated.mp4",
        "-i", presetAsset(preset, assets.label),
        ...sceneInputs,
        ...trim, "-i", presetAsset(preset, assets.audio),
        "-filter_complex", assembleGraph(preset),
        "-map", "[out]", "-map", `${audioIndex}:a`,
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-pix_fmt", "yuv420p",
        "-c:a", "copy", "-shortest",
        // Le marquage IA posé par le modèle (AIGC chez Kling) reste dans le fichier.
        "-map_metadata", "0", "-metadata", `comment=${preset.post.metadata_comment}`,
        "-movflags", "+faststart+use_metadata_tags",
        "video.mp4",
      ],
      dir,
    );
    await ffmpeg(["-i", "video.mp4", "-vf", "fps=1,scale=240:-2,tile=5x2", "-frames:v", "1", "-q:v", "4", "sheet.jpg"], dir);
    return {
      video: await readFile(path.join(dir, "video.mp4")),
      sheet: await readFile(path.join(dir, "sheet.jpg")),
    };
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
