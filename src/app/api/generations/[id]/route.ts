import { GENERATION_ID } from "@/lib/generation";
import { getWangpStatus } from "@/lib/wangp";

export async function GET(_request: Request, ctx: RouteContext<"/api/generations/[id]">) {
  const { id } = await ctx.params;
  if (!GENERATION_ID.test(id)) {
    return Response.json({ error: "Identifiant invalide." }, { status: 400 });
  }
  try {
    // Toutes les tâches sont rendues sur le PC (WanGP) et suivies dans Supabase.
    const status = await getWangpStatus(id);
    if (!status) return Response.json({ error: "Génération inconnue." }, { status: 404 });
    return Response.json(status);
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Statut indisponible." }, { status: 502 });
  }
}
