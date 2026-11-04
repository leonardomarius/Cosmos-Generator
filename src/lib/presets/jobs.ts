// Commandes de presets sur le site : photos dans un bucket privé, état de chaque
// commande dans Supabase (preset_jobs), et branchement de la machine (machine.ts)
// sur les tokens, le stockage et les emails. Serveur uniquement.
import { randomUUID } from "node:crypto";
import { presetAssetUrls, presetById, PRESETS } from "@/config/presets";
import { isAdminEmail } from "@/lib/admin";
import type { Json } from "@/lib/database.types";
import { sendPresetAlertEmail, sendPresetFailedEmail, sendPresetReadyEmail } from "@/lib/email";
import { publicBaseUrl } from "@/lib/fal";
import { assembleVideo } from "@/lib/presets/assemble";
import { advance, close, newJob, type Job, type MachineDeps } from "@/lib/presets/machine";
import { PROVIDERS } from "@/lib/presets/provider";
import { type PresetSpec, type TemplateValues, variantOf } from "@/lib/presets/spec";
import { judge, type Verdict } from "@/lib/presets/vision";
import { adminClient } from "@/lib/supabase";
import { settleGeneration } from "@/lib/tokens";
import { storeVideo } from "@/lib/video-storage";

const INPUT_BUCKET = "preset-inputs";
// Liens donnés aux fournisseurs : courts, et jamais d'URL publique pour une photo.
const SIGNED_URL_SECONDS = 50 * 60;
// Plus long qu'une exécution (maxDuration des routes) : un verrou abandonné par
// une exécution coupée finit toujours par expirer.
const LOCK_MS = 3 * 60 * 1000;
// Au-delà, une commande encore ouverte échoue et le client est remboursé.
const JOB_DEADLINE_MS = 6 * 3600 * 1000;
// Suivi de production : au-delà de 20 % d'échecs sur 7 jours, le preset se ferme seul.
const MONITOR = { windowDays: 7, maxFailureRate: 0.2, minJobs: 10 } as const;

type Row = {
  id: string;
  user_id: string;
  preset_id: string;
  preset_version: string;
  variant_id: string;
  status: string;
  stage: string;
  photo_paths: string[];
  steps: Json;
  result_url: string | null;
  error: string | null;
  error_kind: string | null;
  cost_usd: number;
  updated_at: string;
  created_at: string;
};

function toJob(row: Row): Job {
  return {
    id: row.id,
    presetId: row.preset_id,
    presetVersion: row.preset_version,
    variantId: row.variant_id,
    status: row.status as Job["status"],
    stage: row.stage as Job["stage"],
    steps: row.steps as Job["steps"],
    resultUrl: row.result_url,
    error: row.error,
    errorKind: row.error_kind as Job["errorKind"],
    costUsd: Number(row.cost_usd),
  };
}

// --- Photos ---------------------------------------------------------------

let bucketReady = false;
async function ensureBucket() {
  if (bucketReady) return;
  const storage = adminClient().storage;
  if ((await storage.getBucket(INPUT_BUCKET)).error) {
    const created = await storage.createBucket(INPUT_BUCKET, { public: false });
    if (created.error && !/already exists/i.test(created.error.message)) throw created.error;
  }
  bucketReady = true;
}

async function storeInput(file: string, body: Blob | Buffer, contentType: string): Promise<void> {
  await ensureBucket();
  const uploaded = await adminClient().storage.from(INPUT_BUCKET).upload(file, body, { contentType, upsert: true });
  if (uploaded.error) throw uploaded.error;
}

// Dépose les photos d'une commande et renvoie leurs chemins.
export async function storePhotos(photos: File[]): Promise<string[]> {
  const folder = randomUUID();
  const paths = photos.map((_, i) => `${folder}/photo-${i + 1}.jpg`);
  await Promise.all(photos.map((photo, i) => storeInput(paths[i], photo, photo.type)));
  return paths;
}

export async function signedPhotoUrls(paths: string[]): Promise<string[]> {
  if (paths.length === 0) return [];
  const { data, error } = await adminClient().storage.from(INPUT_BUCKET).createSignedUrls(paths, SIGNED_URL_SECONDS);
  if (error) throw error;
  return data.map((item) => {
    if (!item.signedUrl) throw new Error("Lien de photo indisponible");
    return item.signedUrl;
  });
}

export async function removePhotos(paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  const folder = paths[0].split("/")[0];
  const removed = await adminClient().storage.from(INPUT_BUCKET).remove([...paths, `${folder}/sheet.jpg`]);
  if (removed.error) throw removed.error;
}

// --- Accès ----------------------------------------------------------------

export async function isSwitchedOff(presetId: string): Promise<boolean> {
  const { data, error } = await adminClient().from("preset_switches").select("preset_id").eq("preset_id", presetId).maybeSingle();
  if (error) throw error;
  return data !== null;
}

// Un preset non publié n'est ouvert qu'aux administrateurs, pour les essais.
export async function canOrderPreset(preset: PresetSpec, email: string): Promise<boolean> {
  if (isAdminEmail(email)) return true;
  return preset.status === "published" && !(await isSwitchedOff(preset.id));
}

// Le preset est-il prêt à partir chez le fournisseur ? (fichiers fixes envoyés)
export function presetReady(preset: PresetSpec): boolean {
  const urls = presetAssetUrls(preset.id);
  const variant = variantOf(preset);
  if (!urls[variant.source === "depth" ? "depth" : "raw"]?.url) return false;
  return !variant.keyframe || Boolean(urls.hero_face?.url);
}

// --- Machine --------------------------------------------------------------

async function userEmail(userId: string): Promise<string | null> {
  const { data, error } = await adminClient().auth.admin.getUserById(userId);
  if (error) throw error;
  return data.user?.email ?? null;
}

function templateValues(preset: PresetSpec, job: Job, photos: string[]): TemplateValues {
  const urls = presetAssetUrls(preset.id);
  const variant = variantOf(preset, job.variantId);
  return {
    source_url: urls[variant.source === "depth" ? "depth" : "raw"]?.url ?? null,
    photo_1: photos[0] ?? null,
    photo_2: photos[1] ?? null,
    hero_face: urls.hero_face?.url ?? null,
    hero_body: urls.hero_body?.url ?? null,
    hero_profile: urls.hero_profile?.url ?? null,
    // PixVerse compte les images à partir de 1.
    hero_face_frame: preset.reference.hero_frames.hero_face + 1,
    duration: preset.reference.seconds,
  };
}

function machineDeps(preset: PresetSpec, row: Pick<Row, "id" | "user_id" | "photo_paths">): MachineDeps {
  return {
    provider: (id) => PROVIDERS[id],
    async save(job) {
      const { error } = await adminClient()
        .from("preset_jobs")
        .update({
          status: job.status,
          stage: job.stage,
          steps: job.steps as Json,
          result_url: job.resultUrl,
          error: job.error,
          error_kind: job.errorKind,
          cost_usd: job.costUsd,
          updated_at: new Date().toISOString(),
        })
        .eq("id", job.id);
      if (error) throw error;
    },
    values: async (job) => templateValues(preset, job, await signedPhotoUrls(row.photo_paths)),
    webhookUrl(job) {
      if (!process.env.PUBLIC_BASE_URL && process.env.NODE_ENV !== "production") return null;
      return `${publicBaseUrl()}/api/webhooks/presets?job=${job.id}`;
    },
    judge: (check, imageUrls): Promise<Verdict> => judge(PROVIDERS.fal, preset, preset.qa[check], imageUrls),
    async assemble(job, generatedUrl) {
      const res = await fetch(generatedUrl);
      if (!res.ok) throw new Error(`Vidéo générée illisible (${res.status})`);
      const { video, sheet } = await assembleVideo(preset, Buffer.from(await res.arrayBuffer()));
      const url = await storeVideo(`${preset.slug}/${job.id}.mp4`, video);
      const sheetPath = `${row.photo_paths[0].split("/")[0]}/sheet.jpg`;
      await storeInput(sheetPath, sheet, "image/jpeg");
      const [sheetUrl] = await signedPhotoUrls([sheetPath]);
      return { url, sheetUrl };
    },
    settle: (job) => settleGeneration({ id: job.id }, job.status === "done" ? "done" : "failed"),
    async notify(job) {
      await removePhotos(row.photo_paths).catch(console.error);
      const email = await userEmail(row.user_id);
      if (!email) return;
      if (job.status === "done" && job.resultUrl) {
        await sendPresetReadyEmail(email, preset.name, job.resultUrl, job.id);
      } else if (job.status === "failed") {
        await sendPresetFailedEmail(email, preset.name, `${publicBaseUrl()}/presets/${preset.slug}`, job.id);
      }
    },
  };
}

// Crée la commande (ses tokens sont déjà réservés sur generationId).
export async function createPresetJob(generationId: string, userId: string, preset: PresetSpec, photoPaths: string[]): Promise<void> {
  const job = newJob(generationId, preset);
  const { error } = await adminClient().from("preset_jobs").insert({
    id: job.id,
    user_id: userId,
    preset_id: job.presetId,
    preset_version: job.presetVersion,
    variant_id: job.variantId,
    stage: job.stage,
    photo_paths: photoPaths,
  });
  if (error) throw error;
}

export async function loadPresetJob(id: string) {
  const { data, error } = await adminClient().from("preset_jobs").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

// Prend le verrou de la commande, ou null si elle est finie ou déjà en cours.
async function claim(id: string): Promise<Row | null> {
  const now = new Date();
  const { data, error } = await adminClient()
    .from("preset_jobs")
    .update({ locked_until: new Date(now.getTime() + LOCK_MS).toISOString() })
    .eq("id", id)
    .eq("status", "running")
    .or(`locked_until.is.null,locked_until.lt.${now.toISOString()}`)
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function release(id: string) {
  const { error } = await adminClient().from("preset_jobs").update({ locked_until: null }).eq("id", id);
  if (error) console.error(error);
}

// Fait avancer une commande. Sans danger si elle est appelée plusieurs fois : une
// panne passagère ne change rien, la commande sera reprise au prochain passage.
export async function advancePresetJob(id: string): Promise<void> {
  const row = await claim(id);
  if (!row) return;
  try {
    const preset = presetById(row.preset_id);
    if (!preset) throw new Error(`Preset inconnu : ${row.preset_id}`);
    await advance(toJob(row), preset, machineDeps(preset, row));
  } catch (err) {
    console.error(`Commande de preset ${id} : à reprendre`, err);
  } finally {
    await release(id);
  }
}

// --- Tâche quotidienne ----------------------------------------------------

// Commandes restées ouvertes (webhook perdu, page fermée), photos oubliées et
// suivi du taux d'échec. timeBudgetMs : la tâche s'arrête à temps et reprendra
// le reste au passage suivant.
export async function runPresetMaintenance(timeBudgetMs: number) {
  const started = Date.now();
  const db = adminClient();
  const staleBefore = new Date(started - 5 * 60 * 1000).toISOString();
  const { data: open, error } = await db
    .from("preset_jobs")
    .select("*")
    .eq("status", "running")
    .lt("updated_at", staleBefore)
    .order("updated_at")
    .limit(50);
  if (error) throw error;

  let advanced = 0;
  let expired = 0;
  for (const row of open) {
    if (Date.now() - started > timeBudgetMs) break;
    if (started - Date.parse(row.created_at) > JOB_DEADLINE_MS) {
      const claimed = await claim(row.id);
      if (!claimed) continue;
      try {
        const preset = presetById(row.preset_id);
        if (!preset) throw new Error(`Preset inconnu : ${row.preset_id}`);
        await close(toJob(claimed), machineDeps(preset, claimed), { error: "Délai dépassé", kind: "failed" });
        expired++;
      } catch (err) {
        console.error(`Commande de preset ${row.id} : expiration impossible`, err);
      } finally {
        await release(row.id);
      }
      continue;
    }
    await advancePresetJob(row.id);
    advanced++;
  }

  const removedInputs = await purgeOldInputs();
  const switchedOff = await monitorFailures();
  return { advanced, expired, removedInputs, switchedOff };
}

// Les photos partent dès la fin de leur commande. Ceci rattrape celles d'une
// exécution coupée : au-delà de 24 h, aucune commande n'en a plus besoin.
async function purgeOldInputs(): Promise<number> {
  await ensureBucket();
  const bucket = adminClient().storage.from(INPUT_BUCKET);
  const cutoff = Date.now() - 24 * 3600 * 1000;
  const folders = await bucket.list("", { limit: 200 });
  if (folders.error) throw folders.error;
  let removed = 0;
  for (const { name } of folders.data) {
    const files = await bucket.list(name, { limit: 100 });
    if (files.error) throw files.error;
    const old = files.data.filter((file) => file.created_at && Date.parse(file.created_at) < cutoff);
    if (old.length === 0) continue;
    const deleted = await bucket.remove(old.map((file) => `${name}/${file.name}`));
    if (deleted.error) throw deleted.error;
    removed += old.length;
  }
  return removed;
}

// Taux d'échec par preset sur la période. Les refus du filtre du modèle ne
// comptent pas : ils viennent de la photo envoyée, pas du preset.
async function monitorFailures(): Promise<string[]> {
  const db = adminClient();
  const since = new Date(Date.now() - MONITOR.windowDays * 24 * 3600 * 1000).toISOString();
  const switchedOff: string[] = [];
  for (const preset of PRESETS) {
    if (preset.status !== "published" || (await isSwitchedOff(preset.id))) continue;
    const { data, error } = await db
      .from("preset_jobs")
      .select("status, error_kind")
      .eq("preset_id", preset.id)
      .neq("status", "running")
      .gte("created_at", since);
    if (error) throw error;
    const counted = data.filter((job) => job.error_kind !== "refused");
    if (counted.length < MONITOR.minJobs) continue;
    const rate = counted.filter((job) => job.status === "failed").length / counted.length;
    if (rate <= MONITOR.maxFailureRate) continue;

    const reason = `${Math.round(rate * 100)} % d'échecs sur ${counted.length} commandes en ${MONITOR.windowDays} jours`;
    const inserted = await db.from("preset_switches").insert({ preset_id: preset.id, reason });
    if (inserted.error) throw inserted.error;
    switchedOff.push(preset.id);
    for (const email of (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim()).filter(Boolean)) {
      await sendPresetAlertEmail(email, preset.name, reason, `${publicBaseUrl()}/presets/${preset.slug}`).catch(console.error);
    }
  }
  return switchedOff;
}
