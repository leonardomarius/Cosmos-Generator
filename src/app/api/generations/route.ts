import {
  PROMPT_RULES,
  UPLOAD_RULES,
  accountSuspendedMessage,
  isAspectRatio,
  isModelId,
  isVideoDuration,
  tokensFor,
} from "@/config/product";
import { readBodyMeasurements } from "@/lib/body-measurements";
import { ContentRefusedError, startGeneration, type GenerationRequest } from "@/lib/fal";
import { currentUser } from "@/lib/supabase";
import { AccountBlockedError, InsufficientTokensError, markGenerationQueued, reserveGeneration, settleGeneration } from "@/lib/tokens";
import { handledByWangp, startWangpGeneration } from "@/lib/wangp";

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

// Lance une génération (image, vidéo par prompt ou vidéo de référence) sur
// le compte fal.ai de FAL_KEY. Réservé aux comptes connectés : le prix en
// tokens est retiré avant l'appel à fal, et rendu si la génération échoue.
// Le résultat est envoyé à l'email du compte.
export async function POST(request: Request) {
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

  const tokens = tokensFor(req.model, "duration" in req ? req.duration : undefined);
  let generationId: string;
  try {
    generationId = await reserveGeneration(user.id, req.model, tokens);
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
    // Toutes les générations passent par le PC (WanGP) quand le pont est configuré.
    const started = handledByWangp()
      ? await startWangpGeneration(req, user.email, generationId)
      : await startGeneration(req, user.email);
    await markGenerationQueued(generationId, started.requestId).catch((err) => {
      // La génération est lancée : la requête réussit quand même, mais sans ce
      // lien un échec ultérieur ne pourra pas rendre les tokens.
      console.error(`Génération ${generationId} lancée mais non enregistrée`, err);
    });
    return Response.json(started);
  } catch (err) {
    console.error(err);
    await settleGeneration({ id: generationId }, "failed").catch(console.error);
    if (err instanceof ContentRefusedError) {
      return Response.json(
        { error: "Refusé par le filtre du modèle (visage de célébrité, nudité…). Essaie une autre image ou une autre description." },
        { status: 422 },
      );
    }
    return Response.json({ error: "Impossible de lancer la génération." }, { status: 502 });
  }
}
