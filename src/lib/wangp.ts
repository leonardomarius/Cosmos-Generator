// Générations rendues sur le PC avec WanGP au lieu de fal.ai : images, vidéos
// par prompt, vidéo de star et vidéo de la statue (presets du planificateur).
// Le site ne peut pas joindre le PC : c'est le planificateur local
// (WanGP-Planificateur/server.py) qui vient chercher les tâches ici, par les
// routes /api/wangp/*, protégées par WANGP_BRIDGE_SECRET.
import { timingSafeEqual } from "node:crypto";
import type { ModelId } from "@/config/product";
import { sendGenerationFailedEmail, sendResultReadyEmail } from "@/lib/email";
import type { GenerationRequest, GenerationStatus } from "@/lib/fal";
import { publicBaseUrl } from "@/lib/fal";
import { adminClient } from "@/lib/supabase";
import { settleGeneration } from "@/lib/tokens";
import { signedVideoUrl, videosBucket } from "@/lib/video-storage";

// Dossiers du bucket "videos", vidés chaque jour par /api/cron/purge-videos.
export const WANGP_FOLDERS = ["wangp", "wangp-entrees"] as const;

// Sans nouvelle du PC passé ces délais, la tâche échoue et les tokens sont rendus.
const MAX_WAIT_MS = 24 * 3600 * 1000;
const MAX_RENDER_MS = 4 * 3600 * 1000;

const EXTENSIONS: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

// Tous les services passent par le PC dès que le pont est configuré.
export function handledByWangp(): boolean {
  return Boolean(process.env.WANGP_BRIDGE_SECRET);
}

// Fichier résultat : vidéo, ou image pour le service image.
const RESULT_TYPES: Record<string, string> = { mp4: "video/mp4", png: "image/png", jpg: "image/jpeg", webp: "image/webp" };

// Le planificateur s'annonce avec "Authorization: Bearer <WANGP_BRIDGE_SECRET>".
export function isBridgeRequest(request: Request): boolean {
  const secret = process.env.WANGP_BRIDGE_SECRET;
  if (!secret) return false;
  const given = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

function emailsEnabled(): boolean {
  return Boolean(process.env.PUBLIC_BASE_URL) || process.env.NODE_ENV === "production";
}

// Met la génération dans la file du PC. L'identifiant de la génération sert de request id.
export async function startWangpGeneration(
  req: GenerationRequest,
  email: string,
  generationId: string,
): Promise<{ requestId: string; emailNotification: boolean }> {
  const bucket = await videosBucket();
  const photos = "photos" in req ? req.photos : [];
  const paths = await Promise.all(
    photos.map(async (photo, i) => {
      const path = `wangp-entrees/${generationId}-${i + 1}.${EXTENSIONS[photo.type] ?? "jpg"}`;
      const uploaded = await bucket.upload(path, photo, { contentType: photo.type, upsert: true });
      if (uploaded.error) throw uploaded.error;
      return path;
    }),
  );
  const { error } = await adminClient().from("wangp_jobs").insert({
    id: generationId,
    model: req.model,
    email,
    prompt: "prompt" in req ? req.prompt : "",
    duration: "duration" in req ? req.duration : null,
    aspect_ratio: "aspectRatio" in req ? req.aspectRatio : null,
    options: req.model === "kling4" ? { measurements: req.measurements } : {},
    photos: paths,
  });
  if (error) throw error;
  return { requestId: generationId, emailNotification: emailsEnabled() };
}

// Fin d'une tâche : statut, tokens rendus si échec, email au client, images effacées.
async function finishJob(id: string, result: { status: "done"; path: string } | { status: "failed"; error: string }) {
  const db = adminClient();
  const { data: job, error } = await db
    .from("wangp_jobs")
    .update({
      status: result.status,
      result_path: result.status === "done" ? result.path : null,
      error: result.status === "failed" ? result.error.slice(0, 500) : null,
      finished_at: new Date().toISOString(),
    })
    .eq("id", id)
    .in("status", ["queued", "running"])
    .select("id, model, email, photos")
    .maybeSingle();
  if (error) throw error;
  if (!job) return; // Déjà terminée : rien à refaire.

  await settleGeneration({ id }, result.status);
  if (job.photos.length > 0) {
    await (await videosBucket()).remove(job.photos).catch(console.error);
  }
  if (!emailsEnabled()) return;
  const model = job.model as ModelId;
  if (result.status === "done") {
    await sendResultReadyEmail(job.email, model, await signedVideoUrl(result.path), id);
  } else {
    console.error(`Génération WanGP ${id} échouée : ${result.error}`);
    const retryPath = model === "kling4" ? "/creer" : model === "statue" ? "/statue" : "/";
    await sendGenerationFailedEmail(job.email, model, `${publicBaseUrl()}${retryPath}`, id);
  }
}

// Tâches oubliées (PC éteint, rendu coupé) : échec et remboursement.
async function expireStaleJobs() {
  const db = adminClient();
  const now = Date.now();
  const [waiting, rendering] = await Promise.all([
    db.from("wangp_jobs").select("id").eq("status", "queued").lt("created_at", new Date(now - MAX_WAIT_MS).toISOString()),
    db.from("wangp_jobs").select("id").eq("status", "running").lt("claimed_at", new Date(now - MAX_RENDER_MS).toISOString()),
  ]);
  for (const job of waiting.data ?? []) {
    await finishJob(job.id, { status: "failed", error: "Le PC de rendu n'a pas pris la tâche à temps." });
  }
  for (const job of rendering.data ?? []) {
    await finishJob(job.id, { status: "failed", error: "Le rendu sur le PC n'a pas abouti à temps." });
  }
}

// Statut pour la page du client. null : ce n'est pas une tâche WanGP.
export async function getWangpStatus(id: string): Promise<GenerationStatus | null> {
  await expireStaleJobs().catch(console.error);
  const db = adminClient();
  const { data: job, error } = await db
    .from("wangp_jobs")
    .select("status, result_path, created_at")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!job) return null;
  if (job.status === "running") return { status: "running" };
  if (job.status === "done" && job.result_path) return { status: "done", url: await signedVideoUrl(job.result_path) };
  if (job.status === "failed") return { status: "failed", error: "La vidéo n'a pas pu être créée. Tes tokens ont été rendus." };
  const { count } = await db
    .from("wangp_jobs")
    .select("id", { count: "exact", head: true })
    .eq("status", "queued")
    .lt("created_at", job.created_at);
  return { status: "queued", position: count ?? null };
}

// Donne au PC la plus ancienne tâche en attente, avec des liens vers les images.
export async function claimNextJob() {
  await expireStaleJobs().catch(console.error);
  const db = adminClient();
  const { data: next, error } = await db
    .from("wangp_jobs")
    .select("id")
    .eq("status", "queued")
    .order("created_at")
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!next) return null;
  const { data: job, error: claimError } = await db
    .from("wangp_jobs")
    .update({ status: "running", claimed_at: new Date().toISOString() })
    .eq("id", next.id)
    .eq("status", "queued")
    .select("id, model, prompt, duration, aspect_ratio, options, photos")
    .maybeSingle();
  if (claimError) throw claimError;
  if (!job) return null;
  const bucket = await videosBucket();
  const photos = await Promise.all(
    job.photos.map(async (path) => {
      const signed = await bucket.createSignedUrl(path, 3600);
      if (signed.error) throw signed.error;
      return signed.data.signedUrl;
    }),
  );
  return {
    id: job.id,
    model: job.model,
    prompt: job.prompt,
    duration: job.duration,
    aspectRatio: job.aspect_ratio,
    options: job.options,
    photos,
  };
}

export function isResultExtension(value: unknown): value is string {
  return typeof value === "string" && Object.hasOwn(RESULT_TYPES, value);
}

function resultPath(id: string, extension: string) {
  return `wangp/${id}.${extension}`;
}

// Lien d'envoi direct vers Supabase : une vidéo dépasse la limite de 4,5 Mo de Vercel.
export async function createResultUploadUrl(id: string, extension: string): Promise<string | null> {
  const { data: job } = await adminClient().from("wangp_jobs").select("status").eq("id", id).maybeSingle();
  if (job?.status !== "running") return null;
  const signed = await (await videosBucket()).createSignedUploadUrl(resultPath(id, extension), { upsert: true });
  if (signed.error) throw signed.error;
  return signed.data.signedUrl;
}

// Le PC signale la fin. "done" n'est accepté que si le résultat est bien dans le bucket.
export async function completeJob(id: string, status: "done" | "failed", error: string, extension = "mp4"): Promise<boolean> {
  const { data: job } = await adminClient().from("wangp_jobs").select("status").eq("id", id).maybeSingle();
  if (!job) return false;
  if (status === "done") {
    const name = `${id}.${extension}`;
    const listed = await (await videosBucket()).list("wangp", { search: name });
    if (listed.error) throw listed.error;
    if (!listed.data.some((file) => file.name === name)) return false;
    await finishJob(id, { status: "done", path: resultPath(id, extension) });
  } else {
    await finishJob(id, { status: "failed", error: error || "Échec du rendu WanGP." });
  }
  return true;
}
