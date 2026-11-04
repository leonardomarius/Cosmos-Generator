// Solde de tokens et abonnement d'un utilisateur. Les opérations sur le solde
// sont des fonctions SQL (supabase/migrations) : chacune verrouille le solde
// et ne s'applique qu'une fois par référence, même si un webhook est rejoué.
import { PLANS, isBillingInterval, isPlanId, type BillingInterval, type PlanId } from "@/config/product";
import { adminClient } from "@/lib/supabase";

export class InsufficientTokensError extends Error {}
// Compte bloqué après une rétrofacturation (accountSuspendedMessage).
export class AccountBlockedError extends Error {}

export type Account = {
  // Total dépensable : tokens d'abonnement + tokens achetés.
  balance: number;
  // Tokens d'abonnement, perdus à chaque recharge et à la fin de l'abonnement.
  subscriptionBalance: number;
  // Tokens achetés, qui n'expirent jamais.
  purchasedBalance: number;
  blocked: boolean;
  plan: PlanId | null;
  interval: BillingInterval;
  // "active", "past_due" (prélèvement échoué), "canceled", "none" sans abonnement.
  status: string;
  // Fin de la période payée (un mois ou un an) : date du prochain prélèvement.
  currentPeriodEnd: string | null;
  // Prochaine remise au quota : le mois suivant sur l'annuel, sinon la fin de
  // la période. Null s'il n'y en aura plus (résilié, dernier mois de l'année).
  nextRecharge: string | null;
  cancelAtPeriodEnd: boolean;
  // Plan et intervalle choisis, appliqués au prochain renouvellement.
  nextPlan: PlanId | null;
  nextInterval: BillingInterval | null;
};

// Un prélèvement SEPA met quelques jours à être confirmé : l'accès reste
// ouvert pendant ce délai après la fin de la période.
const RENEWAL_GRACE_MS = 5 * 24 * 60 * 60 * 1000;

// Date + n mois (n peut être négatif), bornée à la fin du mois d'arrivée :
// 31 janvier + 1 mois = 28 février, là où setUTCMonth déborderait en mars.
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + months);
  const lastDay = new Date(Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)).getUTCDate();
  result.setUTCDate(Math.min(date.getUTCDate(), lastDay));
  return result;
}

// Mois d'abonnement en cours sur une année payée qui finit à "periodEnd" :
// son numéro (0 à 11) et ses bornes, calculées depuis la date anniversaire
// (jamais de mois en mois, pour qu'un 28 février ne décale pas la suite).
// Null en dehors de l'année payée.
export function annualMonth(periodEnd: Date, now = new Date()) {
  const start = addMonths(periodEnd, -12);
  if (now < start || now >= periodEnd) return null;
  let index = 0;
  while (index < 11 && addMonths(start, index + 1) <= now) index++;
  return { index, from: addMonths(start, index), to: addMonths(start, index + 1) };
}

async function readBalances(userId: string) {
  const { data, error } = await adminClient()
    .from("token_balances")
    .select("balance, purchased_balance, blocked_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return { balance: data?.balance ?? 0, purchased: data?.purchased_balance ?? 0, blockedAt: data?.blocked_at ?? null };
}

export async function isAccountBlocked(userId: string): Promise<boolean> {
  return (await readBalances(userId)).blockedAt !== null;
}

// Cette référence (paiement, recharge…) a-t-elle déjà été traitée ?
export async function ledgerHasRef(ref: string): Promise<boolean> {
  const { data, error } = await adminClient().from("token_ledger").select("id").eq("ref", ref).maybeSingle();
  if (error) throw error;
  return data !== null;
}

export async function getAccount(userId: string): Promise<Account> {
  const { data: sub, error } = await adminClient()
    .from("subscriptions")
    .select("plan, status, billing_interval, current_period_end, cancel_at_period_end, next_plan, next_interval")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;

  const plan = isPlanId(sub?.plan) ? sub.plan : null;
  const interval = isBillingInterval(sub?.billing_interval) ? sub.billing_interval : "month";
  const currentPeriodEnd = sub?.current_period_end ?? null;
  const month = interval === "year" && currentPeriodEnd ? annualMonth(new Date(currentPeriodEnd)) : null;

  // Annuel : aucun paiement ne déclenche les recharges, elles se font ici,
  // à la première lecture de chaque mois, au quota de subscriptions.plan. Le
  // mois 0 vient du paiement. Une seule recharge par mois (référence du
  // ledger), sans cumul après une absence. Le solde est lu après : un appel
  // parallèle voit bien le résultat de la recharge.
  if (plan && month && month.index > 0) {
    const ref = `annual:${userId}:${currentPeriodEnd!.slice(0, 10)}:${month.index}`;
    if (!(await ledgerHasRef(ref)) && !(await isAccountBlocked(userId))) {
      await resetTokens(userId, PLANS[plan].monthlyTokens, "monthly_reset", ref);
    }
  }

  let balances = await readBalances(userId);
  const toAccount = (): Account => ({
    balance: balances.balance + balances.purchased,
    subscriptionBalance: balances.balance,
    purchasedBalance: balances.purchased,
    blocked: balances.blockedAt !== null,
    plan,
    interval,
    status: sub?.status ?? "none",
    currentPeriodEnd,
    nextRecharge: nextRecharge(sub?.status ?? "none", currentPeriodEnd, month),
    cancelAtPeriodEnd: sub?.cancel_at_period_end ?? false,
    nextPlan: isPlanId(sub?.next_plan) ? sub.next_plan : null,
    nextInterval: isBillingInterval(sub?.next_interval) ? sub.next_interval : null,
  });

  // Mollie ne prévient pas quand un abonnement arrive à son terme : les tokens
  // d'abonnement sont remis à 0 à la première lecture qui suit (une seule fois
  // par période). Les tokens achetés ne sont ni regardés ni touchés.
  const account = toAccount();
  if (!account.blocked && balances.balance > 0 && currentPeriodEnd && !hasActiveSubscription(account)) {
    await resetTokens(userId, 0, "expired", `expired:${userId}:${currentPeriodEnd}`);
    balances = await readBalances(userId);
    return toAccount();
  }
  return account;
}

function nextRecharge(status: string, periodEnd: string | null, month: ReturnType<typeof annualMonth>): string | null {
  if (!periodEnd || status === "none") return null;
  if (month && month.index < 11) return month.to.toISOString();
  return status === "canceled" ? null : periodEnd;
}

// Abonnement en cours de validité : période payée pas encore finie (avec un
// délai de grâce pour le prélèvement suivant, sauf s'il a été résilié).
export function hasActiveSubscription(account: Account): boolean {
  if (!account.currentPeriodEnd || account.status === "none") return false;
  const end = Date.parse(account.currentPeriodEnd);
  return Date.now() < (account.status === "canceled" ? end : end + RENEWAL_GRACE_MS);
}

// reason : "monthly_reset" (paiement reçu, recharge de l'annuel) ou "expired"
// (abonnement terminé). Ne touche que les tokens d'abonnement.
export async function resetTokens(userId: string, quota: number, reason: "monthly_reset" | "expired", ref: string) {
  const { error } = await adminClient().rpc("reset_tokens", {
    p_user: userId,
    p_quota: quota,
    p_reason: reason,
    p_ref: ref,
  });
  if (error) throw error;
}

// Montée de plan payée en cours de mois : différence de quota, au prorata du
// temps restant jusqu'à la prochaine recharge.
export async function upgradeTokens(userId: string, quota: number, remainingFraction: number, ref: string) {
  const { error } = await adminClient().rpc("upgrade_tokens", {
    p_user: userId,
    p_quota: quota,
    p_fraction: remainingFraction,
    p_ref: ref,
  });
  if (error) throw error;
}

// Tokens achetés, paiement confirmé. Renvoie false si le compte est bloqué :
// rien n'est crédité.
export async function creditPurchasedTokens(userId: string, tokens: number, ref: string): Promise<boolean> {
  const { data, error } = await adminClient().rpc("credit_purchased_tokens", {
    p_user: userId,
    p_amount: tokens,
    p_ref: ref,
  });
  if (error) throw error;
  return data !== null;
}

// Rétrofacturation : bloque le compte et remet les deux soldes à 0, une seule
// fois par référence.
export async function blockAccountForChargeback(userId: string, ref: string) {
  const { error } = await adminClient().rpc("block_account_for_chargeback", { p_user: userId, p_ref: ref });
  if (error) throw error;
}

// Crée la génération et retire ses tokens. Renvoie son identifiant.
export async function reserveGeneration(userId: string, model: string, tokens: number): Promise<string> {
  // Recharge l'annuel et remet à 0 le solde d'un abonnement terminé avant de
  // le dépenser.
  const account = await getAccount(userId);
  if (account.blocked) throw new AccountBlockedError();
  if (account.balance < tokens) throw new InsufficientTokensError();
  const db = adminClient();
  const { data, error } = await db
    .from("generations")
    .insert({ user_id: userId, model, tokens })
    .select("id")
    .single();
  if (error) throw error;
  const generationId = data.id;

  const spent = await db.rpc("spend_tokens", { p_user: userId, p_amount: tokens, p_generation: generationId });
  if (spent.error) {
    await db.from("generations").update({ status: "failed" }).eq("id", generationId);
    if (spent.error.message.includes("account_blocked")) throw new AccountBlockedError();
    if (spent.error.message.includes("insufficient_tokens")) throw new InsufficientTokensError();
    throw spent.error;
  }
  return generationId;
}

export async function markGenerationQueued(generationId: string, falRequestId: string) {
  const { error } = await adminClient()
    .from("generations")
    .update({ fal_request_id: falRequestId, status: "queued" })
    .eq("id", generationId);
  if (error) throw error;
}

// Génération terminée. En cas d'échec, les tokens sont rendus (une seule fois),
// sauf si le compte a été bloqué entre-temps.
export async function settleGeneration(where: { id: string } | { falRequestId: string }, status: "done" | "failed") {
  const db = adminClient();
  const query = db.from("generations").update({ status });
  const { data, error } = await ("id" in where ? query.eq("id", where.id) : query.eq("fal_request_id", where.falRequestId))
    .select("id")
    .maybeSingle();
  if (error) throw error;
  const generationId = data?.id;
  if (!generationId) {
    console.error("Génération introuvable, aucun remboursement possible", where);
    return;
  }
  if (status === "failed") {
    const refund = await db.rpc("refund_generation", { p_generation: generationId });
    if (refund.error) throw refund.error;
  }
}
