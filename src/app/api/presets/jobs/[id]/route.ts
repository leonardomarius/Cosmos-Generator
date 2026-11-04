import { after } from "next/server";
import type { GenerationStatus } from "@/lib/fal";
import { advancePresetJob, loadPresetJob } from "@/lib/presets/jobs";
import { currentUser } from "@/lib/supabase";

// L'assemblage peut se faire ici si le webhook s'est perdu.
export const maxDuration = 60;

// En dessous, le webhook a probablement déjà fait le travail.
const STALE_MS = 15 * 1000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Suivi d'une commande par le navigateur, au format de GenerationProgress. Sert
// aussi de filet : une commande qui n'a pas bougé depuis un moment est relancée
// (sans nouvel appel payant, voir src/lib/presets/machine.ts).
export async function GET(_request: Request, ctx: RouteContext<"/api/presets/jobs/[id]">) {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Connecte-toi." }, { status: 401 });
  const { id } = await ctx.params;
  if (!UUID.test(id)) return Response.json({ error: "Identifiant invalide." }, { status: 400 });

  try {
    const job = await loadPresetJob(id);
    if (!job || job.user_id !== user.id) return Response.json({ error: "Commande introuvable." }, { status: 404 });

    if (job.status === "running" && Date.now() - Date.parse(job.updated_at) > STALE_MS) {
      after(() => advancePresetJob(id));
    }
    let status: GenerationStatus;
    if (job.status === "done" && job.result_url) status = { status: "done", url: job.result_url };
    else if (job.status === "failed") {
      status = {
        status: "failed",
        error:
          job.error_kind === "refused"
            ? "Refusé par le filtre du modèle (visage de célébrité, nudité…). Essaie une autre photo : tes tokens t'ont été rendus."
            : "Une erreur de notre côté. Tes tokens t'ont été rendus : tu peux réessayer.",
      };
    } else status = { status: "running" };
    return Response.json(status);
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Statut indisponible." }, { status: 502 });
  }
}
