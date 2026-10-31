// Appels à l'API fal.ai (REST), uniquement côté serveur :
// la clé FAL_KEY ne doit jamais arriver dans le navigateur.
import { fal } from "@fal-ai/client";
import { VIDEO_MODELS, type VideoModelId } from "@/config/product";
import referenceVideo from "@/config/reference-video.json";
import { createNotificationToken } from "@/lib/notification-token";

const QUEUE_URL = "https://queue.fal.run";

// Les identifiants fal sont des UUID : on refuse tout le reste
// pour ne jamais glisser n'importe quoi dans l'URL envoyée à fal.ai.
export const FAL_REQUEST_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type GenerationStatus =
  | { status: "queued"; position: number | null }
  | { status: "running" }
  | { status: "done"; videoUrl: string }
  | { status: "failed"; error: string };

// Refus du filtre de contenu du modèle (célébrité, nudité…) : le client doit
// changer de photo, réessayer ne servirait à rien.
export class ContentRefusedError extends Error {}

// URL écrite automatiquement par scripts/prepare-video.mjs (dev et build).
type ReferenceVideo = { url?: string };

// Pour suivre une tâche, fal n'utilise que "propriétaire/app"
// (ex. "fal-ai/kling-video"), pas le chemin complet du modèle.
function requestUrl(model: VideoModelId, requestId: string): string {
  const appId = VIDEO_MODELS[model].falModel.split("/").slice(0, 2).join("/");
  return `${QUEUE_URL}/${appId}/requests/${requestId}`;
}

// URL publique du site (PUBLIC_BASE_URL) : fal ne peut pas joindre localhost.
export function publicBaseUrl(): string {
  const base = process.env.PUBLIC_BASE_URL?.replace(/\/+$/, "");
  if (!base?.startsWith("https://")) {
    throw new Error("PUBLIC_BASE_URL manquant dans .env.local (URL https publique, ex. un tunnel en local)");
  }
  return base;
}

// URL appelée par fal à la fin de la vidéo. Le jeton contient l'email chiffré.
// En local sans PUBLIC_BASE_URL, pas d'email : la page suit la vidéo seule.
// En production, l'email est promis au client : la configuration est obligatoire.
function webhookUrl(email: string, model: VideoModelId): string | null {
  if (!process.env.PUBLIC_BASE_URL && process.env.NODE_ENV !== "production") {
    console.warn("PUBLIC_BASE_URL vide : la vidéo ne sera pas envoyée par email.");
    return null;
  }
  return `${publicBaseUrl()}/api/webhooks/fal?model=${model}&token=${createNotificationToken(email)}`;
}

function falKey(): string {
  const key = process.env.FAL_KEY;
  if (!key) throw new Error("FAL_KEY manquant dans .env.local");
  return key;
}

function falHeaders() {
  return { Authorization: `Key ${falKey()}`, "Content-Type": "application/json" };
}

// Paramètres propres à chaque modèle, avec le même prompt fixe.
function modelInput(model: VideoModelId, videoUrl: string, photoUrls: string[]) {
  switch (model) {
    case "kling4": {
      const { prompt, resolution } = VIDEO_MODELS.kling4;
      // Un "élément" Kling : une vue de face (la photo en pied) + 1 à 3 photos
      // de référence (le gros plan du visage, ou la photo en pied à défaut).
      const [front, ...others] = photoUrls;
      return {
        prompt,
        video_url: videoUrl,
        elements: [{ frontal_image_url: front, reference_image_urls: others.length > 0 ? others : [front] }],
        resolution,
      };
    }
  }
}

// Lance la génération et renvoie l'identifiant de la tâche vidéo.
// Les photos sont d'abord déposées sur le stockage fal : tous les modèles
// acceptent une URL, pas forcément une image intégrée à la requête.
// Si l'email est activé, la vidéo est envoyée à "email" par le webhook,
// même si la page est fermée.
export async function startGeneration(
  photos: Blob[],
  email: string,
  model: VideoModelId,
): Promise<{ requestId: string; emailNotification: boolean }> {
  // REFERENCE_VIDEO_URL reste possible pour forcer une autre vidéo.
  const videoUrl = process.env.REFERENCE_VIDEO_URL || (referenceVideo as ReferenceVideo).url;
  if (!videoUrl) {
    throw new Error("Vidéo de référence non préparée : mets public/exemple.mp4 et FAL_KEY, puis relance.");
  }

  // Avant tout envoi : une configuration manquante ne doit pas consommer de crédits.
  const notifyUrl = webhookUrl(email, model);
  fal.config({ credentials: falKey() });
  const photoUrls = await Promise.all(photos.map((photo) => fal.storage.upload(photo)));

  // Via la file d'attente (plusieurs minutes). Si l'email est activé, fal
  // appelle notifyUrl (paramètre fal_webhook) quand la vidéo est finie.
  const query = notifyUrl ? `?fal_webhook=${encodeURIComponent(notifyUrl)}` : "";
  const res = await fetch(`${QUEUE_URL}/${VIDEO_MODELS[model].falModel}${query}`, {
    method: "POST",
    headers: falHeaders(),
    body: JSON.stringify(modelInput(model, videoUrl, photoUrls)),
  });
  if (!res.ok) {
    const detail = await res.text();
    if (detail.includes("content_policy_violation")) {
      throw new ContentRefusedError(detail);
    }
    throw new Error(`fal.ai a refusé la tâche (${res.status}) : ${detail}`);
  }
  const { request_id } = (await res.json()) as { request_id: string };
  return { requestId: request_id, emailNotification: notifyUrl !== null };
}

export async function getGenerationStatus(model: VideoModelId, requestId: string): Promise<GenerationStatus> {
  const base = requestUrl(model, requestId);

  const res = await fetch(`${base}/status`, { headers: falHeaders(), cache: "no-store" });
  if (!res.ok) return { status: "failed", error: `Statut indisponible (${res.status})` };
  const state = (await res.json()) as { status: string; queue_position?: number };

  if (state.status === "IN_QUEUE") {
    return { status: "queued", position: state.queue_position ?? null };
  }
  if (state.status === "IN_PROGRESS") return { status: "running" };

  // COMPLETED : la tâche est finie, avec succès ou en erreur.
  const result = await fetch(base, { headers: falHeaders(), cache: "no-store" });
  if (!result.ok) {
    return { status: "failed", error: `Génération échouée (${result.status}) : ${await result.text()}` };
  }
  const output = (await result.json()) as { video?: { url: string } };
  if (!output.video?.url) return { status: "failed", error: "Aucune vidéo renvoyée par fal.ai" };
  return { status: "done", videoUrl: output.video.url };
}

// Résultat définitif d'une tâche, pour le webhook. On le relit chez fal avec
// FAL_KEY plutôt que de croire le contenu du webhook : seule une tâche de
// notre compte peut aboutir à un email.
// Renvoie null si la tâche est inconnue de notre compte, et lève une erreur
// si fal ne répond pas (le webhook répond alors 500 et fal le renverra).
export async function getFinishedGeneration(
  model: VideoModelId,
  requestId: string,
): Promise<Extract<GenerationStatus, { status: "done" | "failed" }> | null> {
  const base = requestUrl(model, requestId);
  const temporary = (status: number) => status === 429 || status >= 500;

  const res = await fetch(`${base}/status`, { headers: falHeaders(), cache: "no-store" });
  if (temporary(res.status)) throw new Error(`Statut fal indisponible (${res.status})`);
  if (!res.ok) return null;
  const state = (await res.json()) as { status: string };
  if (state.status !== "COMPLETED") throw new Error(`Tâche fal pas encore terminée (${state.status})`);

  const result = await fetch(base, { headers: falHeaders(), cache: "no-store" });
  if (temporary(result.status)) throw new Error(`Résultat fal indisponible (${result.status})`);
  if (!result.ok) {
    return { status: "failed", error: `Génération échouée (${result.status}) : ${await result.text()}` };
  }
  const output = (await result.json()) as { video?: { url: string } };
  if (!output.video?.url) return { status: "failed", error: "Aucune vidéo renvoyée par fal.ai" };
  return { status: "done", videoUrl: output.video.url };
}
