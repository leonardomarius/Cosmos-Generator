import {
  PROMPT_RULES,
  UPLOAD_RULES,
  accountSuspendedMessage,
  isAspectRatio,
  isModelId,
  isVideoDuration,
  tokensFor,
} from "@/config/product";
import { RATE_LIMITS } from "@/config/promo";
import { readBodyMeasurements } from "@/lib/body-measurements";
import { checkPrompt } from "@/lib/content-filter";
import type { GenerationRequest } from "@/lib/generation";
import { allowRequest, ipFingerprint } from "@/lib/request-guard";
import { currentUser } from "@/lib/supabase";
import {
  AccountBlockedError,
  InsufficientTokensError,
  hasPaid,
  markGenerationQueued,
  reserveGeneration,
  settleGeneration,
} from "@/lib/tokens";
import { emailsEnabled, handledByWangp, startWangpGeneration } from "@/lib/wangp";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Invalid = { error: string };

// Images envoyées : mêmes règles que dans le navigateur, on ne lui fait jamais confiance.
function readPhotos(form: FormData, max: number): File[] | Invalid {
  const photos = form.getAll("photos");
  if (photos.length > max) return { error: `${max} images maximum.` };
  const files: File[] = [];
  for (const photo of photos) {
    if (!(photo instanceof File)) return { error: "Image invalide." };
    if (!(UPLOAD_RULES.acceptedTypes as readonly string[]).includes(photo.type)) {
      return { error: "Format d'image refusé." };
    }
    if (photo.size > UPLOAD_RULES.maxSizeBytes) return { error: "Image trop lourde." };
    files.push(photo);
  }
  return files;
}

// Demande du client, vérifiée selon le service choisi.
function readRequest(form: FormData): GenerationRequest | Invalid {
  const model = form.get("model");
  if (!isModelId(model)) return { error: "Service inconnu." };

  if (model === "kling4") {
    const photos = readPhotos(form, UPLOAD_RULES.maxPhotos);
    if ("error" in photos) return photos;
    if (photos.length === 0) return { error: "Photo manquante." };
    const measurements = readBodyMeasurements((id) => form.get(id));
    if ("error" in measurements) return measurements;
    return { model, photos, measurements };
  }

  if (model === "statue") {
    const photos = readPhotos(form, 2);
    if ("error" in photos) return photos;
    if (photos.length !== 2) return { error: "Il faut deux photos du visage : de face et de profil." };
    return { model, photos };
  }

  const prompt = String(form.get("prompt") ?? "").trim();
  if (!prompt) return { error: "Décris ce que tu veux générer." };
  if (prompt.length > PROMPT_RULES.maxLength) {
    return { error: `Description trop longue : ${PROMPT_RULES.maxLength} caractères maximum.` };
  }
  const aspectRatio = form.get("aspectRatio");
  if (!isAspectRatio(aspectRatio)) return { error: "Format inconnu." };
  const photos = readPhotos(form, PROMPT_RULES.maxImages);
  if ("error" in photos) return photos;

  if (model === "image") return { model, prompt, photos, aspectRatio };

  const duration = Number(form.get("duration"));
  if (!isVideoDuration(duration)) return { error: "Durée inconnue." };
  if (model === "prompt") {
    if (photos.length > 0) return { error: "Images inattendues." };
    return { model, prompt, duration, aspectRatio };
  }
  if (photos.length === 0) return { error: "Image manquante." };
  return { model, prompt, photos, duration, aspectRatio };
}

// Lance une génération (image, vidéo par prompt, star ou statue) dans la file
// du PC (WanGP). Réservé aux comptes connectés : le prix en tokens est retiré
// avant la mise en file, et rendu si la génération échoue.
// Les comptes qui n'ont jamais payé (tokens de bienvenue seulement) passent
// après les clients dans la file du PC.
// idempotencyKey : une même demande reçue deux fois ne crée qu'une génération.
// Le résultat est envoyé à l'email du compte.
export async function POST(request: Request) {
  // Sans pont vers le PC, aucune génération n'est possible (et aucun token retiré).
  if (!handledByWangp()) {
    console.error("WANGP_BRIDGE_SECRET manquant : génération refusée.");
    return Response.json({ error: "Les générations sont momentanément indisponibles." }, { status: 503 });
  }
  const ipHash = ipFingerprint(request);
  if (ipHash && !(await allowRequest(`generations:${ipHash}`, RATE_LIMITS.generations))) {
    return Response.json({ error: "Trop de demandes : réessaie dans quelques minutes." }, { status: 429 });
  }
  const user = await currentUser();
  if (!user?.email) {
    return Response.json({ error: "Connecte-toi pour générer." }, { status: 401 });
  }
  const form = await request.formData().catch(() => null);
  if (!form) return Response.json({ error: "Requête invalide." }, { status: 400 });
  const req = readRequest(form);
  if ("error" in req) return Response.json(req, { status: 400 });
  // Une personne réelle peut figurer sur les images envoyées.
  if ("photos" in req && req.photos.length > 0 && form.get("consent") !== "true") {
    return Response.json({ error: "Le consentement est obligatoire." }, { status: 400 });
  }
  if ("prompt" in req) {
    const refused = checkPrompt(req.prompt, "photos" in req && req.photos.length > 0);
    if (refused) return Response.json({ error: refused }, { status: 400 });
  }

  const key = String(form.get("idempotencyKey") ?? "");
  const idempotencyKey = UUID.test(key) ? key : null;
  const seconds = "duration" in req ? req.duration : undefined;
  let generationId: string;
  try {
    const reserved = await reserveGeneration(user.id, req.model, tokensFor(req.model, seconds), idempotencyKey);
    // Demande déjà reçue : la génération existe, on renvoie la même.
    if (reserved.replayed) {
      return Response.json({ requestId: reserved.id, emailNotification: emailsEnabled() });
    }
    generationId = reserved.id;
  } catch (err) {
    if (err instanceof AccountBlockedError) {
      return Response.json({ error: accountSuspendedMessage() }, { status: 403 });
    }
    if (err instanceof InsufficientTokensError) {
      return Response.json({ error: "Plus assez de tokens." }, { status: 402 });
    }
    console.error(err);
    return Response.json({ error: "Impossible de lancer la génération." }, { status: 502 });
  }

  try {
    const started = await startWangpGeneration(req, user.email, generationId, { free: !(await hasPaid(user.id)) });
    await markGenerationQueued(generationId, started.requestId).catch((err) => {
      // La génération est lancée : la requête réussit quand même, mais sans ce
      // lien un échec ultérieur ne pourra pas rendre les tokens.
      console.error(`Génération ${generationId} lancée mais non enregistrée`, err);
    });
    return Response.json(started);
  } catch (err) {
    console.error(err);
    await settleGeneration({ id: generationId }, "failed").catch(console.error);
    return Response.json({ error: "Impossible de lancer la génération." }, { status: 502 });
  }
}
