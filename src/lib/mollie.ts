// Abonnements Mollie, uniquement côté serveur : MOLLIE_API_KEY ne doit
// jamais arriver dans le navigateur. Mollie n'a pas de portail client comme
// Stripe ; le parcours est :
// 1. premier paiement ("first") sur la page Mollie, qui crée un mandat ;
// 2. une fois payé, le webhook crée l'abonnement mensuel sur ce mandat ;
// 3. chaque paiement mensuel repasse par le webhook, qui recharge les tokens.
// Mollie reste la source de vérité ; la table "subscriptions" en est une copie.
import type { User } from "@supabase/supabase-js";
import { isPlanId, PLANS, type PlanId } from "@/config/product";
import { publicBaseUrl } from "@/lib/fal";
import { adminClient } from "@/lib/supabase";
import { resetTokens, upgradeTokens } from "@/lib/tokens";

const API = "https://api.mollie.com/v2";
// En dessous, le prorata d'une montée de plan n'est pas facturé : le nouveau
// plan s'applique au renouvellement suivant.
const MIN_CHARGE_EUR = 1;

type Amount = { currency: "EUR"; value: string };
type Metadata = { kind?: string; user_id?: string; plan?: string; fraction?: number } | null;

type MolliePayment = {
  id: string;
  status: string;
  customerId?: string;
  mandateId?: string;
  subscriptionId?: string;
  metadata: Metadata;
  _links: { checkout?: { href: string } };
};

type MollieSubscription = {
  id: string;
  status: string;
  nextPaymentDate?: string;
  metadata: Metadata;
};

async function mollie<T>(method: "GET" | "POST" | "PATCH" | "DELETE", path: string, body?: object, idempotencyKey?: string) {
  const key = process.env.MOLLIE_API_KEY;
  if (!key) throw new Error("MOLLIE_API_KEY manquant dans .env.local");
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      ...(body && { "Content-Type": "application/json" }),
      // Une requête rejouée avec la même clé ne crée rien de plus chez Mollie.
      ...(idempotencyKey && { "Idempotency-Key": idempotencyKey }),
    },
    body: body && JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Mollie ${method} ${path} : ${res.status} ${await res.text()}`);
  return (await res.json()) as T;
}

const euros = (value: number): Amount => ({ currency: "EUR", value: value.toFixed(2) });
const webhookUrl = () => `${publicBaseUrl()}/api/webhooks/mollie`;

// Date du jour + n mois, au format AAAA-MM-JJ attendu par Mollie.
function inMonths(months: number, from = new Date()): string {
  const date = new Date(from);
  date.setUTCMonth(date.getUTCMonth() + months);
  return date.toISOString().slice(0, 10);
}

async function subscriptionRow(userId: string) {
  const { data, error } = await adminClient().from("subscriptions").select("*").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return data;
}

async function saveSubscription(userId: string, fields: Record<string, unknown>) {
  const { error } = await adminClient()
    .from("subscriptions")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("user_id", userId);
  if (error) throw error;
}

// Client Mollie de l'utilisateur, créé au premier achat. La clé d'idempotence
// évite deux clients Mollie si l'utilisateur clique deux fois.
async function customerIdFor(user: User): Promise<string> {
  const existing = await subscriptionRow(user.id);
  if (existing) return existing.mollie_customer_id;

  const customer = await mollie<{ id: string }>(
    "POST",
    "/customers",
    { email: user.email, metadata: { user_id: user.id } },
    `customer/${user.id}`,
  );
  const { error } = await adminClient()
    .from("subscriptions")
    .upsert({ user_id: user.id, mollie_customer_id: customer.id }, { onConflict: "user_id", ignoreDuplicates: true });
  if (error) throw error;
  return customer.id;
}

// Premier paiement : renvoie l'adresse de la page de paiement Mollie.
export async function createFirstPayment(user: User, plan: PlanId, redirectUrl: string): Promise<string> {
  const payment = await mollie<MolliePayment>("POST", "/payments", {
    amount: euros(PLANS[plan].priceEur),
    description: `Cosmos Generator, abonnement ${PLANS[plan].label}`,
    customerId: await customerIdFor(user),
    sequenceType: "first",
    redirectUrl,
    webhookUrl: webhookUrl(),
    locale: "fr_FR",
    metadata: { kind: "first", user_id: user.id, plan, waiver_accepted_at: new Date().toISOString() },
  });
  const checkout = payment._links.checkout?.href;
  if (!checkout) throw new Error(`Paiement Mollie ${payment.id} sans page de paiement`);
  return checkout;
}

// Abonnement mensuel sur le mandat du client, premier prélèvement à "startDate".
// Mollie veut une description unique par client : on y met la date de début.
async function createSubscription(userId: string, customerId: string, mandateId: string, plan: PlanId, startDate: string, key: string) {
  return mollie<MollieSubscription>(
    "POST",
    `/customers/${customerId}/subscriptions`,
    {
      amount: euros(PLANS[plan].priceEur),
      interval: "1 month",
      startDate,
      description: `Cosmos Generator, abonnement mensuel du ${startDate}`,
      mandateId,
      webhookUrl: webhookUrl(),
      metadata: { user_id: userId, plan },
    },
    key,
  );
}

// Changement de plan d'un abonné :
// - abonnement résilié mais encore en cours : réabonnement, sans paiement
//   avant la fin de la période déjà payée ;
// - montée de plan : la différence de prix au prorata du mois restant est
//   prélevée tout de suite ; les tokens arrivent quand le paiement est confirmé ;
// - baisse de plan (ou prorata trop faible) : s'applique au renouvellement.
export async function changePlan(userId: string, plan: PlanId): Promise<void> {
  const row = await subscriptionRow(userId);
  if (!row?.mollie_mandate_id || !row.current_period_end || !isPlanId(row.plan)) {
    throw new Error(`Abonnement de ${userId} incomplet, changement de plan impossible`);
  }
  const customer = row.mollie_customer_id;
  const periodEnd = new Date(row.current_period_end);

  if (row.status === "canceled") {
    const startDate = periodEnd.toISOString().slice(0, 10);
    const subscription = await createSubscription(userId, customer, row.mollie_mandate_id, plan, startDate, `resume/${userId}/${startDate}`);
    await saveSubscription(userId, {
      mollie_subscription_id: subscription.id,
      status: "active",
      cancel_at_period_end: false,
      next_plan: plan === row.plan ? null : plan,
    });
    return;
  }
  if (!row.mollie_subscription_id) throw new Error(`Abonnement de ${userId} sans identifiant Mollie`);

  const current = PLANS[row.plan];
  const periodStart = new Date(inMonths(-1, periodEnd));
  const fraction = Math.min(Math.max((+periodEnd - Date.now()) / (+periodEnd - +periodStart), 0), 1);
  const prorata = (PLANS[plan].priceEur - current.priceEur) * fraction;

  if (prorata >= MIN_CHARGE_EUR) {
    await mollie(
      "POST",
      "/payments",
      {
        amount: euros(prorata),
        description: `Cosmos Generator, passage au plan ${PLANS[plan].label}`,
        customerId: customer,
        mandateId: row.mollie_mandate_id,
        sequenceType: "recurring",
        webhookUrl: webhookUrl(),
        metadata: { kind: "upgrade", user_id: userId, plan, fraction },
      },
      `upgrade/${userId}/${plan}/${row.current_period_end}`,
    );
    return;
  }

  await mollie("PATCH", `/customers/${customer}/subscriptions/${row.mollie_subscription_id}`, {
    amount: euros(PLANS[plan].priceEur),
    metadata: { user_id: userId, plan },
  });
  await saveSubscription(userId, { next_plan: plan === row.plan ? null : plan });
}

// Résiliation : plus aucun prélèvement ; l'accès reste ouvert jusqu'à la fin
// de la période payée.
export async function cancelSubscription(userId: string): Promise<void> {
  const row = await subscriptionRow(userId);
  if (row?.mollie_subscription_id && row.status !== "canceled") {
    await mollie("DELETE", `/customers/${row.mollie_customer_id}/subscriptions/${row.mollie_subscription_id}`);
  }
  await saveSubscription(userId, { status: "canceled", cancel_at_period_end: true, next_plan: null });
}

// Appelée par le webhook pour chaque changement d'état d'un paiement. On relit
// toujours le paiement chez Mollie : le webhook ne contient que son identifiant,
// ce qui empêche un tiers d'y faire croire à un faux paiement.
export async function handlePaymentWebhook(paymentId: string): Promise<void> {
  const payment = await mollie<MolliePayment>("GET", `/payments/${paymentId}`);
  if (payment.subscriptionId) return onSubscriptionPayment(payment, payment.subscriptionId);
  if (payment.metadata?.kind === "first") return onFirstPayment(payment);
  if (payment.metadata?.kind === "upgrade") return onUpgradePayment(payment);
}

async function onFirstPayment(payment: MolliePayment) {
  const { user_id: userId, plan } = payment.metadata ?? {};
  if (payment.status !== "paid") return;
  if (!userId || !isPlanId(plan) || !payment.customerId || !payment.mandateId) {
    console.error(`Premier paiement Mollie ${payment.id} incomplet`);
    return;
  }
  const startDate = inMonths(1);
  const subscription = await createSubscription(userId, payment.customerId, payment.mandateId, plan, startDate, `subscription/${payment.id}`);
  await saveSubscription(userId, {
    mollie_subscription_id: subscription.id,
    mollie_mandate_id: payment.mandateId,
    plan,
    status: "active",
    current_period_end: new Date(subscription.nextPaymentDate ?? startDate).toISOString(),
    cancel_at_period_end: false,
    next_plan: null,
  });
  await resetTokens(userId, PLANS[plan].monthlyTokens, "monthly_reset", payment.id);
}

// Prélèvement mensuel : solde remis au quota du plan, période prolongée.
async function onSubscriptionPayment(payment: MolliePayment, subscriptionId: string) {
  if (!payment.customerId) return;
  const subscription = await mollie<MollieSubscription>("GET", `/customers/${payment.customerId}/subscriptions/${subscriptionId}`);
  const { user_id: userId, plan } = subscription.metadata ?? {};
  if (!userId || !isPlanId(plan)) {
    console.error(`Abonnement Mollie ${subscriptionId} sans user_id ou plan`);
    return;
  }

  if (payment.status === "paid") {
    await saveSubscription(userId, {
      plan,
      status: subscription.status === "canceled" ? "canceled" : "active",
      ...(subscription.nextPaymentDate && { current_period_end: new Date(subscription.nextPaymentDate).toISOString() }),
      next_plan: null,
    });
    await resetTokens(userId, PLANS[plan].monthlyTokens, "monthly_reset", payment.id);
  } else if (["failed", "expired", "canceled"].includes(payment.status)) {
    // Pas de nouvel essai automatique chez Mollie : l'accès s'arrête à la fin
    // de la période (plus le délai de grâce), sauf si le client se réabonne.
    await saveSubscription(userId, { status: "past_due" });
  }
}

// Prorata de montée de plan payé : l'abonnement passe au nouveau prix et la
// différence de quota est créditée tout de suite.
async function onUpgradePayment(payment: MolliePayment) {
  const { user_id: userId, plan, fraction } = payment.metadata ?? {};
  if (payment.status !== "paid") return;
  if (!userId || !isPlanId(plan) || typeof fraction !== "number") {
    console.error(`Paiement de montée de plan ${payment.id} incomplet`);
    return;
  }
  const row = await subscriptionRow(userId);
  if (row?.mollie_subscription_id) {
    await mollie("PATCH", `/customers/${row.mollie_customer_id}/subscriptions/${row.mollie_subscription_id}`, {
      amount: euros(PLANS[plan].priceEur),
      metadata: { user_id: userId, plan },
    });
  }
  await saveSubscription(userId, { plan, next_plan: null });
  await upgradeTokens(userId, PLANS[plan].monthlyTokens, fraction, payment.id);
}
