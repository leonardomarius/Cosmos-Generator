import { isPlanId } from "@/config/product";
import { changePlan, createFirstPayment } from "@/lib/mollie";
import { siteUrl } from "@/lib/site-url";
import { currentUser } from "@/lib/supabase";
import { getAccount, hasActiveSubscription } from "@/lib/tokens";

// Ouvre la page de paiement Mollie pour s'abonner à un plan.
// Déjà abonné : change de plan sans repasser par la page de paiement.
export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Connecte-toi d'abord." }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { plan?: unknown; waiver?: unknown } | null;
  if (!isPlanId(body?.plan)) return Response.json({ error: "Plan inconnu." }, { status: 400 });
  // Contenu numérique fourni tout de suite : le client doit demander
  // l'exécution immédiate et renoncer au droit de rétractation (art. L221-28 du Code de la consommation).
  if (body.waiver !== true) {
    return Response.json({ error: "Coche la case d'accès immédiat pour continuer." }, { status: 400 });
  }

  try {
    const base = siteUrl(request);
    if (hasActiveSubscription(await getAccount(user.id))) {
      await changePlan(user.id, body.plan);
      return Response.json({ url: `${base}/compte?abonnement=changement` });
    }
    const url = await createFirstPayment(user, body.plan, `${base}/compte?abonnement=ok`);
    return Response.json({ url });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Paiement indisponible pour le moment." }, { status: 502 });
  }
}
