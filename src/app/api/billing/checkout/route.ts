import { accountSuspendedMessage, isBillingInterval, isPlanId } from "@/config/product";
import { changePlan, createFirstPayment } from "@/lib/mollie";
import { siteUrl } from "@/lib/site-url";
import { currentUser } from "@/lib/supabase";
import { getAccount, hasActiveSubscription } from "@/lib/tokens";

const CHANGE_PARAM = { upgraded: "changement", scheduled: "programme", resumed: "reprise" } as const;

// Ouvre la page de paiement Mollie pour s'abonner à un plan, au mois ou à l'année.
// Déjà abonné : change de plan sans repasser par la page de paiement.
export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Connecte-toi d'abord." }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { plan?: unknown; interval?: unknown; waiver?: unknown } | null;
  if (!isPlanId(body?.plan)) return Response.json({ error: "Plan inconnu." }, { status: 400 });
  const interval = body.interval ?? "month";
  if (!isBillingInterval(interval)) return Response.json({ error: "Durée d'abonnement inconnue." }, { status: 400 });

  try {
    const base = siteUrl(request);
    const account = await getAccount(user.id);
    if (account.blocked) return Response.json({ error: accountSuspendedMessage() }, { status: 403 });
    // Contenu numérique fourni tout de suite : le client doit demander
    // l'exécution immédiate et renoncer au droit de rétractation (art. L221-28 du Code de la consommation).
    if (body.waiver !== true) {
      return Response.json({ error: "Coche la case d'accès immédiat pour continuer." }, { status: 400 });
    }
    if (hasActiveSubscription(account)) {
      const change = await changePlan(user.id, body.plan, interval);
      return Response.json({ url: `${base}/compte?abonnement=${CHANGE_PARAM[change]}` });
    }
    const url = await createFirstPayment(user, body.plan, interval, `${base}/compte?abonnement=ok`);
    return Response.json({ url });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Paiement indisponible pour le moment." }, { status: 502 });
  }
}
