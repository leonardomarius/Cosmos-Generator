// Paiements Mollie, uniquement côté serveur : MOLLIE_API_KEY ne doit jamais
// arriver dans le navigateur. Mollie n'a pas de portail client comme Stripe.
// Abonnement, au mois ou à l'année :
// 1. premier paiement ("first") sur la page Mollie, qui crée un mandat ;
// 2. une fois payé, le webhook crée l'abonnement sur ce mandat ;
// 3. chaque prélèvement repasse par le webhook, qui recharge les tokens. Sur
//    l'annuel, les recharges des autres mois se font à la lecture du compte
//    (getAccount dans src/lib/tokens.ts).
// Achat unique : paiement "oneoff" sans mandat, le webhook crédite les tokens.
// Une rétrofacturation, sur l'un ou l'autre, bloque le compte.
// Mollie reste la source de vérité ; la table "subscriptions" en est une copie.
import type { User } from "@supabase/supabase-js";
import {
  PLANS,
  TOKEN_PACKS,
  isBillingInterval,
  isPlanId,
  planPriceEur,
  type BillingInterval,
  type PackId,
  type PlanId,
} from "@/config/product";
import { INTERVAL_MONTHS, addMonths, upgradeQuote } from "@/lib/billing-dates";
import { publicBaseUrl } from "@/lib/fal";
import { adminClient } from "@/lib/supabase";
import {
  blockAccountForChargeback,
  creditPurchasedTokens,
  isAccountBlocked,
  ledgerHasRef,
  resetTokens,
  upgradeTokens,
} from "@/lib/tokens";

const API = "https://api.mollie.com/v2";
const MOLLIE_INTERVAL: Record<BillingInterval, string> = { month: "1 month", year: "12 months" };
const INTERVAL_LABEL: Record<BillingInterval, string> = { month: "mensuel", year: "annuel" };

type Amount = { currency: "EUR"; value: string };
type Metadata = {
  kind?: string;
  user_id?: string;
  plan?: string;
  // Absent des abonnements créés avant l'annuel : ils sont mensuels.
  interval?: string;
  // Montée de plan : part du prix (reste de la période) et part des tokens
  // (reste du mois). "fraction" : ancien nom, le même nombre pour les deux.
  price_fraction?: number;
  token_fraction?: number;
  fraction?: number;
  // Achat unique.
  pack?: string;
  tokens?: number;
} | null;

type MolliePayment = {
  id: string;
  status: string;
  customerId?: string;
  mandateId?: string;
  subscriptionId?: string;
  metadata: Metadata;
  // Absent tant que rien n'a été rétrofacturé.
  amountChargedBack?: Amount;
  _embedded?: { chargebacks?: { reversedAt?: string | null }[] };
  _links: { checkout?: { href: string } };
};

type MollieSubscription = {
  id: string;
  status: string;
  nextPaymentDate?: string;
  metadata: Metadata;
};

class MollieError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

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
  if (!res.ok) throw new MollieError(`Mollie ${method} ${path} : ${res.status} ${await res.text()}`, res.status);
  return (await res.json()) as T;
}

const euros = (value: number): Amount => ({ currency: "EUR", value: value.toFixed(2) });
const webhookUrl = () => `${publicBaseUrl()}/api/webhooks/mollie`;
const asInterval = (value: unknown): BillingInterval => (isBillingInterval(value) ? value : "month");

// Date du jour + n mois, au format AAAA-MM-JJ attendu par Mollie.
function inMonths(months: number): string {
  return addMonths(new Date(), months).toISOString().slice(0, 10);
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

// Un client créé avec une autre clé (test ou live) n'existe pas pour la clé active.
async function customerExists(customerId: string): Promise<boolean> {
  try {
    await mollie("GET", `/customers/${customerId}`);
    return true;
  } catch (err) {
    if (err instanceof MollieError && (err.status === 404 || err.status === 410)) return false;
    throw err;
  }
}

// Client Mollie de l'utilisateur, créé au premier abonnement. La clé
// d'idempotence évite deux clients Mollie si l'utilisateur clique deux fois.
// Sans mandat, aucun paiement n'a abouti : un client introuvable est remplacé.
async function customerIdFor(user: User): Promise<string> {
  const existing = await subscriptionRow(user.id);
  if (existing && (existing.mollie_mandate_id || (await customerExists(existing.mollie_customer_id)))) {
    return existing.mollie_customer_id;
  }

  const customer = await mollie<{ id: string }>(
    "POST",
    "/customers",
    { email: user.email, metadata: { user_id: user.id } },
    `customer/${user.id}`,
  );
  if (existing) {
    await saveSubscription(user.id, { mollie_customer_id: customer.id });
    return customer.id;
  }
  const { error } = await adminClient()
    .from("subscriptions")
    .upsert({ user_id: user.id, mollie_customer_id: customer.id }, { onConflict: "user_id", ignoreDuplicates: true });
  if (error) throw error;
  return customer.id;
}

function checkoutUrl(payment: MolliePayment): string {
  const checkout = payment._links.checkout?.href;
  if (!checkout) throw new Error(`Paiement Mollie ${payment.id} sans page de paiement`);
  return checkout;
}

// Premier paiement : renvoie l'adresse de la page de paiement Mollie.
export async function createFirstPayment(user: User, plan: PlanId, interval: BillingInterval, redirectUrl: string): Promise<string> {
  const payment = await mollie<MolliePayment>("POST", "/payments", {
    amount: euros(planPriceEur(plan, interval)),
    description: `Cosmos Generator, abonnement ${PLANS[plan].label} ${INTERVAL_LABEL[interval]}`,
    customerId: await customerIdFor(user),
    sequenceType: "first",
    redirectUrl,
    webhookUrl: webhookUrl(),
    locale: "fr_FR",
    metadata: { kind: "first", user_id: user.id, plan, interval, waiver_accepted_at: new Date().toISOString() },
  });
  return checkoutUrl(payment);
}

// Achat unique : paiement sans mandat ni ligne dans "subscriptions". Le prix et
// la quantité viennent de la config, jamais de la requête du navigateur.
export async function createPackPayment(user: User, pack: PackId, redirectUrl: string): Promise<string> {
  const { tokens, priceEur } = TOKEN_PACKS[pack];
  const payment = await mollie<MolliePayment>("POST", "/payments", {
    amount: euros(priceEur),
    description: `Cosmos Generator, ${tokens} tokens`,
    sequenceType: "oneoff",
    redirectUrl,
    webhookUrl: webhookUrl(),
    locale: "fr_FR",
    metadata: { kind: "pack", user_id: user.id, pack, tokens, waiver_accepted_at: new Date().toISOString() },
  });
  return checkoutUrl(payment);
}

const subscriptionDescription = (interval: BillingInterval, startDate: string) =>
  `Cosmos Generator, abonnement ${INTERVAL_LABEL[interval]} du ${startDate}`;

// Abonnement sur le mandat du client, premier prélèvement à "startDate".
// Mollie veut une description unique par client : on y met la date de début.
async function createSubscription(
  userId: string,
  customerId: string,
  mandateId: string,
  plan: PlanId,
  interval: BillingInterval,
  startDate: string,
  key: string,
) {
  return mollie<MollieSubscription>(
    "POST",
    `/customers/${customerId}/subscriptions`,
    {
      amount: euros(planPriceEur(plan, interval)),
      interval: MOLLIE_INTERVAL[interval],
      startDate,
      description: subscriptionDescription(interval, startDate),
      mandateId,
      webhookUrl: webhookUrl(),
      metadata: { user_id: userId, plan, interval },
    },
    key,
  );
}

export type PlanChange = "resumed" | "upgraded" | "scheduled";

// Changement de plan d'un abonné :
// - abonnement résilié mais encore en cours : réabonnement, sans paiement
//   avant la fin de la période déjà payée ;
// - montée de plan sur le même intervalle : la différence de prix au prorata
//   de la période restante est prélevée tout de suite ; les tokens arrivent
//   quand le paiement est confirmé ;
// - baisse de plan (ou prorata trop faible) et tout changement d'intervalle :
//   s'applique au renouvellement, la date du prochain prélèvement ne bouge pas.
export async function changePlan(userId: string, plan: PlanId, interval: BillingInterval): Promise<PlanChange> {
  const row = await subscriptionRow(userId);
  if (!row?.mollie_mandate_id || !row.current_period_end || !isPlanId(row.plan)) {
    throw new Error(`Abonnement de ${userId} incomplet, changement de plan impossible`);
  }
  const customer = row.mollie_customer_id;
  const current = asInterval(row.billing_interval);
  const periodEnd = new Date(row.current_period_end);
  const scheduled = {
    next_plan: plan === row.plan ? null : plan,
    next_interval: interval === current ? null : interval,
  };

  if (row.status === "canceled") {
    const startDate = periodEnd.toISOString().slice(0, 10);
    const subscription = await createSubscription(
      userId,
      customer,
      row.mollie_mandate_id,
      plan,
      interval,
      startDate,
      `resume/${row.mollie_subscription_id ?? userId}/${plan}/${interval}`,
    );
    await saveSubscription(userId, {
      mollie_subscription_id: subscription.id,
      status: "active",
      cancel_at_period_end: false,
      ...scheduled,
    });
    return "resumed";
  }
  if (!row.mollie_subscription_id) throw new Error(`Abonnement de ${userId} sans identifiant Mollie`);

  if (interval === current) {
    const quote = upgradeQuote(row.plan, plan, current, periodEnd);
    if (quote) {
      await mollie(
        "POST",
        "/payments",
        {
          amount: euros(quote.amountEur),
          description: `Cosmos Generator, passage au plan ${PLANS[plan].label}`,
          customerId: customer,
          mandateId: row.mollie_mandate_id,
          sequenceType: "recurring",
          webhookUrl: webhookUrl(),
          metadata: {
            kind: "upgrade",
            user_id: userId,
            plan,
            interval,
            price_fraction: quote.priceFraction,
            token_fraction: quote.tokenFraction,
          },
        },
        `upgrade/${userId}/${plan}/${row.current_period_end}`,
      );
      return "upgraded";
    }
  }

  await updateMollieSubscription(row, plan, interval);
  await saveSubscription(userId, scheduled);
  return "scheduled";
}

// Prix, plan et intervalle du prochain prélèvement. L'intervalle n'est envoyé
// que s'il change chez Mollie.
async function updateMollieSubscription(
  row: { user_id: string; mollie_customer_id: string; mollie_subscription_id: string | null; billing_interval: string; next_interval: string | null },
  plan: PlanId,
  interval: BillingInterval,
) {
  const pending = asInterval(row.next_interval ?? row.billing_interval);
  await mollie("PATCH", `/customers/${row.mollie_customer_id}/subscriptions/${row.mollie_subscription_id}`, {
    amount: euros(planPriceEur(plan, interval)),
    ...(interval !== pending && { interval: MOLLIE_INTERVAL[interval] }),
    metadata: { user_id: row.user_id, plan, interval },
  });
}

// Arrête un abonnement chez Mollie. Il peut déjà l'être : après ses essais de
// prélèvement ou sur certains motifs, Mollie résilie de lui-même.
async function stopMollieSubscription(customerId: string, subscriptionId: string) {
  const path = `/customers/${customerId}/subscriptions/${subscriptionId}`;
  const subscription = await mollie<MollieSubscription>("GET", path).catch((err) => {
    if (err instanceof MollieError && err.status === 404) return null;
    throw err;
  });
  if (subscription && !["canceled", "completed"].includes(subscription.status)) await mollie("DELETE", path);
}

// Résiliation : plus aucun prélèvement, sans remboursement. L'accès reste
// ouvert jusqu'à la fin de la période payée ; sur l'annuel, les recharges
// mensuelles continuent jusque-là.
export async function cancelSubscription(userId: string): Promise<void> {
  const row = await subscriptionRow(userId);
  if (row?.mollie_subscription_id && row.status !== "canceled") {
    await stopMollieSubscription(row.mollie_customer_id, row.mollie_subscription_id);
  }
  await saveSubscription(userId, { status: "canceled", cancel_at_period_end: true, next_plan: null, next_interval: null });
}

// Appelée par le webhook pour chaque changement d'état d'un paiement. On relit
// toujours le paiement chez Mollie : le webhook ne contient que son identifiant,
// ce qui empêche un tiers d'y faire croire à un faux paiement.
export async function handlePaymentWebhook(paymentId: string): Promise<void> {
  const payment = await mollie<MolliePayment>("GET", `/payments/${paymentId}?embed=chargebacks`);
  // En premier : après une rétrofacturation, le paiement reste "paid" et le
  // rappel relancerait sinon le traitement d'un paiement normal.
  if (isChargedBack(payment)) return blockForChargeback(payment);

  const userId = await paymentUserId(payment);
  if (userId && (await isAccountBlocked(userId))) {
    if (payment.status === "paid") {
      console.error(`Paiement Mollie ${payment.id} confirmé sur le compte bloqué ${userId} : rien n'est crédité, à traiter à la main.`);
    }
    return;
  }

  if (payment.subscriptionId) return onSubscriptionPayment(payment, payment.subscriptionId);
  if (payment.metadata?.kind === "first") return onFirstPayment(payment);
  if (payment.metadata?.kind === "upgrade") return onUpgradePayment(payment);
  if (payment.metadata?.kind === "pack") return onPackPayment(payment);
}

// Rétrofacturation en cours : un montant rétrofacturé et au moins une
// rétrofacturation non annulée. Sans détail chez Mollie, on la considère en cours.
function isChargedBack(payment: MolliePayment): boolean {
  if (!payment.amountChargedBack || Number(payment.amountChargedBack.value) === 0) return false;
  const chargebacks = payment._embedded?.chargebacks ?? [];
  return chargebacks.length === 0 || chargebacks.some((chargeback) => !chargeback.reversedAt);
}

async function paymentUserId(payment: MolliePayment): Promise<string | null> {
  if (payment.metadata?.user_id) return payment.metadata.user_id;
  if (!payment.customerId) return null;
  const { data, error } = await adminClient()
    .from("subscriptions")
    .select("user_id")
    .eq("mollie_customer_id", payment.customerId)
    .maybeSingle();
  if (error) throw error;
  return data?.user_id ?? null;
}

// Bloque le compte (une fois) puis résilie l'abonnement. Si Mollie échoue, le
// webhook répond 500 et Mollie rappelle : seule la résiliation est refaite.
async function blockForChargeback(payment: MolliePayment) {
  const userId = await paymentUserId(payment);
  if (!userId) throw new Error(`Rétrofacturation sur le paiement ${payment.id} sans utilisateur`);
  const ref = `chargeback:${payment.id}`;
  await blockAccountForChargeback(userId, ref);
  // Déjà débloqué à la main : un rappel tardif ne touche pas au nouvel abonnement.
  if (!(await isAccountBlocked(userId))) return;

  const row = await subscriptionRow(userId);
  if (!row || row.status === "none") return;
  if (row.mollie_subscription_id && row.status !== "canceled") {
    await stopMollieSubscription(row.mollie_customer_id, row.mollie_subscription_id);
  }
  // La période s'arrête ici : un déblocage ne relancera pas les recharges.
  const now = new Date().toISOString();
  await saveSubscription(userId, {
    status: "canceled",
    cancel_at_period_end: true,
    next_plan: null,
    next_interval: null,
    current_period_end: row.current_period_end && row.current_period_end < now ? row.current_period_end : now,
  });
}

async function onFirstPayment(payment: MolliePayment) {
  const { user_id: userId, plan } = payment.metadata ?? {};
  if (payment.status !== "paid") return;
  if (!userId || !isPlanId(plan) || !payment.customerId || !payment.mandateId) {
    console.error(`Premier paiement Mollie ${payment.id} incomplet`);
    return;
  }
  // Déjà traité : un rappel ne crée pas un second abonnement.
  if (await ledgerHasRef(payment.id)) return;
  // Ancien abonnement encore vivant chez Mollie (dernier prélèvement refusé,
  // accès terminé) : il ne doit pas continuer à prélever en parallèle.
  const previous = await subscriptionRow(userId);
  if (previous?.mollie_subscription_id && previous.status !== "canceled") {
    await stopMollieSubscription(previous.mollie_customer_id, previous.mollie_subscription_id);
  }
  const interval = asInterval(payment.metadata?.interval);
  const startDate = inMonths(INTERVAL_MONTHS[interval]);
  const subscription = await createSubscription(userId, payment.customerId, payment.mandateId, plan, interval, startDate, `subscription/${payment.id}`);
  await saveSubscription(userId, {
    mollie_subscription_id: subscription.id,
    mollie_mandate_id: payment.mandateId,
    plan,
    billing_interval: interval,
    status: "active",
    current_period_end: new Date(subscription.nextPaymentDate ?? startDate).toISOString(),
    cancel_at_period_end: false,
    next_plan: null,
    next_interval: null,
    renewal_reminder_sent_at: null,
  });
  await resetTokens(userId, PLANS[plan].monthlyTokens, "monthly_reset", payment.id);
}

// Prélèvement : solde d'abonnement remis au quota, période prolongée.
// Le plan et l'intervalle sont ceux du paiement reçu (Mollie y copie les
// metadata de l'abonnement) : un changement programmé pendant qu'un prélèvement
// attend sa confirmation reste programmé.
async function onSubscriptionPayment(payment: MolliePayment, subscriptionId: string) {
  if (!payment.customerId) return;
  const subscription = await mollie<MollieSubscription>("GET", `/customers/${payment.customerId}/subscriptions/${subscriptionId}`);
  const userId = payment.metadata?.user_id ?? subscription.metadata?.user_id;
  const plan = payment.metadata?.plan ?? subscription.metadata?.plan;
  if (!userId || !isPlanId(plan)) {
    console.error(`Abonnement Mollie ${subscriptionId} sans user_id ou plan`);
    return;
  }

  if (payment.status === "paid") {
    // Déjà traité : un rappel n'écrase pas ce qui a changé depuis.
    if (await ledgerHasRef(payment.id)) return;
    const row = await subscriptionRow(userId);
    const interval = asInterval(payment.metadata?.plan ? payment.metadata.interval : subscription.metadata?.interval);
    const scheduledPlan = subscription.metadata?.plan;
    const scheduledInterval = asInterval(subscription.metadata?.interval);
    // Abonnement résilié pendant que ce prélèvement attendait sa confirmation :
    // Mollie n'a plus de prochaine date, la période payée reste due.
    const periodEnd = subscription.nextPaymentDate
      ? new Date(subscription.nextPaymentDate)
      : addMonths(new Date(row?.current_period_end ?? Date.now()), INTERVAL_MONTHS[interval]);
    await saveSubscription(userId, {
      plan,
      billing_interval: interval,
      status: subscription.status === "canceled" ? "canceled" : "active",
      current_period_end: periodEnd.toISOString(),
      next_plan: isPlanId(scheduledPlan) && scheduledPlan !== plan ? scheduledPlan : null,
      next_interval: scheduledInterval !== interval ? scheduledInterval : null,
      renewal_reminder_sent_at: null,
    });
    await resetTokens(userId, PLANS[plan].monthlyTokens, "monthly_reset", payment.id);
  } else if (["failed", "expired", "canceled"].includes(payment.status)) {
    // Mollie retente le prélèvement jusqu'à 5 fois, puis résilie l'abonnement :
    // l'accès s'arrête à la fin de la période (plus le délai de grâce), sauf
    // si un nouvel essai réussit ou si le client se réabonne.
    await saveSubscription(userId, { status: subscription.status === "canceled" ? "canceled" : "past_due" });
  }
}

// Prorata de montée de plan payé : l'abonnement passe au nouveau prix et la
// différence de quota est créditée tout de suite, au prorata du mois en cours.
async function onUpgradePayment(payment: MolliePayment) {
  const { user_id: userId, plan, token_fraction: tokenFraction, fraction } = payment.metadata ?? {};
  if (payment.status !== "paid") return;
  const tokens = tokenFraction ?? fraction;
  if (!userId || !isPlanId(plan) || typeof tokens !== "number") {
    console.error(`Paiement de montée de plan ${payment.id} incomplet`);
    return;
  }
  const row = await subscriptionRow(userId);
  const interval = asInterval(payment.metadata?.interval);
  // Résilié entre-temps : Mollie refuse de modifier un abonnement résilié.
  if (row?.mollie_subscription_id && row.status !== "canceled") {
    await updateMollieSubscription(row, plan, interval);
  }
  await saveSubscription(userId, { plan, next_plan: null, next_interval: null });
  await upgradeTokens(userId, PLANS[plan].monthlyTokens, tokens, payment.id);
}

// Achat unique payé : crédit unique, avec la quantité écrite à la création du
// paiement, côté serveur.
async function onPackPayment(payment: MolliePayment) {
  if (payment.status !== "paid") return;
  const { user_id: userId, tokens } = payment.metadata ?? {};
  if (!userId || !Number.isInteger(tokens) || tokens! <= 0) {
    console.error(`Paiement de pack ${payment.id} incomplet`);
    return;
  }
  const credited = await creditPurchasedTokens(userId, tokens!, `purchase:${payment.id}`);
  if (!credited) {
    console.error(`Paiement Mollie ${payment.id} confirmé sur le compte bloqué ${userId} : rien n'est crédité, à traiter à la main.`);
  }
}
