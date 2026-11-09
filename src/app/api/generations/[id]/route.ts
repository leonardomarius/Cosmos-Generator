import { isModelId } from "@/config/product";
import { FAL_REQUEST_ID, getGenerationStatus } from "@/lib/fal";
import { getWangpStatus } from "@/lib/wangp";

export async function GET(request: Request, ctx: RouteContext<"/api/generations/[id]">) {
  const { id } = await ctx.params;
  const model = new URL(request.url).searchParams.get("model");
  if (!FAL_REQUEST_ID.test(id) || !isModelId(model)) {
    return Response.json({ error: "Identifiant invalide." }, { status: 400 });
  }
  try {
    // Tâche rendue sur le PC (WanGP) : suivie dans Supabase, pas chez fal.
    const local = await getWangpStatus(id);
    return Response.json(local ?? (await getGenerationStatus(model, id)));
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Statut indisponible." }, { status: 502 });
  }
}
