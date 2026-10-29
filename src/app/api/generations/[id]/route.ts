import { getGenerationStatus } from "@/lib/fal";

// Les identifiants fal sont des UUID : on refuse tout le reste
// pour ne jamais glisser n'importe quoi dans l'URL envoyée à fal.ai.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(_request: Request, ctx: RouteContext<"/api/generations/[id]">) {
  const { id } = await ctx.params;
  if (!UUID.test(id)) {
    return Response.json({ error: "Identifiant invalide." }, { status: 400 });
  }
  try {
    return Response.json(await getGenerationStatus(id));
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Statut indisponible." }, { status: 502 });
  }
}
