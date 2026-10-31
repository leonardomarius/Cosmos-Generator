import { isVideoModelId } from "@/config/product";
import { FAL_REQUEST_ID, getGenerationStatus } from "@/lib/fal";

export async function GET(request: Request, ctx: RouteContext<"/api/generations/[id]">) {
  const { id } = await ctx.params;
  const model = new URL(request.url).searchParams.get("model");
  if (!FAL_REQUEST_ID.test(id) || !isVideoModelId(model)) {
    return Response.json({ error: "Identifiant invalide." }, { status: 400 });
  }
  try {
    return Response.json(await getGenerationStatus(model, id));
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Statut indisponible." }, { status: 502 });
  }
}
