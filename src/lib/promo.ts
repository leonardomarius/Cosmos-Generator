// Offre de lancement, côté serveur : fenêtre de dates, interrupteur, plafond
// du jour, et cadeau de bienvenue. La garantie « un cadeau par compte » est
// en base (claim_welcome_bonus, migration
// 20261111000000_welcome_promo.sql) : ce fichier ne fait que l'appeler.
import type { User } from "@supabase/supabase-js";
import { PROMO, WELCOME_TOKENS, type WelcomeOffer, type WelcomeStatus } from "@/config/promo";
import { parisDay, parseParisDate } from "@/lib/paris-time";
import { isDisposableEmail } from "@/lib/request-guard";
import { adminClient } from "@/lib/supabase";
import { isAccountBlocked } from "@/lib/tokens";

export type PromoWindow = { start: Date; end: Date };

// Fenêtre de l'offre : du début du premier jour à la fin du dernier, à Paris.
// null si les dates sont invalides : l'offre reste alors fermée.
export function promoWindow(): PromoWindow | null {
  const start = parseParisDate(process.env.PROMO_START?.trim() || PROMO.defaultStart);
  const end = parseParisDate(process.env.PROMO_END?.trim() || PROMO.defaultEnd, true);
  if (!start || !end || end <= start) {
    console.error("PROMO_START / PROMO_END invalides : offre fermée.");
    return null;
  }
  return { start, end };
}

// Plafond par défaut (FREE_DAILY_BUDGET), remplacé par celui de /admin s'il est réglé.
export function envDailyBudget(): number {
  const raw = process.env.FREE_DAILY_BUDGET?.trim();
  const value = Number(raw);
  return raw && Number.isInteger(value) && value >= 0 ? value : PROMO.defaultDailyBudget;
}

export type PromoState = {
  window: PromoWindow | null;
  // FREE_PROMO_ENABLED=false coupe tout, quel que soit le réglage de /admin.
  envEnabled: boolean;
  // Interrupteur de /admin.
  adminEnabled: boolean;
  inWindow: boolean;
  active: boolean;
  // Jour en cours à Paris.
  day: string;
  dailyBudget: number;
  // null : le plafond vient de FREE_DAILY_BUDGET.
  adminDailyBudget: number | null;
  grantedToday: number;
};

export async function readPromoState(now: Date = new Date()): Promise<PromoState> {
  const window = promoWindow();
  const day = parisDay(now);
  const db = adminClient();
  const [settings, usage] = await Promise.all([
    db.from("promo_settings").select("enabled, daily_budget").eq("id", 1).maybeSingle(),
    db.from("welcome_daily_usage").select("granted").eq("day", day).maybeSingle(),
  ]);
  if (settings.error) throw settings.error;
  if (usage.error) throw usage.error;
  const envEnabled = process.env.FREE_PROMO_ENABLED?.trim().toLowerCase() !== "false";
  const adminEnabled = settings.data?.enabled ?? true;
  const inWindow = window !== null && now >= window.start && now < window.end;
  const adminDailyBudget = settings.data?.daily_budget ?? null;
  return {
    window,
    envEnabled,
    adminEnabled,
    inWindow,
    active: inWindow && envEnabled && adminEnabled,
    day,
    dailyBudget: adminDailyBudget ?? envDailyBudget(),
    adminDailyBudget,
    grantedToday: usage.data?.granted ?? 0,
  };
}

// Compte créé pendant l'offre (les comptes plus anciens n'y ont pas droit).
function createdDuring(user: User, window: PromoWindow): boolean {
  const created = Date.parse(user.created_at);
  return created >= window.start.getTime() && created < window.end.getTime();
}

// Date du cadeau déjà reçu, ou null.
async function claimedAt(userId: string): Promise<number | null> {
  const { data, error } = await adminClient().from("welcome_bonuses").select("created_at").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return data ? Date.parse(data.created_at) : null;
}

// Après la récupération, la carte confirme le cadeau pendant ce délai.
const CLAIMED_NOTICE_MS = 15 * 60 * 1000;

// État du cadeau pour ce visiteur, affiché sur l'accueil. null : rien à
// montrer (hors offre, compte ancien, cadeau reçu depuis longtemps, compte
// bloqué, ou base indisponible).
export async function welcomeOfferFor(user: User | null): Promise<WelcomeOffer | null> {
  try {
    const state = await readPromoState();
    if (!state.active || !state.window) return null;
    const endsAt = state.window.end.toISOString();
    if (!user?.email) return { status: "signed_out", endsAt };
    if (!createdDuring(user, state.window)) return null;
    const [claimed, blocked] = await Promise.all([claimedAt(user.id), isAccountBlocked(user.id)]);
    if (blocked) return null;
    if (claimed !== null) return Date.now() - claimed < CLAIMED_NOTICE_MS ? { status: "claimed", endsAt } : null;
    let status: WelcomeStatus = "available";
    if (!user.email_confirmed_at) status = "unverified";
    else if (isDisposableEmail(user.email)) status = "disposable";
    else if (state.grantedToday >= state.dailyBudget) status = "sold_out";
    return { status, endsAt };
  } catch (err) {
    console.error("État de l'offre de bienvenue indisponible", err);
    return null;
  }
}

// Nouveau compte qui a un cadeau à récupérer : après la connexion, il est
// renvoyé sur l'accueil, où la carte du cadeau l'attend.
export async function shouldGreet(user: User | null): Promise<boolean> {
  if (!user) return false;
  try {
    const state = await readPromoState();
    return state.active && state.window !== null && createdDuring(user, state.window) && (await claimedAt(user.id)) === null;
  } catch (err) {
    console.error(err);
    return false;
  }
}

export const WELCOME_MESSAGES = {
  inactive: "L'offre de bienvenue n'est pas disponible en ce moment.",
  not_new: "L'offre de bienvenue est réservée aux comptes créés pendant l'offre.",
  unverified: "Confirme ton adresse email pour récupérer tes tokens offerts.",
  disposable: "L'offre de bienvenue n'est pas disponible avec une adresse email jetable.",
  already_claimed: "Tes tokens de bienvenue sont déjà sur ton compte.",
  sold_out: "Tous les cadeaux de bienvenue du jour sont partis : reviens demain pour récupérer les tiens.",
  blocked: "Ce compte ne peut pas recevoir l'offre de bienvenue.",
} as const;

export class WelcomeError extends Error {
  constructor(
    readonly code: keyof typeof WELCOME_MESSAGES,
    readonly status: number,
  ) {
    super(WELCOME_MESSAGES[code]);
  }
}

// Accorde le cadeau de bienvenue. Renvoie le nouveau solde total.
export async function claimWelcomeBonus(user: User): Promise<number> {
  const state = await readPromoState();
  if (!state.active || !state.window) throw new WelcomeError("inactive", 403);
  if (!createdDuring(user, state.window)) throw new WelcomeError("not_new", 403);
  if (!user.email_confirmed_at) throw new WelcomeError("unverified", 403);
  if (isDisposableEmail(user.email ?? "")) throw new WelcomeError("disposable", 403);

  const { data, error } = await adminClient().rpc("claim_welcome_bonus", {
    p_user: user.id,
    p_tokens: WELCOME_TOKENS,
    p_day: state.day,
    p_budget: state.dailyBudget,
  });
  if (error) {
    if (error.message.includes("welcome_already_claimed")) throw new WelcomeError("already_claimed", 409);
    if (error.message.includes("welcome_budget_reached")) throw new WelcomeError("sold_out", 429);
    if (error.message.includes("account_blocked")) throw new WelcomeError("blocked", 403);
    // Dernier rempart : clé primaire de welcome_bonuses.
    if (error.code === "23505") throw new WelcomeError("already_claimed", 409);
    throw error;
  }
  return data;
}

// Réglages de /admin. dailyBudget null : retour à FREE_DAILY_BUDGET.
export async function updatePromoSettings(patch: { enabled?: boolean; dailyBudget?: number | null }) {
  const { error } = await adminClient()
    .from("promo_settings")
    .upsert({
      id: 1,
      ...(patch.enabled !== undefined && { enabled: patch.enabled }),
      ...(patch.dailyBudget !== undefined && { daily_budget: patch.dailyBudget }),
      updated_at: new Date().toISOString(),
    });
  if (error) throw error;
}

// Chiffres de /admin : offre, sept derniers jours, file du PC.
export async function promoDashboard() {
  const db = adminClient();
  const [state, days, queuedPaid, queuedFree, running] = await Promise.all([
    readPromoState(),
    db.from("welcome_daily_usage").select("day, granted").order("day", { ascending: false }).limit(7),
    db.from("wangp_jobs").select("id", { count: "exact", head: true }).eq("status", "queued").eq("priority", 0),
    db.from("wangp_jobs").select("id", { count: "exact", head: true }).eq("status", "queued").gt("priority", 0),
    db.from("wangp_jobs").select("id", { count: "exact", head: true }).eq("status", "running"),
  ]);
  for (const result of [days, queuedPaid, queuedFree, running]) if (result.error) throw result.error;
  return {
    state,
    days: days.data ?? [],
    queue: { paid: queuedPaid.count ?? 0, free: queuedFree.count ?? 0, running: running.count ?? 0 },
  };
}
