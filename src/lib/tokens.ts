// Solde de tokens et abonnement d'un utilisateur. Les opérations sur le solde
// sont des fonctions SQL (supabase/migrations) : chacune verrouille le solde
// et ne s'applique qu'une fois par référence, même si un webhook est rejoué.
import { isPlanId, type PlanId } from "@/config/product";
import { adminClient } from "@/lib/supabase";

export class InsufficientTokensError extends Error {}

export type Account = {
  balance: number;
  plan: PlanId | null;
  // "active", "past_due" (prélèvement échoué), "canceled", "none" sans abonnement.
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  // Plan choisi en baisse, appliqué au prochain renouvellement.
  nextPlan: PlanId | null;
};

// Un prélèvement SEPA met quelques jours à être confirmé : l'accès reste
// ouvert pendant ce délai après la fin de la période.
const RENEWAL_GRACE_MS = 5 * 24 * 60 * 60 * 1000;

export async function getAccount(userId: string): Promise<Account> {
  const db = adminClient();
  const [balance, subscription] = await Promise.all([
    db.from("token_balances").select("balance").eq("user_id", userId).maybeSingle(),
    db
      .from("subscriptions")
      .select("plan, status, current_period_end, cancel_at_period_end, next_plan")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);
  if (balance.error) throw balance.error;
  if (subscription.error) throw subscription.error;
  const sub = subscription.data;
  const account: Account = {
    balance: balance.data?.balance ?? 0,
    plan: isPlanId(sub?.plan) ? sub.plan : null,
    status: sub?.status ?? "none",
    currentPeriodEnd: sub?.current_period_end ?? null,
    cancelAtPeriodEnd: sub?.cancel_at_period_end ?? false,
    nextPlan: isPlanId(sub?.next_plan) ? sub.next_plan : null,
  };
  // Mollie ne prévient pas quand un abonnement arrive à son terme : le solde
  // est remis à 0 à la première lecture qui suit (une seule fois par période).
  if (account.balance > 0 && account.currentPeriodEnd && !hasActiveSubscription(account)) {
    await resetTokens(userId, 0, "expired", `expired:${userId}:${account.currentPeriodEnd}`);
    account.balance = 0;
  }
  return account;
}

// Abonnement en cours de validité : période payée pas encore finie (avec un
// délai de grâce pour le prélèvement suivant, sauf s'il a été résilié).
export function hasActiveSubscription(account: Account): boolean {
  if (!account.currentPeriodEnd || account.status === "none") return false;
  const end = Date.parse(account.currentPeriodEnd);
  return Date.now() < (account.status === "canceled" ? end : end + RENEWAL_GRACE_MS);
}

// reason : "monthly_reset" (paiement reçu) ou "expired" (abonnement terminé).
export async function resetTokens(userId: string, quota: number, reason: "monthly_reset" | "expired", ref: string) {
  const { error } = await adminClient().rpc("reset_tokens", {
    p_user: userId,
    p_quota: quota,
    p_reason: reason,
    p_ref: ref,
  });
  if (error) throw error;
}

// Montée de plan payée en cours de mois : différence de quota au prorata.
export async function upgradeTokens(userId: string, quota: number, remainingFraction: number, ref: string) {
  const { error } = await adminClient().rpc("upgrade_tokens", {
    p_user: userId,
    p_quota: quota,
    p_fraction: remainingFraction,
    p_ref: ref,
  });
  if (error) throw error;
}

// Crée la génération et retire ses tokens. Renvoie son identifiant.
export async function reserveGeneration(userId: string, model: string, tokens: number): Promise<string> {
  // Remet à 0 le solde d'un abonnement terminé avant de le dépenser.
  if ((await getAccount(userId)).balance < tokens) throw new InsufficientTokensError();
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

// Génération terminée. En cas d'échec, les tokens sont rendus (une seule fois).
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
