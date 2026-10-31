import { isPlanId } from "@/config/product";
import { siteUrl } from "@/lib/site-url";
import { customerIdFor, priceIdFor, stripe } from "@/lib/stripe";
import { currentUser } from "@/lib/supabase";
import { getAccount, hasActiveSubscription } from "@/lib/tokens";

// Ouvre la page de paiement Stripe pour s'abonner à un plan.
// Déjà abonné : on renvoie vers le portail Stripe pour changer de plan.
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
    const customer = await customerIdFor(user);
    if (hasActiveSubscription(await getAccount(user.id))) {
      const portal = await stripe().billingPortal.sessions.create({ customer, return_url: `${base}/compte` });
      return Response.json({ url: portal.url });
    }
    const session = await stripe().checkout.sessions.create({
      mode: "subscription",
      customer,
      line_items: [{ price: priceIdFor(body.plan), quantity: 1 }],
      subscription_data: { metadata: { user_id: user.id } },
      metadata: { user_id: user.id, waiver_accepted_at: new Date().toISOString() },
      allow_promotion_codes: true,
      locale: "fr",
      success_url: `${base}/compte?abonnement=ok`,
      cancel_url: `${base}/abonnement`,
    });
    return Response.json({ url: session.url });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Paiement indisponible pour le moment." }, { status: 502 });
  }
}
