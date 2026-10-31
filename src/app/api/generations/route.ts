import { UPLOAD_RULES, VIDEO_MODELS, isVideoModelId } from "@/config/product";
import { ContentRefusedError, startGeneration } from "@/lib/fal";
import { currentUser } from "@/lib/supabase";
import { InsufficientTokensError, markGenerationQueued, reserveGeneration, settleGeneration } from "@/lib/tokens";

// Lance une génération à partir d'une ou deux photos du proche, sur le
// compte fal.ai de FAL_KEY. Réservé aux comptes connectés : le prix du modèle
// en tokens est retiré avant l'appel à fal, et rendu si la génération échoue.
// La vidéo est envoyée à l'email du compte.
export async function POST(request: Request) {
  const user = await currentUser();
  if (!user?.email) {
    return Response.json({ error: "Connecte-toi pour créer une vidéo." }, { status: 401 });
  }
  const form = await request.formData().catch(() => null);
  if (form?.get("consent") !== "true") {
    return Response.json({ error: "Le consentement est obligatoire." }, { status: 400 });
  }
  // Mêmes règles que dans le navigateur : on ne lui fait jamais confiance.
  const model = form.get("model");
  if (!isVideoModelId(model)) {
    return Response.json({ error: "Modèle inconnu." }, { status: 400 });
  }
  const photos = form.getAll("photos");
  if (photos.length === 0) {
    return Response.json({ error: "Photo manquante." }, { status: 400 });
  }
  if (photos.length > UPLOAD_RULES.maxPhotos) {
    return Response.json({ error: `${UPLOAD_RULES.maxPhotos} photos maximum.` }, { status: 400 });
  }
  const files: File[] = [];
  for (const photo of photos) {
    if (!(photo instanceof File)) {
      return Response.json({ error: "Photo invalide." }, { status: 400 });
    }
    if (!(UPLOAD_RULES.acceptedTypes as readonly string[]).includes(photo.type)) {
      return Response.json({ error: "Format de photo refusé." }, { status: 400 });
    }
    if (photo.size > UPLOAD_RULES.maxSizeBytes) {
      return Response.json({ error: "Photo trop lourde." }, { status: 400 });
    }
    files.push(photo);
  }

  let generationId: string;
  try {
    generationId = await reserveGeneration(user.id, model, VIDEO_MODELS[model].tokens);
  } catch (err) {
    if (err instanceof InsufficientTokensError) {
      return Response.json({ error: "Plus assez de tokens ce mois-ci." }, { status: 402 });
    }
    console.error(err);
    return Response.json({ error: "Impossible de lancer la génération." }, { status: 502 });
  }

  try {
    const started = await startGeneration(files, user.email, model);
    await markGenerationQueued(generationId, started.requestId).catch((err) => {
      // La vidéo est lancée : la requête réussit quand même, mais sans ce lien
      // un échec ultérieur ne pourra pas rendre les tokens.
      console.error(`Génération ${generationId} lancée mais non enregistrée`, err);
    });
    return Response.json(started);
  } catch (err) {
    console.error(err);
    await settleGeneration({ id: generationId }, "failed").catch(console.error);
    if (err instanceof ContentRefusedError) {
      return Response.json(
        { error: "Photo refusée par le filtre du modèle (visage de célébrité, nudité…). Essaie une autre photo." },
        { status: 422 },
      );
    }
    return Response.json({ error: "Impossible de lancer la génération." }, { status: 502 });
  }
}
