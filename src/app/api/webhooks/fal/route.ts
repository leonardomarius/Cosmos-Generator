import { isModelId } from "@/config/product";
import { sendGenerationFailedEmail, sendResultReadyEmail } from "@/lib/email";
import { FAL_REQUEST_ID, getFinishedGeneration, publicBaseUrl } from "@/lib/fal";
import { isValidFalWebhook } from "@/lib/fal-webhook";
import { readNotificationToken } from "@/lib/notification-token";
import { settleGeneration } from "@/lib/tokens";

// Appelée par fal.ai quand une vidéo est finie (paramètre fal_webhook passé
// dans startGeneration). Envoie la vidéo, ou un email d'excuse, au client,
// et rend ses tokens si la génération a échoué.
// Trois vérifications avant tout envoi :
// 1. la signature Ed25519 de fal (sinon n'importe qui pourrait appeler la route) ;
// 2. le jeton chiffré de l'URL, qui donne l'email du client ;
// 3. le résultat relu chez fal avec FAL_KEY : seule une tâche de notre compte compte.
// Réponse 2xx = webhook traité ; toute autre réponse fait renvoyer le webhook par fal.
export async function POST(request: Request) {
  // Corps brut : la signature porte sur les octets exacts, avant tout JSON.parse.
  const rawBody = Buffer.from(await request.arrayBuffer());
  if (!(await isValidFalWebhook(request.headers, rawBody))) {
    return Response.json({ error: "Signature invalide." }, { status: 401 });
  }

  const params = new URL(request.url).searchParams;
  const email = readNotificationToken(params.get("token") ?? "");
  const model = params.get("model");
  let requestId: unknown;
  try {
    requestId = (JSON.parse(rawBody.toString("utf8")) as { request_id?: unknown }).request_id;
  } catch {
    requestId = null;
  }
  if (!email || !isModelId(model) || typeof requestId !== "string" || !FAL_REQUEST_ID.test(requestId)) {
    // Signé par fal mais inexploitable : inutile que fal le renvoie.
    console.error("Webhook fal ignoré : jeton, modèle ou request_id invalide");
    return Response.json({ ignored: true });
  }

  try {
    const result = await getFinishedGeneration(model, requestId);
    if (!result) {
      console.error(`Webhook fal ignoré : tâche ${requestId} inconnue de notre compte`);
      return Response.json({ ignored: true });
    }
    await settleGeneration({ falRequestId: requestId }, result.status);
    if (result.status === "done") {
      await sendResultReadyEmail(email, model, result.url, requestId);
    } else {
      console.error(`Génération ${requestId} échouée : ${result.error}`);
      // Les vidéos de référence se relancent depuis leur page, le reste depuis l'accueil.
      const retryPath = model === "kling4" ? "/chat?type=star" : model === "statue" ? "/statue" : "/";
      await sendGenerationFailedEmail(email, model, `${publicBaseUrl()}${retryPath}`, requestId);
    }
    return Response.json({ sent: true });
  } catch (err) {
    // fal renverra le webhook : la clé d'idempotence évite tout doublon d'email.
    console.error(err);
    return Response.json({ error: "Traitement impossible, réessayer." }, { status: 500 });
  }
}
