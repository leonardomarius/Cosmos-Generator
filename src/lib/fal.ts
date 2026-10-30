// Appels à l'API fal.ai (REST), uniquement côté serveur :
// la clé FAL_KEY ne doit jamais arriver dans le navigateur.
import { GENERATION } from "@/config/product";
import referenceVideo from "@/config/reference-video.json";

const RUN_URL = "https://fal.run";
const QUEUE_URL = "https://queue.fal.run";
// Pour suivre une tâche, fal n'utilise que "propriétaire/app" (ex. "fal-ai/wan"),
// pas le chemin complet du modèle.
const APP_ID = GENERATION.falModel.split("/").slice(0, 2).join("/");

export type GenerationStatus =
  | { status: "queued"; position: number | null }
  | { status: "running" }
  | { status: "done"; videoUrl: string }
  | { status: "failed"; error: string };

// URL écrites automatiquement par scripts/prepare-video.mjs (dev et build).
type ReferenceVideo = { url?: string; sceneUrl?: string };

function falHeaders() {
  const key = process.env.FAL_KEY;
  if (!key) throw new Error("FAL_KEY manquant dans .env.local");
  return { Authorization: `Key ${key}`, "Content-Type": "application/json" };
}

// Étape 1 : crée une photo du proche dans la pose et la tenue de la scène.
// Appel direct (pas de file d'attente) : Nano Banana répond en quelques secondes.
async function createCharacter(photoDataUris: string[], sceneUrl: string): Promise<string> {
  const res = await fetch(`${RUN_URL}/${GENERATION.characterModel}`, {
    method: "POST",
    headers: falHeaders(),
    body: JSON.stringify({
      prompt: GENERATION.characterPrompt,
      image_urls: [sceneUrl, ...photoDataUris],
      aspect_ratio: GENERATION.characterAspectRatio,
      output_format: "png",
      num_images: 1,
    }),
  });
  if (!res.ok) {
    throw new Error(`fal.ai a refusé la création du personnage (${res.status}) : ${await res.text()}`);
  }
  const output = (await res.json()) as { images?: { url: string }[] };
  const url = output.images?.[0]?.url;
  if (!url) throw new Error("Aucune image de personnage renvoyée par fal.ai");
  return url;
}

// Lance toute la génération et renvoie l'identifiant de la tâche vidéo,
// avec l'image du personnage créée à l'étape 1.
// Les photos sont envoyées en data URI : pas besoin de les héberger ailleurs.
export async function startGeneration(
  photoDataUris: string[],
): Promise<{ requestId: string; characterUrl: string }> {
  const reference = referenceVideo as ReferenceVideo;
  // REFERENCE_VIDEO_URL reste possible pour forcer une autre vidéo.
  const videoUrl = process.env.REFERENCE_VIDEO_URL || reference.url;
  if (!videoUrl || !reference.sceneUrl) {
    throw new Error("Vidéo de référence non préparée : mets public/exemple.mp4 et FAL_KEY, puis relance.");
  }

  const characterUrl = await createCharacter(photoDataUris, reference.sceneUrl);

  // Étape 2 : la vidéo, via la file d'attente (plusieurs minutes).
  const res = await fetch(`${QUEUE_URL}/${GENERATION.falModel}`, {
    method: "POST",
    headers: falHeaders(),
    body: JSON.stringify({
      video_url: videoUrl,
      image_url: characterUrl,
      resolution: GENERATION.resolution,
      video_quality: GENERATION.videoQuality,
    }),
  });
  if (!res.ok) {
    throw new Error(`fal.ai a refusé la tâche (${res.status}) : ${await res.text()}`);
  }
  const { request_id } = (await res.json()) as { request_id: string };
  return { requestId: request_id, characterUrl };
}

export async function getGenerationStatus(requestId: string): Promise<GenerationStatus> {
  const base = `${QUEUE_URL}/${APP_ID}/requests/${requestId}`;

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
