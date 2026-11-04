// Préparation d'un preset à vidéo fixe : faite une seule fois, elle sert à toutes
// les commandes. Tout atterrit dans presets/<id>/assets/.
//   node scripts/preset-prepare.mjs <id>                gratuit : vidéo normalisée, son, images clés, mention, empreintes
//   node scripts/preset-prepare.mjs <id> grid           gratuit : images quadrillées pour viser la star (prep.sam)
//   node --env-file=.env.local scripts/preset-prepare.mjs <id> upload       envoi des fichiers fixes chez fal (aucune génération)
//   node --env-file=.env.local scripts/preset-prepare.mjs <id> masks --go   PAYANT (≈ 0,48 $) : masque SAM 3 et profondeur
//   node scripts/preset-prepare.mjs <id> composite      gratuit, après masks : silhouette, masque de recollage, vidéo de contrôle
//   node scripts/preset-prepare.mjs <id> approve-mask --by "qui" --note "ce qui a été regardé"
// Un masque approuvé est lié à l'empreinte de ses fichiers : le moindre
// changement annule l'approbation, comme dans le workflow open source.
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import ffmpegPath from "ffmpeg-static";

const run = promisify(execFile);
const [id, command = "prepare", ...rest] = process.argv.slice(2);
if (!id) throw new Error("Indique l'identifiant du preset.");

const root = path.join("presets", id);
const preset = JSON.parse(await readFile(path.join(root, "preset.json"), "utf8"));
const { reference } = preset;
const asset = (relative) => path.join(root, relative);
const assets = Object.fromEntries(Object.entries(reference.assets).map(([key, value]) => [key, asset(value)]));
const manifestPath = asset("assets/manifest.json");
const urlsPath = asset("assets/urls.json");
const workDir = path.join(".cache", "presets", id);

const option = (name) => {
  const at = rest.indexOf(`--${name}`);
  return at === -1 ? null : (rest[at + 1] ?? "");
};
const sha256 = async (file) => createHash("sha256").update(await readFile(file)).digest("hex");
const ffmpeg = (args) =>
  run(ffmpegPath, ["-y", "-hide_banner", "-loglevel", "error", "-threads", "4", ...args], { maxBuffer: 10 * 1024 * 1024 });
const readJson = async (file, fallback) => JSON.parse(await readFile(file, "utf8").catch(() => JSON.stringify(fallback)));
const writeJson = (file, value) => writeFile(file, JSON.stringify(value, null, 2) + "\n");

// --- Gratuit : la base ------------------------------------------------------

async function prepare() {
  await mkdir(asset("assets"), { recursive: true });
  const { width, height, fps, frames, master } = reference;

  // Entrée des modèles : nombre d'images exact (fal facture à la seconde : pas
  // de 10,04 s), 720 px de large au moins pour Kling, sans son.
  await ffmpeg([
    "-i", master, "-an", "-map_metadata", "-1",
    "-vf", `fps=${fps},scale=${width}:${height}:flags=lanczos,setsar=1`,
    "-frames:v", String(frames),
    "-c:v", "libx264", "-preset", "slow", "-crf", "14", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
    assets.raw,
  ]);
  // La piste d'origine, sans réencodage : c'est elle qui revient dans la vidéo finale.
  await ffmpeg(["-i", master, "-vn", "-map_metadata", "-1", "-c:a", "copy", assets.audio]);
  // Images clés en pleine définition, pour l'image-clé du client.
  for (const [key, frame] of Object.entries(reference.hero_frames)) {
    await ffmpeg(["-i", master, "-vf", `select=eq(n\\,${frame})`, "-vsync", "0", "-frames:v", "1", "-q:v", "2", assets[key]]);
  }
  await makeLabel();
  await ffmpeg([
    "-i", assets.raw,
    "-vf", "fps=2,scale=180:-2,tile=10x2",
    "-frames:v", "1", "-q:v", "4", asset("assets/contact-sheet.jpg"),
  ]);
  if (!existsSync(urlsPath)) await writeJson(urlsPath, {});
  await writeManifest();
  console.log(`[preset-prepare] ${id} prêt : ${reference.seconds} s, ${width}x${height}, ${frames} images.`);
}

// Mention visible d'une vidéo générée : pastille arrondie, fond transparent.
async function makeLabel() {
  const font = path.join("node_modules", "next", "dist", "compiled", "@vercel", "og", "Geist-Regular.ttf");
  const w = 232;
  const h = 40;
  const r = h / 2;
  const inCorner = `gt(abs(X-W/2),W/2-${r})*gt(abs(Y-H/2),H/2-${r})`;
  const distance = `hypot(abs(X-W/2)-(W/2-${r}),abs(Y-H/2)-(H/2-${r}))`;
  await ffmpeg([
    "-f", "lavfi", "-i", `color=c=black:s=${w}x${h}:d=1,format=rgba`,
    "-vf", [
      `geq=r='0':g='0':b='0':a='if(${inCorner},if(lte(${distance},${r}),150,0),150)'`,
      `drawtext=fontfile=${font.replaceAll("\\", "/")}:text='Généré par IA · Cosmos':fontsize=19:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2`,
    ].join(","),
    "-frames:v", "1", "-update", "1", assets.label,
  ]);
}

async function writeManifest() {
  const previous = await readJson(manifestPath, {});
  const files = {};
  for (const [key, file] of Object.entries(assets)) {
    if (existsSync(file)) files[key] = { file: reference.assets[key], sha256: await sha256(file) };
  }
  const master = await sha256(reference.master);
  const version = (await run(ffmpegPath, ["-version"])).stdout.split("\n")[0];
  await writeJson(manifestPath, { master: { file: reference.master, sha256: master }, ffmpeg: version, files, mask_review: previous.mask_review ?? null });
}

// --- Gratuit : viser la star ------------------------------------------------

// Image quadrillée tous les 100 px, pour relever les coordonnées de prep.sam.
async function grid() {
  await mkdir(workDir, { recursive: true });
  const frames = rest.length > 0 ? rest.map(Number) : [36, 48, 72, 100, 120, 150, 168, 192, 216, 236];
  for (const n of frames) {
    const lines = [];
    for (let x = 100; x < reference.width; x += 100) lines.push(`drawbox=x=${x}:y=0:w=1:h=iw*2:color=yellow@0.8:t=fill`);
    for (let y = 100; y < reference.height; y += 100) lines.push(`drawbox=x=0:y=${y}:w=iw:h=1:color=yellow@0.8:t=fill`);
    await ffmpeg(["-i", assets.raw, "-vf", [`select=eq(n\\,${n})`, ...lines].join(","), "-vsync", "0", "-frames:v", "1", "-q:v", "3", path.join(workDir, `grid-${n}.jpg`)]);
  }
  console.log(`[preset-prepare] images quadrillées dans ${workDir}.`);
}

// --- Envoi chez le fournisseur ----------------------------------------------

async function upload() {
  const { fal } = await import("@fal-ai/client");
  if (!process.env.FAL_KEY) throw new Error("FAL_KEY manquant.");
  fal.config({ credentials: process.env.FAL_KEY });
  const urls = await readJson(urlsPath, {});
  // Fichiers sans donnée personnelle (la scène de référence), gardés sans limite.
  for (const key of ["raw", "depth", "hero_face", "hero_body", "hero_profile"]) {
    if (!existsSync(assets[key])) continue;
    const hash = await sha256(assets[key]);
    if (urls[key]?.sha256 === hash) continue;
    const type = assets[key].endsWith(".mp4") ? "video/mp4" : "image/jpeg";
    const url = await fal.storage.upload(new Blob([await readFile(assets[key])], { type }), { lifecycle: { expiresIn: "never" } });
    urls[key] = { sha256: hash, url };
    console.log(`[preset-prepare] ${key} envoyé.`);
  }
  await writeJson(urlsPath, urls);
}

// --- Payant : masque et profondeur ------------------------------------------

// Décode un masque RLE de SAM 3 (COCO : comptes alternés, colonne par colonne,
// compressés ou non) en octets 0/255, ligne par ligne.
function decodeRle(rle, width, height) {
  // Le format exact n'est pas documenté par fal : chaîne seule, ou { size, counts }.
  const parsed = typeof rle === "string" && rle.trim().startsWith("{") ? JSON.parse(rle) : rle;
  const text = String(parsed?.counts ?? parsed).trim();
  if (parsed?.size && (parsed.size[0] !== height || parsed.size[1] !== width)) {
    throw new Error(`Masque de ${parsed.size[1]}x${parsed.size[0]} au lieu de ${width}x${height}.`);
  }
  let counts;
  if (/^[\d\s]+$/.test(text)) {
    counts = text.split(/\s+/).map(Number);
  } else {
    counts = [];
    let at = 0;
    while (at < text.length) {
      let value = 0;
      let shift = 0;
      let more = true;
      while (more) {
        const c = text.charCodeAt(at++) - 48;
        value |= (c & 0x1f) << (5 * shift++);
        more = (c & 0x20) !== 0;
        if (!more && c & 0x10) value |= -1 << (5 * shift);
      }
      if (counts.length > 2) value += counts[counts.length - 2];
      counts.push(value);
    }
  }
  const pixels = Buffer.alloc(width * height);
  let position = 0;
  let on = false;
  for (const count of counts) {
    if (on) {
      for (let i = position; i < position + count && i < width * height; i++) {
        const x = Math.floor(i / height);
        const y = i % height;
        pixels[y * width + x] = 255;
      }
    }
    position += count;
    on = !on;
  }
  if (position !== width * height) throw new Error(`Masque RLE illisible : ${position} pixels au lieu de ${width * height}.`);
  return pixels;
}

async function falResult(fal, endpoint, input) {
  const { data, requestId } = await fal.subscribe(endpoint, { input, logs: false });
  console.log(`[preset-prepare] ${endpoint} terminé (${requestId}).`);
  return data;
}

async function masks() {
  const { sam, depth } = preset.prep;
  if (sam.box_prompts.length === 0) throw new Error("Renseigne prep.sam.box_prompts dans preset.json (voir la commande grid).");
  const frames = reference.frames;
  // Un résultat déjà reçu n'est jamais redemandé : relancer la commande après
  // une erreur ne coûte que ce qui manque.
  const samPath = path.join(workDir, "sam-result.json");
  const depthPath = path.join(workDir, "depth.mp4");
  const samCost = existsSync(samPath) ? 0 : Math.ceil(frames / 16) * 0.005;
  const depthCost = existsSync(depthPath) ? 0 : reference.seconds * 0.04;
  console.log(`[preset-prepare] coût : SAM 3 ≈ ${samCost.toFixed(3)} $, profondeur ≈ ${depthCost.toFixed(2)} $, total ≈ ${(samCost + depthCost).toFixed(2)} $.`);
  if (samCost + depthCost > 0 && !rest.includes("--go")) {
    console.log("[preset-prepare] rien n'est lancé sans --go.");
    return;
  }
  const { fal } = await import("@fal-ai/client");
  if (!process.env.FAL_KEY) throw new Error("FAL_KEY manquant.");
  fal.config({ credentials: process.env.FAL_KEY });
  const urls = await readJson(urlsPath, {});
  if (!urls.raw?.url) throw new Error("Lance d'abord la commande upload.");
  await mkdir(workDir, { recursive: true });

  let samResult = await readJson(samPath, null);
  if (!samResult) {
    samResult = await falResult(fal, sam.endpoint, {
      video_url: urls.raw.url,
      detection_threshold: sam.detection_threshold,
      box_prompts: sam.box_prompts.map((box) => ({ ...box, object_id: sam.object_id })),
      point_prompts: sam.point_prompts.map((point) => ({ ...point, object_id: sam.object_id })),
    });
    await writeJson(samPath, samResult);
  }
  const rle = Array.isArray(samResult.rle)
    ? samResult.rle
    : await fetch(samResult.rle.url).then((res) => res.json());
  if (rle.length !== frames) throw new Error(`SAM 3 a renvoyé ${rle.length} masques pour ${frames} images : voir ${workDir}/sam-result.json.`);
  const raw = Buffer.concat(rle.map((frame) => decodeRle(frame, reference.width, reference.height)));
  const rawPath = path.join(workDir, "mask.gray");
  await writeFile(rawPath, raw);
  await ffmpeg([
    "-f", "rawvideo", "-pix_fmt", "gray", "-s", `${reference.width}x${reference.height}`, "-r", String(reference.fps), "-i", rawPath,
    "-c:v", "libx264", "-preset", "slow", "-crf", "10", "-pix_fmt", "yuv420p", path.join(workDir, "mask-raw.mp4"),
  ]);

  if (!existsSync(depthPath)) {
    const depthResult = await falResult(fal, depth.endpoint, {
      video_url: urls.raw.url,
      model: depth.model,
      colormap: depth.colormap,
      resolution: depth.resolution,
    });
    const depthVideo = await fetch(depthResult.video.url);
    if (!depthVideo.ok) throw new Error(`Profondeur illisible (${depthVideo.status}).`);
    await writeFile(depthPath, Buffer.from(await depthVideo.arrayBuffer()));
  }
  console.log("[preset-prepare] masque et profondeur reçus. Suite : commande composite.");
}

// --- Gratuit, après les masques : silhouette et contrôle ---------------------

async function composite() {
  const maskRaw = path.join(workDir, "mask-raw.mp4");
  const depthVideo = path.join(workDir, "depth.mp4");
  if (!existsSync(maskRaw) || !existsSync(depthVideo)) throw new Error("Lance d'abord la commande masks.");
  const { width, height, fps, frames } = reference;
  const fit = `fps=${fps},scale=${width}:${height}:flags=bicubic,setsar=1`;

  // La silhouette, un peu élargie pour couvrir tous les cheveux et les bords.
  await ffmpeg([
    "-i", assets.raw, "-i", depthVideo, "-i", maskRaw,
    "-filter_complex",
    `[1:v]${fit},format=yuv420p[depth];[2:v]${fit},format=gray,lut=y='if(gt(val,127),255,0)',dilation,dilation[mask];[depth][mask]alphamerge[silhouette];[0:v][silhouette]overlay=0:0:shortest=1,format=yuv420p[out]`,
    "-map", "[out]", "-an", "-frames:v", String(frames),
    "-c:v", "libx264", "-preset", "slow", "-crf", "14", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
    assets.depth,
  ]);
  // Masque de recollage : plus large et adouci, le nouveau corps peut déborder.
  await ffmpeg([
    "-i", maskRaw,
    "-vf", `${fit},format=gray,lut=y='if(gt(val,127),255,0)',${"dilation,".repeat(12)}gblur=sigma=6`,
    "-frames:v", String(frames), "-c:v", "libx264", "-preset", "slow", "-crf", "12", "-pix_fmt", "yuv420p",
    assets.mask,
  ]);
  // Vidéo de contrôle à regarder en entier : source, silhouette, masque seul.
  await ffmpeg([
    "-i", assets.raw, "-i", assets.depth, "-i", maskRaw,
    "-filter_complex",
    `[0:v]scale=360:-2[a];[1:v]scale=360:-2[b];[2:v]${fit},scale=360:-2,format=yuv420p[c];[a][b][c]hstack=inputs=3[out]`,
    "-map", "[out]", "-c:v", "libx264", "-preset", "fast", "-crf", "20", "-pix_fmt", "yuv420p",
    path.join(workDir, "control.mp4"),
  ]);
  await writeManifest();
  console.log(`[preset-prepare] à regarder en entier avant d'approuver : ${path.join(workDir, "control.mp4")}`);
}

async function approveMask() {
  const by = option("by");
  const note = option("note");
  if (!by || !note) throw new Error('Indique --by "qui" et --note "ce qui a été regardé".');
  await writeManifest();
  const manifest = await readJson(manifestPath, {});
  if (!manifest.files.depth || !manifest.files.mask) throw new Error("Silhouette ou masque manquant.");
  manifest.mask_review = {
    by,
    note,
    date: new Date().toISOString().slice(0, 10),
    depth_sha256: manifest.files.depth.sha256,
    mask_sha256: manifest.files.mask.sha256,
  };
  await writeJson(manifestPath, manifest);
  console.log("[preset-prepare] masque approuvé pour ces fichiers précis.");
}

const commands = { prepare, grid, upload, masks, composite, "approve-mask": approveMask };
if (!commands[command]) throw new Error(`Commande inconnue : ${command}`);
await commands[command]();
