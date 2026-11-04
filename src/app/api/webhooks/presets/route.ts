import { after } from "next/server";
import { isValidFalWebhook } from "@/lib/fal-webhook";
import { advancePresetJob } from "@/lib/presets/jobs";

// Assemblage de la vidéo finale après la réponse.
export const maxDuration = 60;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Appelée par fal.ai à la fin de chaque étape d'une commande de preset. Le contenu
// du webhook n'est pas lu : il réveille seulement la commande, qui relit le
// résultat chez fal avec FAL_KEY. fal attend une réponse sous 15 s : le travail
// se fait après la réponse.
export async function POST(request: Request) {
  // Corps brut : la signature porte sur les octets exacts.
  const rawBody = Buffer.from(await request.arrayBuffer());
  if (!(await isValidFalWebhook(request.headers, rawBody))) {
    return Response.json({ error: "Signature invalide." }, { status: 401 });
  }
  const jobId = new URL(request.url).searchParams.get("job");
  if (!jobId || !UUID.test(jobId)) {
    console.error("Webhook de preset ignoré : commande invalide");
    return Response.json({ ignored: true });
  }
  after(() => advancePresetJob(jobId));
  return Response.json({ received: true });
}
