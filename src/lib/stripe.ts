// Abonnements Stripe, uniquement côté serveur : STRIPE_SECRET_KEY ne doit
// jamais arriver dans le navigateur. Stripe reste la source de vérité ; la
// table "subscriptions" en est une copie, mise à jour par le webhook.
import Stripe from "stripe";
import type { User } from "@supabase/supabase-js";
import { PLANS, type PlanId } from "@/config/product";
import { adminClient } from "@/lib/supabase";

let client: Stripe | null = null;

export function stripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY manquant dans .env.local");
  client ??= new Stripe(key);
  return client;
}

export function priceIdFor(plan: PlanId): string {
  const env = PLANS[plan].stripePriceEnv;
  const priceId = process.env[env];
  if (!priceId) throw new Error(`${env} manquant dans .env.local`);
  return priceId;
}

function planForPrice(priceId: string): PlanId | null {
  const plans = Object.keys(PLANS) as PlanId[];
  return plans.find((plan) => process.env[PLANS[plan].stripePriceEnv] === priceId) ?? null;
}

// Client Stripe de l'utilisateur, créé au premier achat. La clé d'idempotence
// évite deux clients Stripe si l'utilisateur clique deux fois.
export async function customerIdFor(user: User): Promise<string> {
  const db = adminClient();
  const existing = await db.from("subscriptions").select("stripe_customer_id").eq("user_id", user.id).maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data) return existing.data.stripe_customer_id;

  const customer = await stripe().customers.create(
    { email: user.email, metadata: { user_id: user.id } },
    { idempotencyKey: `customer/${user.id}` },
  );
  const { error } = await db
    .from("subscriptions")
    .upsert({ user_id: user.id, stripe_customer_id: customer.id }, { onConflict: "user_id", ignoreDuplicates: true });
  if (error) throw error;
  return customer.id;
}

export type SyncedSubscription = {
  userId: string;
  plan: PlanId | null;
  active: boolean;
  periodStart: number;
  periodEnd: number;
};

// Recopie l'état actuel de l'abonnement Stripe dans Supabase. On relit
// toujours l'abonnement chez Stripe plutôt que de croire l'évènement : les
// webhooks peuvent arriver dans le désordre.
// Renvoie null si l'abonnement n'est pas (ou plus) celui de l'utilisateur.
export async function syncSubscription(subscriptionId: string): Promise<SyncedSubscription | null> {
  const subscription = await stripe().subscriptions.retrieve(subscriptionId);
  const userId = subscription.metadata.user_id;
  if (!userId) {
    console.error(`Abonnement Stripe ${subscriptionId} sans user_id`);
    return null;
  }
  const item = subscription.items.data[0];
  const plan = item ? planForPrice(item.price.id) : null;
  const active = ["active", "trialing", "past_due"].includes(subscription.status);

  const db = adminClient();
  const current = await db.from("subscriptions").select("stripe_subscription_id").eq("user_id", userId).maybeSingle();
  if (current.error) throw current.error;
  // Un vieil abonnement terminé ne doit pas écraser le nouveau.
  const other = current.data?.stripe_subscription_id;
  if (other && other !== subscription.id && !active) return null;

  const { error } = await db.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_customer_id: typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id,
      stripe_subscription_id: subscription.id,
      plan,
      status: subscription.status,
      current_period_end: item ? new Date(item.current_period_end * 1000).toISOString() : null,
      cancel_at_period_end: subscription.cancel_at_period_end || subscription.cancel_at !== null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (error) throw error;
  return {
    userId,
    plan,
    active,
    periodStart: item?.current_period_start ?? 0,
    periodEnd: item?.current_period_end ?? 0,
  };
}
