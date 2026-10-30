import { UPLOAD_RULES } from "@/config/product";
import { startGeneration } from "@/lib/fal";

// Lance une génération à partir d'une ou deux photos du proche, sur le
// compte fal.ai de FAL_KEY. Phase de test, sans paiement : le site n'est
// pas public. Avant de l'ouvrir, protéger cette route (paiement ou accès),
// sinon n'importe qui pourrait consommer les crédits fal.ai.
export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  if (form?.get("consent") !== "true") {
    return Response.json({ error: "Le consentement est obligatoire." }, { status: 400 });
  }
  // Mêmes règles que dans le navigateur : on ne lui fait jamais confiance.
  const photos = form.getAll("photos");
  if (photos.length === 0) {
    return Response.json({ error: "Photo manquante." }, { status: 400 });
  }
  if (photos.length > UPLOAD_RULES.maxPhotos) {
    return Response.json({ error: `${UPLOAD_RULES.maxPhotos} photos maximum.` }, { status: 400 });
  }
  const dataUris: string[] = [];
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
    const base64 = Buffer.from(await photo.arrayBuffer()).toString("base64");
    dataUris.push(`data:${photo.type};base64,${base64}`);
  }

  try {
    return Response.json(await startGeneration(dataUris));
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Impossible de lancer la génération." }, { status: 502 });
  }
}
