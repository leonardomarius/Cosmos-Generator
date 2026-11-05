// Achat à l'unité d'un effet saisonnier, sans abonnement ni tokens. Le paiement
// ouvre le droit à une vidéo ; aucun token n'est crédité, sinon ils serviraient
// aussi aux autres services, moins cher que les packs.
// - Paiement confirmé : une ligne dans token_ledger, de 0 token, dont la
//   référence "video:<effet>:<paiement>" rend le webhook rejouable sans effet.
// - Commande : une ligne dans generations, à 0 token, avec cette même référence
//   dans fal_request_id. La colonne est unique : un achat ne sert qu'une fois,
//   même avec deux commandes simultanées.
// - Rendu échoué ou interrompu : la référence est libérée à la lecture suivante,
//   et l'achat reste valable.
import { adminClient } from "@/lib/supabase";
import { AccountBlockedError, isAccountBlocked } from "@/lib/tokens";

// Au-delà de la limite de la route (maxDuration), un rendu encore "starting" a
// été interrompu par la plateforme.
const INTERRUPTED_AFTER_MS = 10 * 60 * 1000;

const reference = (effect: string, paymentId: string) => `video:${effect}:${paymentId}`;
const referencePattern = (effect: string) => `video:${effect}:%`;

// Paiement confirmé, appelé par le webhook Mollie.
export async function recordVideoPurchase(userId: string, effect: string, paymentId: string) {
  const db = adminClient();
  const { data: balances, error: readError } = await db
    .from("token_balances")
    .select("balance, purchased_balance")
    .eq("user_id", userId)
    .maybeSingle();
  if (readError) throw readError;
  const { error } = await db.from("token_ledger").upsert(
    {
      user_id: userId,
      delta: 0,
      reason: "purchase",
      ref: reference(effect, paymentId),
      balance_after: (balances?.balance ?? 0) + (balances?.purchased_balance ?? 0),
    },
    { onConflict: "ref", ignoreDuplicates: true },
  );
  if (error) throw error;
}

type PurchaseState = { free: string[]; released: string[] };

// Achats encore disponibles, et commandes échouées ou interrompues à libérer.
async function readPurchases(userId: string, effect: string): Promise<PurchaseState> {
  const db = adminClient();
  const [paid, orders] = await Promise.all([
    db.from("token_ledger").select("ref").eq("user_id", userId).like("ref", referencePattern(effect)),
    db.from("generations").select("id, status, fal_request_id, created_at").eq("user_id", userId).like("fal_request_id", referencePattern(effect)),
  ]);
  if (paid.error) throw paid.error;
  if (orders.error) throw orders.error;

  const taken = new Set<string>();
  const released: string[] = [];
  for (const order of orders.data) {
    const running = order.status === "starting" && Date.now() - Date.parse(order.created_at) < INTERRUPTED_AFTER_MS;
    if (order.status === "done" || running) taken.add(order.fal_request_id!);
    else released.push(order.id);
  }
  return { free: paid.data.map((row) => row.ref).filter((ref) => !taken.has(ref)), released };
}

// Nombre de vidéos payées et pas encore créées.
export async function availableVideoPurchases(userId: string, effect: string): Promise<number> {
  return (await readPurchases(userId, effect)).free.length;
}

// Réserve un achat pour une commande. Renvoie l'identifiant de la génération,
// ou null si le client n'a aucun achat disponible.
export async function claimVideoPurchase(userId: string, effect: string): Promise<string | null> {
  if (await isAccountBlocked(userId)) throw new AccountBlockedError();
  const db = adminClient();
  const { free, released } = await readPurchases(userId, effect);
  if (released.length > 0) {
    const { error } = await db.from("generations").update({ status: "failed", fal_request_id: null }).in("id", released);
    if (error) throw error;
  }
  for (const ref of free) {
    const { data, error } = await db
      .from("generations")
      .insert({ user_id: userId, model: effect, tokens: 0, fal_request_id: ref })
      .select("id")
      .single();
    if (!error) return data.id;
    // Déjà prise par une commande simultanée : on essaie l'achat suivant.
    if (error.code !== "23505") throw error;
  }
  return null;
}
