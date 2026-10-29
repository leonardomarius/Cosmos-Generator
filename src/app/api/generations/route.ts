import { UPLOAD_RULES } from "@/config/product";
import { startGeneration } from "@/lib/fal";

// Lance une génération à partir de la photo envoyée.
// Tant que le paiement Stripe n'est pas branché, cette route n'est ouverte
// qu'en développement : en production, n'importe qui pourrait consommer
// des crédits fal.ai gratuitement. Ensuite, c'est le webhook Stripe
// qui appellera startGeneration() une fois le paiement confirmé.
export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return Response.json({ error: "Génération indisponible sans paiement." }, { status: 403 });
  }

  const form = await request.formData().catch(() => null);
  const photo = form?.get("photo");
  if (form?.get("consent") !== "true") {
    return Response.json({ error: "Le consentement est obligatoire." }, { status: 400 });
  }
  // Mêmes règles que dans le navigateur : on ne lui fait jamais confiance.
  if (!(photo instanceof File)) {
    return Response.json({ error: "Photo manquante." }, { status: 400 });
  }
  if (!(UPLOAD_RULES.acceptedTypes as readonly string[]).includes(photo.type)) {
    return Response.json({ error: "Format de photo refusé." }, { status: 400 });
  }
  if (photo.size > UPLOAD_RULES.maxSizeBytes) {
    return Response.json({ error: "Photo trop lourde." }, { status: 400 });
  }

  const base64 = Buffer.from(await photo.arrayBuffer()).toString("base64");
  try {
    const requestId = await startGeneration(`data:${photo.type};base64,${base64}`);
    return Response.json({ requestId });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Impossible de lancer la génération." }, { status: 502 });
  }
}
