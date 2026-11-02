// Assemblage de la "Vidéo du Père Noël" d'une commande : la photo de l'enfant
// et sa liste de cadeaux sont collées sur l'écran magique de la vidéo de
// référence. Aucune IA ici : tout passe par ffmpeg, en deux étapes.
// 1. La carte : la photo telle qu'envoyée (ni recadrée ni retouchée) en haut,
//    le titre et les cadeaux en dessous, chaque ligne à une taille qui tient.
// 2. La carte collée sur l'écran de chaque plan, puis la vidéo réencodée.
import { execFile } from "node:child_process";
import { copyFile, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import ffmpegPath from "ffmpeg-static";
import type { SantaTemplate } from "@/config/effects";
import { missingCharacters, readFontMetrics, textWidth, type FontMetrics } from "@/lib/font-metrics";

const run = promisify(execFile);

// Fichiers du projet (police, vidéo de référence…), quel que soit le dossier
// où tourne ffmpeg. Ils sont inclus dans le déploiement par next.config.ts :
// sans le commentaire turbopackIgnore, Next embarquerait tout le projet.
const fromRoot = (file: string) => path.resolve(/*turbopackIgnore: true*/ process.cwd(), file);
const FONT_FILE = fromRoot("src/assets/fonts/DancingScript.ttf");

// Couleurs de la carte : papier crème, fond doré derrière la photo.
const COLORS = {
  paper: "0xF7EBD0",
  photoBackground: "0xE8C27F",
  title: "0x8E1B1B",
  gift: "0x3A2312",
};
// Durée du fondu d'apparition de la carte (secondes).
const REVEAL_SECONDS = 0.6;
// Écart (0-255) au-delà duquel un pixel de l'écran est un objet devant lui
// (bonnet, barbe…) et pas l'écran lui-même : au-dessus du bruit de la vidéo.
const MATTE_THRESHOLD = 16;

export type SantaCard = { photo: Buffer; childName: string | null; gifts: string[] };

let font: FontMetrics | null = null;
async function loadFont(): Promise<FontMetrics> {
  font ??= readFontMetrics(await readFile(FONT_FILE));
  return font;
}

function cardTitle(childName: string | null): string {
  return childName ? `Liste de Noël de ${childName}` : "Ma liste de Noël";
}

// Caractères du prénom ou des cadeaux que la police ne sait pas dessiner.
export async function unsupportedCharacters(childName: string | null, gifts: string[]): Promise<string[]> {
  return missingCharacters(await loadFont(), [cardTitle(childName), ...gifts].join(" "));
}

// Plus grande taille (en pixels) qui fait tenir chaque texte dans maxWidth.
function fitSize(metrics: FontMetrics, texts: string[], maxWidth: number, maxSize: number): number {
  const widest = Math.max(...texts.map((t) => textWidth(metrics, t, 1)));
  return Math.max(1, Math.floor(Math.min(maxSize, (maxWidth / widest) * 0.97)));
}

// Position de chaque élément de la carte, proportionnelle à sa taille.
function layout(metrics: FontMetrics, width: number, height: number, title: string, lines: string[]) {
  const margin = Math.round(width * 0.045);
  const photo = { x: margin, y: margin, w: width - 2 * margin, h: Math.round(height * 0.58) };
  const textWidthMax = width - 2 * margin - Math.round(width * 0.04);

  const titleY = photo.y + photo.h + Math.round(height * 0.03);
  const titleSize = fitSize(metrics, [title], textWidthMax, Math.round(height * 0.055));
  const rule = {
    x: Math.round(width * 0.2),
    y: titleY + Math.round(titleSize * 1.35),
    w: Math.round(width * 0.6),
    h: Math.max(2, Math.round(height * 0.003)),
  };

  // Les cadeaux, sur 4 lignes au plus, centrés dans la place qui reste.
  const top = rule.y + Math.round(height * 0.025);
  const bottom = height - margin;
  const lineHeight = Math.min(Math.round(height * 0.07), Math.floor((bottom - top) / 4));
  const giftSize = fitSize(metrics, lines, textWidthMax, Math.round(lineHeight * 0.68));
  const firstLine = top + Math.round((bottom - top - lines.length * lineHeight) / 2);
  return {
    photo,
    title: { size: titleSize, y: titleY },
    rule,
    gifts: { size: giftSize, ys: lines.map((_, i) => firstLine + i * lineHeight) },
    radius: Math.round(width * 0.04),
  };
}

// Graphe ffmpeg de la carte : entrée 0 = papier, entrée 1 = photo.
// Les textes sont lus dans des fichiers (textfile) : aucun caractère saisi
// par le client n'entre dans la commande.
function cardFilter(template: SantaTemplate, l: ReturnType<typeof layout>, giftCount: number): string {
  const { width, height } = template.card;
  const { photo, title, rule, gifts, radius } = l;
  const text = (file: string, size: number, color: string, y: number) =>
    `drawtext=fontfile=font.ttf:textfile=${file}:expansion=none:fontsize=${size}:fontcolor=${color}:x=(w-text_w)/2:y=${y}`;
  // Coins arrondis : pixels transparents hors du rectangle arrondi.
  const inCorner = `gt(abs(X-W/2),W/2-${radius})*gt(abs(Y-H/2),H/2-${radius})`;
  const cornerDistance = `hypot(abs(X-W/2)-(W/2-${radius}),abs(Y-H/2)-(H/2-${radius}))`;
  const rounded = `geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='if(${inCorner},if(lte(${cornerDistance},${radius}),255,0),255)'`;

  return [
    `[0:v]vignette=angle=PI/10,format=rgba,drawbox=x=${photo.x}:y=${photo.y}:w=${photo.w}:h=${photo.h}:color=${COLORS.photoBackground}:t=fill[paper]`,
    `[1:v]scale=w=${photo.w}:h=${photo.h}:force_original_aspect_ratio=decrease:flags=lanczos,format=rgba[photo]`,
    [
      `[paper][photo]overlay=x=${photo.x}+(${photo.w}-w)/2:y=${photo.y}+(${photo.h}-h)/2`,
      text("title.txt", title.size, COLORS.title, title.y),
      `drawbox=x=${rule.x}:y=${rule.y}:w=${rule.w}:h=${rule.h}:color=${COLORS.title}@0.5:t=fill`,
      ...Array.from({ length: giftCount }, (_, i) => text(`gift-${i}.txt`, gifts.size, COLORS.gift, gifts.ys[i])),
      `format=rgba,${rounded}`,
      // Bordure transparente : la déformation en perspective étire les bords.
      `pad=${width + 4}:${height + 4}:2:2:color=black@0`,
      `split=${template.shots.length}${template.shots.map((_, i) => `[card${i}]`).join("")}`,
    ].join(","),
  ].join(";");
}

function boundingBox(corners: SantaTemplate["shots"][number]["corners"]) {
  const xs = corners.map(([x]) => x);
  const ys = corners.map(([, y]) => y);
  return { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
}

function isRectangle([tl, tr, br, bl]: SantaTemplate["shots"][number]["corners"]): boolean {
  return tl[1] === tr[1] && bl[1] === br[1] && tl[0] === bl[0] && tr[0] === br[0];
}

// Carte mise à la forme de l'écran d'un plan : simple redimensionnement si
// l'écran est vu de face, déformation en perspective s'il est de biais.
function placeFilter(template: SantaTemplate, i: number): string {
  const { corners } = template.shots[i];
  if (isRectangle(corners)) {
    const box = boundingBox(corners);
    return `[card${i}]scale=${box.w}:${box.h}:flags=lanczos[shot${i}]`;
  }
  const [tl, tr, br, bl] = corners;
  const points = [tl, tr, bl, br].map(([x, y], n) => `x${n}=${x}:y${n}=${y}`).join(":");
  return `[card${i}]scale=${template.width}:${template.height}:flags=bicubic,perspective=${points}:sense=destination:interpolation=cubic[shot${i}]`;
}

// Graphe ffmpeg de l'étape 2. Entrée 0 : la vidéo de référence ; ensuite la
// carte de chaque plan (shot-<i>.png), puis les images "écran vide".
// Détourage par différence : les pixels qui diffèrent de l'écran vide sont
// un objet devant l'écran ; ils sont recollés au-dessus de la carte.
function compositeGraph(template: SantaTemplate): { inputs: string[]; graph: string; output: string } {
  const { shots } = template;
  const inputs = shots.flatMap((shot, i) => ["-loop", "1", "-t", String(shot.to), "-i", `shot-${i}.png`]);
  const withPlate = shots.flatMap((shot, i) => (shot.cleanPlate ? [i] : []));
  for (const i of withPlate) inputs.push("-loop", "1", "-t", String(shots[i].to), "-i", fromRoot(shots[i].cleanPlate!));

  const parts = [`[0:v]split=${1 + withPlate.length}[base]${withPlate.map((i) => `[src${i}]`).join("")}`];
  let previous = "base";
  shots.forEach((shot, i) => {
    const during = `enable='between(t,${shot.from},${shot.to})'`;
    const reveal = template.revealAt > shot.from ? `,fade=in:st=${template.revealAt}:d=${REVEAL_SECONDS}:alpha=1` : "";
    const at = isRectangle(shot.corners) ? boundingBox(shot.corners) : { x: 0, y: 0 };
    parts.push(`[${i + 1}:v]format=rgba${reveal}[card${i}]`);
    parts.push(`[${previous}][card${i}]overlay=x=${at.x}:y=${at.y}:${during}[carded${i}]`);
    previous = `carded${i}`;
    if (!shot.cleanPlate) return;

    // Zone de l'écran, un peu élargie, où l'on cherche ce qui passe devant.
    // Valeurs paires : la vidéo (4:2:0) ne se découpe qu'au pixel pair.
    const box = boundingBox(shot.corners);
    const even = (n: number) => n - (n % 2);
    const x = even(Math.max(0, box.x - 6));
    const y = even(Math.max(0, box.y - 6));
    const crop = `crop=${even(Math.min(template.width - x, box.w + 14))}:${even(Math.min(template.height - y, box.h + 14))}:${x}:${y}`;
    const plateInput = 1 + shots.length + withPlate.indexOf(i);
    parts.push(`[src${i}]${crop},format=rgb24,split[front${i}][compared${i}]`);
    parts.push(`[${plateInput}:v]${crop},format=rgb24[plate${i}]`);
    parts.push(
      `[compared${i}][plate${i}]blend=all_mode=difference,format=gray,` +
        `lut=y='if(gt(val,${MATTE_THRESHOLD}),255,0)',erosion,dilation,dilation,gblur=sigma=1.2[mask${i}]`,
    );
    parts.push(`[front${i}][mask${i}]alphamerge[ahead${i}]`);
    parts.push(`[${previous}][ahead${i}]overlay=x=${x}:y=${y}:${during}[done${i}]`);
    previous = `done${i}`;
  });
  return { inputs, graph: parts.join(";"), output: previous };
}

async function ffmpeg(args: string[], cwd: string) {
  if (!ffmpegPath) throw new Error("ffmpeg introuvable pour cette plateforme");
  await run(ffmpegPath, ["-hide_banner", "-loglevel", "error", "-y", ...args], { cwd, maxBuffer: 10 * 1024 * 1024 });
}

// Vidéo finale (MP4) d'une commande.
export async function renderSantaVideo(template: SantaTemplate, card: SantaCard): Promise<Buffer> {
  const metrics = await loadFont();
  const title = cardTitle(card.childName);
  // Lignes centrées, sans puce : celle de la police est minuscule.
  const lines = card.gifts;
  const dir = await mkdtemp(path.join(tmpdir(), "santa-"));
  try {
    await Promise.all([
      copyFile(FONT_FILE, path.join(dir, "font.ttf")),
      writeFile(path.join(dir, "photo"), card.photo),
      writeFile(path.join(dir, "title.txt"), title),
      ...lines.map((line, i) => writeFile(path.join(dir, `gift-${i}.txt`), line)),
    ]);

    // 1. La carte, mise à la forme de l'écran de chaque plan.
    const { width, height } = template.card;
    const graph = [
      cardFilter(template, layout(metrics, width, height, title, lines), lines.length),
      ...template.shots.map((_, i) => placeFilter(template, i)),
    ].join(";");
    await ffmpeg(
      [
        "-f", "lavfi", "-i", `color=c=${COLORS.paper}:s=${width}x${height}:d=1`,
        "-i", "photo",
        "-filter_complex", graph,
        ...template.shots.flatMap((_, i) => ["-map", `[shot${i}]`, "-frames:v", "1", `shot-${i}.png`]),
      ],
      dir,
    );

    // 2. La carte collée sur l'écran, plan par plan, puis ce qui passe devant
    // l'écran recollé par-dessus. Elle apparaît en fondu à revealAt et reste
    // fixe ; le son de la vidéo de référence est gardé.
    const { inputs, graph: composite, output } = compositeGraph(template);
    await ffmpeg(
      [
        "-i", fromRoot(template.video),
        ...inputs,
        "-filter_complex", composite,
        "-map", `[${output}]`, "-map", "0:a?",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-pix_fmt", "yuv420p",
        "-c:a", "copy", "-movflags", "+faststart",
        "video.mp4",
      ],
      dir,
    );
    return await readFile(path.join(dir, "video.mp4"));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
