import type Stripe from "stripe";
import { PLANS } from "@/config/product";
import { stripe, syncSubscription } from "@/lib/stripe";
import { resetTokens, upgradeTokens } from "@/lib/tokens";

// Appelée par Stripe à chaque évènement d'abonnement. C'est elle qui remplit
// les tokens : rien n'est à faire à la main chaque mois.
// - facture payée à la souscription ou au renouvellement : solde remis au quota ;
// - facture de montée de plan : différence de quota au prorata du mois restant ;
// - abonnement terminé : solde remis à 0.
// Réponse 2xx = évènement traité ; sinon Stripe le renvoie (pendant 3 jours).
// Toutes les opérations sont idempotentes : un évènement rejoué n'a aucun effet.
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET manquant dans .env.local");
  // Corps brut : la signature porte sur le texte exact envoyé par Stripe.
  const body = await request.text();
  let event: Stripe.Event;
  try {
    event = await stripe().webhooks.constructEventAsync(body, request.headers.get("stripe-signature") ?? "", secret);
  } catch {
    return Response.json({ error: "Signature invalide." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "invoice.paid":
        await onInvoicePaid(event.data.object);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await syncSubscription(event.data.object.id);
        break;
      case "customer.subscription.deleted": {
        const synced = await syncSubscription(event.data.object.id);
        if (synced) await resetTokens(synced.userId, 0, "expired", event.id);
        break;
      }
    }
    return Response.json({ received: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Traitement impossible, réessayer." }, { status: 500 });
  }
}

async function onInvoicePaid(invoice: Stripe.Invoice) {
  const subscription = invoice.parent?.subscription_details?.subscription;
  if (!subscription || !invoice.id) return;
  const synced = await syncSubscription(typeof subscription === "string" ? subscription : subscription.id);
  if (!synced?.plan) {
    console.error(`Facture ${invoice.id} : plan inconnu ou abonnement ignoré`);
    return;
  }
  const quota = PLANS[synced.plan].monthlyTokens;

  if (invoice.billing_reason === "subscription_create" || invoice.billing_reason === "subscription_cycle") {
    await resetTokens(synced.userId, quota, "monthly_reset", invoice.id);
  } else if (invoice.billing_reason === "subscription_update") {
    const now = Date.now() / 1000;
    const remaining = (synced.periodEnd - now) / (synced.periodEnd - synced.periodStart || 1);
    await upgradeTokens(synced.userId, quota, remaining, invoice.id);
  }
}
