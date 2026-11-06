// Appels à l'API fal.ai (REST), uniquement côté serveur :
// la clé FAL_KEY ne doit jamais arriver dans le navigateur.
import { fal } from "@fal-ai/client";
import { MODELS, VIDEO_RESOLUTION, type AspectRatio, type ModelId, type VideoDuration } from "@/config/product";
import referenceVideo from "@/config/reference-video.json";
import statueVideo from "@/config/statue-video.json";
import { describeBody, type BodyMeasurements } from "@/lib/body-measurements";
import { createNotificationToken } from "@/lib/notification-token";

const QUEUE_URL = "https://queue.fal.run";

// Les identifiants fal sont des UUID : on refuse tout le reste
// pour ne jamais glisser n'importe quoi dans l'URL envoyée à fal.ai.
export const FAL_REQUEST_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// "url" : la vidéo, ou l'image pour le service image.
export type GenerationStatus =
  | { status: "queued"; position: number | null }
  | { status: "running" }
  | { status: "done"; url: string }
  | { status: "failed"; error: string };

// Ce que le client demande, selon le service.
export type GenerationRequest =
  | { model: "kling4"; photos: Blob[]; measurements: BodyMeasurements }
  | { model: "statue"; photos: Blob[] }
  | { model: "image"; prompt: string; photos: Blob[]; aspectRatio: AspectRatio }
  | { model: "prompt"; prompt: string; duration: VideoDuration; aspectRatio: AspectRatio }
  | { model: "promptImages"; prompt: string; photos: Blob[]; duration: VideoDuration; aspectRatio: AspectRatio };

// Refus du filtre de contenu du modèle (célébrité, nudité…) : le client doit
// changer de photo ou de prompt, réessayer ne servirait à rien.
export class ContentRefusedError extends Error {}

// URL écrite automatiquement par scripts/prepare-video.mjs (dev et build).
type ReferenceVideo = { url?: string };

// Pour suivre une tâche, fal n'utilise que "propriétaire/app"
// (ex. "kling/v4"), pas le chemin complet du modèle.
function requestUrl(model: ModelId, requestId: string): string {
  const appId = MODELS[model].falModel.split("/").slice(0, 2).join("/");
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

// URL appelée par fal à la fin de la génération. Le jeton contient l'email chiffré.
// En local sans PUBLIC_BASE_URL, pas d'email : la page suit la génération seule.
// En production, l'email est promis au client : la configuration est obligatoire.
function webhookUrl(email: string, model: ModelId): string | null {
  if (!process.env.PUBLIC_BASE_URL && process.env.NODE_ENV !== "production") {
    console.warn("PUBLIC_BASE_URL vide : le résultat ne sera pas envoyé par email.");
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

function referenceVideoUrl(): string {
  // REFERENCE_VIDEO_URL reste possible pour forcer une autre vidéo.
  const url = process.env.REFERENCE_VIDEO_URL || (referenceVideo as ReferenceVideo).url;
  if (!url) {
    throw new Error("Vidéo de référence non préparée : mets public/exemple.mp4 et FAL_KEY, puis relance.");
  }
  return url;
}

function statueVideoUrl(): string {
  const url = (statueVideo as ReferenceVideo).url;
  if (!url) throw new Error("Vidéo de la statue non préparée : lance scripts/prepare-video.mjs avec FAL_KEY.");
  return url;
}

// Modèle fal appelé et ses paramètres, une fois les images déposées chez fal.
function falCall(req: GenerationRequest, imageUrls: string[]): { endpoint: string; input: object } {
  switch (req.model) {
    case "kling4": {
      const { falModel, prompt } = MODELS.kling4;
      // Un "élément" Kling : une vue de face (la photo en pied) + 1 à 3 photos
      // de référence (le gros plan du visage, ou la photo en pied à défaut).
      const [front, ...others] = imageUrls;
      return {
        endpoint: falModel,
        input: {
          prompt: [prompt, describeBody(req.measurements)].filter(Boolean).join(" "),
          video_url: referenceVideoUrl(),
          elements: [{ frontal_image_url: front, reference_image_urls: others.length > 0 ? others : [front] }],
          resolution: VIDEO_RESOLUTION,
        },
      };
    }
    case "statue": {
      const { falModel, prompt } = MODELS.statue;
      const [front, profile] = imageUrls;
      return {
        endpoint: falModel,
        input: {
          prompt,
          video_url: statueVideoUrl(),
          elements: [{ frontal_image_url: front, reference_image_urls: [profile] }],
          resolution: VIDEO_RESOLUTION,
        },
      };
    }
    case "image": {
      const { falModel, falEditModel } = MODELS.image;
      const common = { prompt: req.prompt, aspect_ratio: req.aspectRatio, resolution: "1K", num_images: 1 };
      return imageUrls.length > 0
        ? { endpoint: falEditModel, input: { ...common, image_urls: imageUrls } }
        : { endpoint: falModel, input: common };
    }
    case "prompt":
      return {
        endpoint: MODELS.prompt.falModel,
        input: { prompt: req.prompt, duration: req.duration, aspect_ratio: req.aspectRatio, resolution: VIDEO_RESOLUTION },
      };
    case "promptImages": {
      // Kling ne lit une image que si le prompt la cite (@Image1, @Image2…) :
      // on les cite toutes, le client n'a pas à connaître cette syntaxe.
      const refs = imageUrls.map((_, i) => `@Image${i + 1}`).join(", ");
      return {
        endpoint: MODELS.promptImages.falModel,
        input: {
          prompt: `Reference images: ${refs}. ${req.prompt}`,
          image_urls: imageUrls,
          duration: req.duration,
          aspect_ratio: req.aspectRatio,
          resolution: VIDEO_RESOLUTION,
        },
      };
    }
  }
}

// Lance la génération et renvoie l'identifiant de la tâche.
// Les images sont d'abord déposées sur le stockage fal : tous les modèles
// acceptent une URL, pas forcément une image intégrée à la requête.
// Si l'email est activé, le résultat est envoyé à "email" par le webhook,
// même si la page est fermée.
export async function startGeneration(
  req: GenerationRequest,
  email: string,
): Promise<{ requestId: string; emailNotification: boolean }> {
  // Avant tout envoi : une configuration manquante ne doit pas consommer de crédits.
  if (req.model === "kling4") referenceVideoUrl();
  if (req.model === "statue") statueVideoUrl();
  const notifyUrl = webhookUrl(email, req.model);
  fal.config({ credentials: falKey() });
  const photos = "photos" in req ? req.photos : [];
  const imageUrls = await Promise.all(photos.map((photo) => fal.storage.upload(photo)));
  const { endpoint, input } = falCall(req, imageUrls);

  // Via la file d'attente (plusieurs minutes pour une vidéo). Si l'email est
  // activé, fal appelle notifyUrl (paramètre fal_webhook) à la fin.
  const query = notifyUrl ? `?fal_webhook=${encodeURIComponent(notifyUrl)}` : "";
  const res = await fetch(`${QUEUE_URL}/${endpoint}${query}`, {
    method: "POST",
    headers: falHeaders(),
    body: JSON.stringify(input),
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

// Résultat d'une tâche terminée : la vidéo, ou la première image.
async function readResult(res: Response): Promise<Extract<GenerationStatus, { status: "done" | "failed" }>> {
  if (!res.ok) {
    return { status: "failed", error: `Génération échouée (${res.status}) : ${await res.text()}` };
  }
  const output = (await res.json()) as { video?: { url: string }; images?: { url: string }[] };
  const url = output.video?.url ?? output.images?.[0]?.url;
  if (!url) return { status: "failed", error: "Aucun résultat renvoyé par fal.ai" };
  return { status: "done", url };
}

export async function getGenerationStatus(model: ModelId, requestId: string): Promise<GenerationStatus> {
  const base = requestUrl(model, requestId);

  const res = await fetch(`${base}/status`, { headers: falHeaders(), cache: "no-store" });
  if (!res.ok) return { status: "failed", error: `Statut indisponible (${res.status})` };
  const state = (await res.json()) as { status: string; queue_position?: number };

  if (state.status === "IN_QUEUE") {
    return { status: "queued", position: state.queue_position ?? null };
  }
  if (state.status === "IN_PROGRESS") return { status: "running" };

  // COMPLETED : la tâche est finie, avec succès ou en erreur.
  return readResult(await fetch(base, { headers: falHeaders(), cache: "no-store" }));
}

// Résultat définitif d'une tâche, pour le webhook. On le relit chez fal avec
// FAL_KEY plutôt que de croire le contenu du webhook : seule une tâche de
// notre compte peut aboutir à un email.
// Renvoie null si la tâche est inconnue de notre compte, et lève une erreur
// si fal ne répond pas (le webhook répond alors 500 et fal le renverra).
export async function getFinishedGeneration(
  model: ModelId,
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
  return readResult(result);
}
