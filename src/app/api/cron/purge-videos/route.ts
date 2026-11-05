import { EFFECTS } from "@/config/effects";
import { purgeOldVideos } from "@/lib/video-storage";

// Appelée chaque jour par Vercel Cron (vercel.json) : supprime les vidéos des
// effets après PRODUCT.retentionDays jours, comme promis aux clients.
// Vercel envoie "Authorization: Bearer <CRON_SECRET>" : personne d'autre ne
// peut déclencher la suppression.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Non autorisé." }, { status: 401 });
  }
  try {
    const removed = await purgeOldVideos(EFFECTS.map((item) => item.slug));
    return Response.json({ removed });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Suppression impossible." }, { status: 500 });
  }
}
