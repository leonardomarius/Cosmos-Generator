import { completeJob, isBridgeRequest, isResultExtension } from "@/lib/wangp";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Le PC signale la fin du rendu : { status: "done" } une fois la vidéo déposée,
// ou { status: "failed", error }. Rend les tokens en cas d'échec et prévient le client.
export async function POST(request: Request, ctx: RouteContext<"/api/wangp/[id]/complete">) {
  if (!isBridgeRequest(request)) return Response.json({ error: "Non autorisé." }, { status: 401 });
  const { id } = await ctx.params;
  if (!UUID.test(id)) return Response.json({ error: "Identifiant invalide." }, { status: 400 });
  const body = (await request.json().catch(() => null)) as { status?: unknown; error?: unknown; extension?: unknown } | null;
  if (body?.status !== "done" && body?.status !== "failed") {
    return Response.json({ error: "Statut invalide." }, { status: 400 });
  }
  const extension = body.extension ?? "mp4";
  if (!isResultExtension(extension)) return Response.json({ error: "Type de fichier refusé." }, { status: 400 });
  try {
    const ok = await completeJob(id, body.status, String(body.error ?? ""), extension);
    if (!ok) return Response.json({ error: "Tâche ou vidéo introuvable." }, { status: 409 });
    return Response.json({ ok: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Traitement impossible, réessayer." }, { status: 500 });
  }
}
