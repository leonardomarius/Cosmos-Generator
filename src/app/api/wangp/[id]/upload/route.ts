import { createResultUploadUrl, isBridgeRequest, isResultExtension } from "@/lib/wangp";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Lien signé pour que le PC dépose le résultat directement dans Supabase Storage.
// Corps : { extension: "mp4" | "png" | "jpg" | "webp" } (mp4 par défaut).
export async function POST(request: Request, ctx: RouteContext<"/api/wangp/[id]/upload">) {
  if (!isBridgeRequest(request)) return Response.json({ error: "Non autorisé." }, { status: 401 });
  const { id } = await ctx.params;
  if (!UUID.test(id)) return Response.json({ error: "Identifiant invalide." }, { status: 400 });
  const body = (await request.json().catch(() => ({}))) as { extension?: unknown };
  const extension = body.extension ?? "mp4";
  if (!isResultExtension(extension)) return Response.json({ error: "Type de fichier refusé." }, { status: 400 });
  try {
    const url = await createResultUploadUrl(id, extension);
    if (!url) return Response.json({ error: "Tâche introuvable ou terminée." }, { status: 409 });
    return Response.json({ url });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Lien indisponible." }, { status: 500 });
  }
}
