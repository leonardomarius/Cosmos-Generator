// Calculs de dates et de prorata, sans accès au serveur : la boutique annonce
// au client le même montant que celui prélevé par changePlan (src/lib/mollie.ts).
import { PLANS, planPriceEur, type BillingInterval, type PlanId } from "@/config/product";

export const INTERVAL_MONTHS: Record<BillingInterval, number> = { month: 1, year: 12 };
// En dessous, le prorata d'une montée de plan n'est pas facturé : le nouveau
// plan s'applique au renouvellement suivant.
const MIN_CHARGE_EUR = 1;

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

// Parts restantes au moment d'une montée de plan : le prix se paie sur le reste
// de la période (un mois ou un an), les tokens se créditent sur le reste du
// mois en cours, puisque le quota revient à chaque recharge mensuelle.
export function upgradeFractions(interval: BillingInterval, periodEnd: Date, now = new Date()) {
  const part = (from: Date, to: Date) => Math.min(Math.max((+to - +now) / (+to - +from), 0), 1);
  const priceFraction = part(addMonths(periodEnd, -INTERVAL_MONTHS[interval]), periodEnd);
  const month = interval === "year" ? annualMonth(periodEnd, now) : null;
  return { priceFraction, tokenFraction: month ? part(month.from, month.to) : priceFraction };
}

// Ce que coûte tout de suite une montée de plan sur le même intervalle, et les
// tokens qu'elle ajoute. Null si rien n'est prélevé : baisse, ou prorata trop
// faible, le nouveau plan s'applique alors au renouvellement.
export function upgradeQuote(current: PlanId, plan: PlanId, interval: BillingInterval, periodEnd: Date, now = new Date()) {
  const { priceFraction, tokenFraction } = upgradeFractions(interval, periodEnd, now);
  const amountEur = Math.round((planPriceEur(plan, interval) - planPriceEur(current, interval)) * priceFraction * 100) / 100;
  if (amountEur < MIN_CHARGE_EUR) return null;
  const tokens = Math.floor((PLANS[plan].monthlyTokens - PLANS[current].monthlyTokens) * tokenFraction);
  return { amountEur, tokens, priceFraction, tokenFraction };
}
