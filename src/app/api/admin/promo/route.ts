import { isAdminEmail } from "@/lib/admin";
import { updatePromoSettings } from "@/lib/promo";
import { currentUser } from "@/lib/supabase";

// Réglages de l'offre de bienvenue depuis /admin, effets immédiats :
// { enabled: boolean } coupe ou rouvre l'offre ;
// { dailyBudget: number | null } fixe le nombre de cadeaux par jour (null : FREE_DAILY_BUDGET).
export async function POST(request: Request) {
  const user = await currentUser();
  if (!isAdminEmail(user?.email)) return Response.json({ error: "Non autorisé." }, { status: 403 });
  const body = (await request.json().catch(() => null)) as { enabled?: unknown; dailyBudget?: unknown } | null;
  const patch: { enabled?: boolean; dailyBudget?: number | null } = {};
  if (typeof body?.enabled === "boolean") patch.enabled = body.enabled;
  if (body?.dailyBudget === null) patch.dailyBudget = null;
  else if (body?.dailyBudget !== undefined) {
    const budget = Number(body.dailyBudget);
    if (!Number.isInteger(budget) || budget < 0 || budget > 100000) {
      return Response.json({ error: "Plafond invalide." }, { status: 400 });
    }
    patch.dailyBudget = budget;
  }
  if (Object.keys(patch).length === 0) return Response.json({ error: "Rien à modifier." }, { status: 400 });
  try {
    await updatePromoSettings(patch);
    return Response.json({ ok: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Enregistrement impossible." }, { status: 500 });
  }
}
