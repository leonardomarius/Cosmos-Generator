import { claimNextJob, isBridgeRequest } from "@/lib/wangp";

// Appelée par le planificateur WanGP du PC quand il est libre :
// renvoie la plus ancienne tâche en attente (et la marque en cours), ou null.
export async function POST(request: Request) {
  if (!isBridgeRequest(request)) return Response.json({ error: "Non autorisé." }, { status: 401 });
  try {
    return Response.json({ job: await claimNextJob() });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "File indisponible." }, { status: 500 });
  }
}
