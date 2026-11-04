// Preset Lab : tout ce qui sert à régler un preset avant de le publier. Ces
// commandes passent par la même machine que le site (src/lib/presets/machine.ts).
//   node scripts/preset-lab.mjs check                 vérifie tous les presets (aussi lancé par npm run build)
//   node scripts/preset-lab.mjs economics <id>        coût, prix minimum et marge de chaque variante
//   node scripts/preset-lab.mjs plan <id> --variants a,b --photos 2 [--clip 4.5-9.5]   coût exact d'un essai
//   node --env-file=.env.local scripts/preset-lab.mjs run <id> --variant a --photos p1.jpg[,p2.jpg] [--clip 4.5-9.5] --go --max-usd 1.5
//   node scripts/preset-lab.mjs report <id>           page locale pour comparer les essais côte à côte
//   node --env-file=.env.local scripts/preset-lab.mjs blind <id> --candidate a --against b   crée le vote à l'aveugle
//   node --env-file=.env.local scripts/preset-lab.mjs score <id> --campaign <uuid>   calcule les critères, écrit benchmark.json
// RÈGLE : run ne part jamais sans --go et un plafond --max-usd. Un go vaut pour
// un seul essai. Tout appel payant est noté dans .cache/preset-lab/<id>/depenses.jsonl.
import { execFile } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { appendFile, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import ffmpegPath from "ffmpeg-static";
import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url, { alias: { "@": path.resolve("src") } });
const spec = await jiti.import("../src/lib/presets/spec.ts");
const { PLANS } = await jiti.import("../src/config/product.ts");

const run = promisify(execFile);
const [command, id, ...rest] = process.argv.slice(2);
const option = (name) => {
  const at = rest.indexOf(`--${name}`);
  return at === -1 ? null : (rest[at + 1] ?? "");
};
const usd = (n) => `${n.toFixed(2)} $`;
const eur = (n) => `${n.toFixed(2)} €`;
const readJson = async (file, fallback) => JSON.parse(await readFile(file, "utf8").catch(() => JSON.stringify(fallback)));

async function presetIds() {
  const entries = await readdir("presets", { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
}

async function loadPreset(presetId) {
  if (!presetId) throw new Error("Indique l'identifiant du preset.");
  return readJson(path.join("presets", presetId, "preset.json"), null);
}

const presetFile = (preset, relative) => path.join("presets", preset.id, relative);
const labDir = (preset) => path.join(".cache", "preset-lab", preset.id);

// --- Vérifications ---------------------------------------------------------

async function maskApproved(preset) {
  const manifest = await readJson(presetFile(preset, "assets/manifest.json"), {});
  const review = manifest.mask_review;
  if (!review || !manifest.files?.depth || !manifest.files?.mask) return false;
  return review.depth_sha256 === manifest.files.depth.sha256 && review.mask_sha256 === manifest.files.mask.sha256;
}

async function problemsOf(preset) {
  const urls = await readJson(presetFile(preset, "assets/urls.json"), {});
  const benchmark = await readJson(presetFile(preset, "benchmark.json"), null);
  const problems = spec.presetProblems(preset, {
    exists: (asset) => existsSync(presetFile(preset, asset)),
    benchmark,
    maskApproved: await maskApproved(preset),
    uploaded: (key) => Boolean(urls[key]?.url),
  });
  if (!existsSync(presetFile(preset, preset.economics.benchmark))) problems.push(`${preset.economics.benchmark} manquant`);
  return problems;
}

async function check() {
  let failed = false;
  for (const presetId of await presetIds()) {
    const preset = await loadPreset(presetId);
    const problems = await problemsOf(preset);
    if (problems.length === 0) {
      console.log(`[preset-lab] ${presetId} ${preset.version} (${preset.status}) : OK`);
      continue;
    }
    failed = true;
    console.error(`[preset-lab] ${presetId} ${preset.version} (${preset.status}) :`);
    for (const problem of problems) console.error(`  - ${problem}`);
  }
  if (failed) process.exit(1);
}

async function economics() {
  const preset = await loadPreset(id);
  const rows = preset.variants.map((variant) => {
    const tokens = spec.minTokens(preset, variant.id);
    return {
      Variante: variant.id + (variant.id === preset.selected_variant ? " (retenue)" : ""),
      "Coût par commande": usd(spec.runCostUsd(preset, variant.id)),
      "Coût par vidéo acceptée": usd(spec.acceptedCostUsd(preset, variant.id)),
      "Tokens minimum": tokens,
      "Marge au pire plan": `${Math.round(spec.marginRate(preset, variant.id, tokens) * 100)} %`,
    };
  });
  console.log(`\n${preset.name} ${preset.version}, ${preset.reference.seconds} s, ${Math.round(preset.economics.expected_failure_rate * 100)} % d'échecs prévus :`);
  console.table(rows);
  console.log(`Prix fixé : ${preset.economics.tokens} tokens, marge de ${Math.round(spec.marginRate(preset) * 100)} % au pire plan avec ${preset.selected_variant}.`);
  console.log("Ce que paie le client pour ce prix :");
  for (const plan of Object.values(PLANS)) {
    console.log(`  ${plan.label.padEnd(12)} ${eur((preset.economics.tokens * plan.priceEur) / plan.monthlyTokens)}`);
  }
}

// --- Essais payants --------------------------------------------------------

function parseClip() {
  const clip = option("clip");
  if (!clip) return null;
  const [from, to] = clip.split("-").map(Number);
  if (!(from >= 0) || !(to > from)) throw new Error("--clip attend début-fin en secondes, ex. 4.5-9.5");
  return [from, to];
}

function trialCost(preset, variantId, clip) {
  const seconds = clip ? clip[1] - clip[0] : preset.reference.seconds;
  return spec.runCostUsd(preset, variantId, seconds);
}

async function plan() {
  const preset = await loadPreset(id);
  const clip = parseClip();
  const variants = (option("variants") ?? "").split(",").filter(Boolean);
  const photos = Number(option("photos") ?? 1);
  if (variants.length === 0) throw new Error("Indique --variants a,b");
  let total = 0;
  const rows = variants.map((variantId) => {
    const cost = trialCost(preset, variantId, clip);
    total += cost * photos;
    const variant = spec.variantOf(preset, variantId);
    return { Variante: variantId, Modèle: preset.models[variant.model].endpoint, Source: variant.source, "Par photo": usd(cost), Total: usd(cost * photos) };
  });
  const seconds = clip ? `${clip[0]} à ${clip[1]} s` : `${preset.reference.seconds} s`;
  console.log(`\nEssai : ${photos} photo(s), ${seconds}. Rien n'est lancé par cette commande.`);
  console.table(rows);
  console.log(`Total estimé : ${usd(total)}`);
}

const sha256 = async (file) => createHash("sha256").update(await readFile(file)).digest("hex");
const IMAGE_TYPES = { ".png": "image/png", ".webp": "image/webp" };
const imageType = (file) => IMAGE_TYPES[path.extname(file).toLowerCase()] ?? "image/jpeg";

async function ledger(preset, entry) {
  await mkdir(labDir(preset), { recursive: true });
  await appendFile(path.join(labDir(preset), "depenses.jsonl"), JSON.stringify({ date: new Date().toISOString(), ...entry }) + "\n");
}

// Sur un extrait, le fichier fixe est recoupé (une seule fois) et envoyé chez fal.
async function clipUrl(fal, preset, assetKey, clip, cache) {
  const file = presetFile(preset, preset.reference.assets[assetKey]);
  if (!existsSync(file)) throw new Error(`Fichier manquant : ${file}`);
  const hash = await sha256(file);
  const key = `${assetKey}:${hash}:${clip?.join("-") ?? "entier"}`;
  if (cache[key]) return cache[key];
  let upload = file;
  if (clip) {
    upload = path.join(labDir(preset), `clip-${assetKey}-${clip.join("-")}.mp4`);
    const frames = Math.round((clip[1] - clip[0]) * preset.reference.fps);
    await run(ffmpegPath, [
      "-y", "-hide_banner", "-loglevel", "error", "-threads", "4", "-ss", String(clip[0]), "-i", file, "-frames:v", String(frames),
      "-c:v", "libx264", "-preset", "slow", "-crf", "14", "-pix_fmt", "yuv420p", "-movflags", "+faststart", upload,
    ]);
  }
  const url = await fal.storage.upload(new Blob([await readFile(upload)], { type: "video/mp4" }), { lifecycle: { expiresIn: "30d" } });
  cache[key] = url;
  return url;
}

async function trial() {
  const preset = await loadPreset(id);
  const variantId = option("variant");
  const photoPaths = (option("photos") ?? "").split(",").filter(Boolean);
  const clip = parseClip();
  if (!variantId || photoPaths.length === 0) throw new Error("Indique --variant et --photos");
  const variant = spec.variantOf(preset, variantId);
  const cost = trialCost(preset, variantId, clip);
  console.log(`[preset-lab] ${variantId}, ${photoPaths.length} photo(s), ${clip ? clip.join(" à ") + " s" : "vidéo entière"} : ≈ ${usd(cost)}`);
  const maxUsd = Number(option("max-usd"));
  if (!rest.includes("--go")) {
    console.log("[preset-lab] rien n'est lancé sans --go et --max-usd.");
    return;
  }
  if (!(maxUsd > 0)) throw new Error("Indique le plafond de cet essai : --max-usd.");
  if (cost > maxUsd) throw new Error(`Coût estimé de ${usd(cost)} au-dessus du plafond de ${usd(maxUsd)}.`);
  if (variant.source === "depth" && !(await maskApproved(preset))) {
    throw new Error("Masque non approuvé : voir scripts/preset-prepare.mjs approve-mask.");
  }

  const { fal } = await import("@fal-ai/client");
  if (!process.env.FAL_KEY) throw new Error("FAL_KEY manquant.");
  fal.config({ credentials: process.env.FAL_KEY });
  const { advance, newJob } = await jiti.import("../src/lib/presets/machine.ts");
  const { PROVIDERS } = await jiti.import("../src/lib/presets/provider.ts");
  const { judge } = await jiti.import("../src/lib/presets/vision.ts");
  const { assembleVideo } = await jiti.import("../src/lib/presets/assemble.ts");

  const runId = `${new Date().toISOString().replace(/[:.]/g, "-")}-${variantId}`;
  const dir = path.join(labDir(preset), runId);
  await mkdir(dir, { recursive: true });
  const cachePath = path.join(labDir(preset), "clips.json");
  const cache = await readJson(cachePath, {});
  const source = await clipUrl(fal, preset, variant.source === "depth" ? "depth" : "raw", clip, cache);
  const heroFile = presetFile(preset, preset.reference.assets.hero_face);
  const heroKey = `hero:${await sha256(heroFile)}`;
  cache[heroKey] ??= await fal.storage.upload(new Blob([await readFile(heroFile)], { type: "image/jpeg" }), { lifecycle: { expiresIn: "30d" } });
  await writeFile(cachePath, JSON.stringify(cache, null, 2));

  // Photos de test : gardées un jour chez fal, le temps de l'essai.
  const photoUrls = await Promise.all(
    photoPaths.map(async (file) => fal.storage.upload(new Blob([await readFile(file)], { type: imageType(file) }), { lifecycle: { expiresIn: "1d" } })),
  );

  const seconds = clip ? clip[1] - clip[0] : preset.reference.seconds;
  const job = newJob(randomUUID(), preset, variantId);
  const save = async (state) => writeFile(path.join(dir, "job.json"), JSON.stringify(state, null, 2));
  const deps = {
    provider: (providerId) => {
      const provider = PROVIDERS[providerId];
      return {
        ...provider,
        submit: async (endpoint, input, options) => {
          const requestId = await provider.submit(endpoint, input, options);
          await writeFile(path.join(dir, `requete-${endpoint.split("/").at(-1)}.json`), JSON.stringify({ endpoint, requestId, input }, null, 2));
          await ledger(preset, { run: runId, endpoint, requestId, photos: photoPaths.map((p) => path.basename(p)) });
          return requestId;
        },
      };
    },
    save,
    values: async () => ({
      source_url: source,
      photo_1: photoUrls[0],
      photo_2: photoUrls[1] ?? null,
      hero_face: cache[heroKey],
      hero_face_frame: Math.max(1, preset.reference.hero_frames.hero_face - Math.round((clip?.[0] ?? 0) * preset.reference.fps) + 1),
      duration: seconds,
    }),
    webhookUrl: () => null,
    judge: (check, imageUrls) => judge(PROVIDERS.fal, preset, preset.qa[check], imageUrls),
    assemble: async (_job, generatedUrl) => {
      const res = await fetch(generatedUrl);
      if (!res.ok) throw new Error(`Vidéo générée illisible (${res.status})`);
      const generated = Buffer.from(await res.arrayBuffer());
      await writeFile(path.join(dir, "brut.mp4"), generated);
      const { video, sheet } = await assembleVideo(preset, generated, clip ? { clip } : {});
      await writeFile(path.join(dir, "final.mp4"), video);
      await writeFile(path.join(dir, "planche.jpg"), sheet);
      const sheetUrl = await fal.storage.upload(new Blob([sheet], { type: "image/jpeg" }), { lifecycle: { expiresIn: "1d" } });
      return { url: path.join(dir, "final.mp4"), sheetUrl };
    },
    settle: async () => {},
    notify: async () => {},
    log: (message) => console.log(`[preset-lab] ${message}`),
  };

  await save(job);
  await writeFile(path.join(dir, "essai.json"), JSON.stringify({ preset: preset.id, version: preset.version, variant: variantId, clip, photos: photoPaths, estimated_usd: cost }, null, 2));
  const started = Date.now();
  while (job.status === "running") {
    try {
      await advance(job, preset, deps);
    } catch (err) {
      // Fournisseur injoignable : la tâche n'est pas perdue, on redemande.
      console.warn(`[preset-lab] ${err.message}`);
    }
    if (job.status !== "running") break;
    if (Date.now() - started > 40 * 60 * 1000) throw new Error(`Essai trop long. Reprendre à partir de ${dir}/job.json, sans relancer.`);
    await new Promise((resolve) => setTimeout(resolve, 10_000));
  }
  await save(job);
  console.log(`[preset-lab] ${job.status === "done" ? "terminé" : `échec : ${job.error}`}, ${Math.round((Date.now() - started) / 1000)} s, dans ${dir}`);
}

async function report() {
  const preset = await loadPreset(id);
  const base = labDir(preset);
  const entries = existsSync(base) ? await readdir(base, { withFileTypes: true }) : [];
  const runs = [];
  for (const entry of entries.filter((e) => e.isDirectory())) {
    const info = await readJson(path.join(base, entry.name, "essai.json"), null);
    const job = await readJson(path.join(base, entry.name, "job.json"), null);
    if (info && job) runs.push({ dir: entry.name, info, job });
  }
  runs.sort((a, b) => a.dir.localeCompare(b.dir));
  const esc = (text) => String(text).replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
  const cards = runs.map(({ dir, info, job }) => {
    const verdict = job.steps?.video?.verdict;
    return `<article>
      <h2>${esc(info.variant)}</h2>
      <p>${esc(info.photos.map((p) => path.basename(p)).join(", "))} · ${info.clip ? esc(info.clip.join(" à ")) + " s" : "vidéo entière"} · ≈ ${info.estimated_usd.toFixed(2)} $</p>
      ${job.status === "done" ? `<video src="${esc(dir)}/final.mp4" controls playsinline loop preload="metadata"></video><img src="${esc(dir)}/planche.jpg" alt="">` : `<p class="err">${esc(job.status)} ${esc(job.error ?? "")}</p>`}
      <details><summary>Verdict du modèle de vision</summary><pre>${esc(JSON.stringify(verdict ?? null, null, 2))}</pre></details>
    </article>`;
  });
  const html = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Preset Lab · ${esc(preset.name)}</title>
<style>body{margin:0;padding:16px;font:15px/1.4 system-ui,sans-serif;background:#111;color:#eee}h1{font-size:20px}main{display:grid;gap:16px;grid-template-columns:repeat(auto-fill,minmax(280px,1fr))}article{background:#1c1c1e;border-radius:14px;padding:12px}h2{font-size:15px;margin:0}p{margin:4px 0 10px;color:#aaa;font-size:13px}video,img{display:block;width:100%;border-radius:10px;margin-bottom:8px}pre{white-space:pre-wrap;font-size:12px}.err{color:#ff8a80}</style>
<h1>${esc(preset.name)} ${esc(preset.version)} : ${runs.length} essai(s)</h1><main>${cards.join("\n")}</main>`;
  const file = path.join(base, "report.html");
  await mkdir(base, { recursive: true });
  await writeFile(file, html);
  console.log(`[preset-lab] ${runs.length} essai(s) : ${file}`);
}

// --- Vote à l'aveugle ------------------------------------------------------

async function adminDb() {
  const { createClient } = await import("@supabase/supabase-js");
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("Variables Supabase manquantes.");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// Une paire par photo : le dernier essai réussi du candidat et du comparateur.
async function latestRuns(preset, variantId) {
  const base = labDir(preset);
  const byPhoto = new Map();
  for (const entry of (await readdir(base, { withFileTypes: true })).filter((e) => e.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
    const info = await readJson(path.join(base, entry.name, "essai.json"), null);
    const job = await readJson(path.join(base, entry.name, "job.json"), null);
    if (info?.variant === variantId && job?.status === "done" && !info.clip) {
      byPhoto.set(info.photos[0], path.join(base, entry.name, "final.mp4"));
    }
  }
  return byPhoto;
}

async function blind() {
  const preset = await loadPreset(id);
  const candidate = option("candidate");
  const comparator = option("against");
  if (!candidate || !comparator) throw new Error("Indique --candidate et --against.");
  const candidates = await latestRuns(preset, candidate);
  const comparators = await latestRuns(preset, comparator);
  const photos = [...candidates.keys()].filter((photo) => comparators.has(photo));
  if (photos.length === 0) throw new Error("Aucune photo testée avec les deux variantes, en vidéo entière.");

  const db = await adminDb();
  const { LAB_BUCKET } = await jiti.import("../src/lib/presets/vote.ts");
  if ((await db.storage.getBucket(LAB_BUCKET)).error) {
    const created = await db.storage.createBucket(LAB_BUCKET, { public: false });
    if (created.error && !/already exists/i.test(created.error.message)) throw created.error;
  }
  const folder = randomUUID();
  const send = async (file, contentType) => {
    // Noms aléatoires : le chemin ne dit rien de la variante.
    const name = `${folder}/${randomUUID()}${path.extname(file)}`;
    const uploaded = await db.storage.from(LAB_BUCKET).upload(name, await readFile(file), { contentType });
    if (uploaded.error) throw uploaded.error;
    return name;
  };
  const pairs = [];
  for (const photo of photos) {
    const roles = Math.random() < 0.5 ? ["candidate", "comparator"] : ["comparator", "candidate"];
    const fileOf = (role) => (role === "candidate" ? candidates : comparators).get(photo);
    pairs.push({
      photo: await send(photo, imageType(photo)),
      a: { path: await send(fileOf(roles[0]), "video/mp4"), role: roles[0] },
      b: { path: await send(fileOf(roles[1]), "video/mp4"), role: roles[1] },
    });
  }
  // Ordre des paires tiré au hasard.
  pairs.sort(() => Math.random() - 0.5);
  const { data, error } = await db
    .from("preset_lab_campaigns")
    .insert({
      preset_id: preset.id,
      preset_version: preset.version,
      candidate_variant: candidate,
      comparator_variant: comparator,
      pairs,
      closes_at: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString(),
    })
    .select("id")
    .single();
  if (error) throw error;
  const base = process.env.PUBLIC_BASE_URL ?? "http://localhost:3000";
  console.log(`[preset-lab] ${pairs.length} paire(s). Lien à envoyer aux votants (ouvert 14 jours) : ${base}/lab/vote/${data.id}`);
}

// Égalité : moins d'un quart de point d'écart, soit moins que ce qu'un votant
// distingue d'une note à l'autre une fois moyenné.
const TIE_MARGIN = 0.25;
const FAILURE_NOTE = 2;

async function score() {
  const preset = await loadPreset(id);
  const campaignId = option("campaign");
  if (!campaignId) throw new Error("Indique --campaign.");
  const db = await adminDb();
  const { VOTE_CRITERIA } = await jiti.import("../src/lib/presets/vote.ts");
  const campaign = await db.from("preset_lab_campaigns").select("*").eq("id", campaignId).single();
  if (campaign.error) throw campaign.error;
  const votes = await db.from("preset_lab_votes").select("*").eq("campaign_id", campaignId);
  if (votes.error) throw votes.error;

  const pairs = campaign.data.pairs;
  const raters = new Set(votes.data.map((vote) => vote.rater_id));
  const mean = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;
  const overall = (scores) => mean(VOTE_CRITERIA.map(({ id: criterion }) => scores[criterion]));

  const rows = [];
  let winsOrTies = 0;
  let failures = 0;
  pairs.forEach((pair, index) => {
    const notes = votes.data.filter((vote) => vote.pair_index === index);
    if (notes.length === 0) return;
    const sideOf = (role) => (pair.a.role === role ? "a" : "b");
    const candidate = mean(notes.map((vote) => overall(vote.scores[sideOf("candidate")])));
    const comparator = mean(notes.map((vote) => overall(vote.scores[sideOf("comparator")])));
    if (candidate >= comparator - TIE_MARGIN) winsOrTies++;
    if (candidate <= FAILURE_NOTE) failures++;
    rows.push({ Paire: index + 1, Votes: notes.length, Candidat: candidate.toFixed(2), Comparateur: comparator.toFixed(2) });
  });
  if (rows.length === 0) throw new Error("Aucun vote pour le moment.");
  console.table(rows);

  const result = {
    version: campaign.data.preset_version,
    variant: campaign.data.candidate_variant,
    comparator: campaign.data.comparator_variant,
    raters: raters.size,
    pairs: rows.length,
    win_or_tie_rate: winsOrTies / rows.length,
    failure_rate: failures / rows.length,
    margin_rate: spec.marginRate(preset, campaign.data.candidate_variant),
    date: new Date().toISOString().slice(0, 10),
    campaign: campaignId,
  };
  await writeFile(presetFile(preset, "benchmark.json"), JSON.stringify(result, null, 2) + "\n");
  const pct = (n) => `${Math.round(n * 100)} %`;
  console.log(`Votants : ${result.raters} | gagne ou égalité : ${pct(result.win_or_tie_rate)} | échecs : ${pct(result.failure_rate)} | marge : ${pct(result.margin_rate)}`);
  const problems = spec.benchmarkProblems({ ...preset, selected_variant: result.variant, version: result.version }, result);
  console.log(problems.length === 0 ? "Critères de publication atteints." : `Pas encore publiable :\n  - ${problems.join("\n  - ")}`);
}

const commands = { check, economics, plan, run: trial, report, blind, score };
if (!commands[command]) throw new Error(`Commande inconnue : ${command}`);
await commands[command]();
