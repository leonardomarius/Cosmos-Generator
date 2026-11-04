import { runPresetMaintenance } from "@/lib/presets/jobs";

export const maxDuration = 60;

// Appelée chaque jour par Vercel Cron (vercel.json) : reprend les commandes de
// presets restées ouvertes, rembourse celles qui ont trop attendu, et ferme un
// preset dont le taux d'échec dépasse la limite.
// Vercel envoie "Authorization: Bearer <CRON_SECRET>" : personne d'autre ne
// peut déclencher cette tâche.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Non autorisé." }, { status: 401 });
  }
  try {
    return Response.json(await runPresetMaintenance(45 * 1000));
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Maintenance impossible." }, { status: 500 });
  }
}
