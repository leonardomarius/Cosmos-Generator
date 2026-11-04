// Rentabilité de chaque offre, à relancer quand un prix change :
//   node scripts/economics.mjs
// Lit les plans, les packs, les modèles et la règle de prix dans
// src/config/product.ts. Échoue (code de sortie 1) si une règle est rompue.
import {
  ANNUAL_FREE_MONTHS,
  MODELS,
  PLANS,
  PRICE_STEP_TOKENS,
  TOKEN_PACKS,
  TOKEN_USD,
  VIDEO_DURATIONS,
  costUsd,
  tokensFor,
} from "../src/config/product.ts";

// Hypothèses, à ajuster si besoin.
const EUR_PER_USD = 0.86;
const VAT = 0.2; // TVA française ; l'OSS applique celle du pays du client dans l'UE.
const paymentFees = (ttc) => ttc * 0.018 + 0.25; // carte UE chez Mollie (tarif standard, à vérifier)
const FIXED_EUR_PER_MONTH = 20 * EUR_PER_USD + 25 * EUR_PER_USD + 20; // Vercel Pro, Supabase Pro, divers
const USAGE_RATES = [0.25, 0.5, 0.75, 1]; // part du quota réellement utilisée
const MIN_MARGIN = 0.5; // sur le HT, quota utilisé à 100 %

const eur = (n) => `${n.toFixed(2)} €`;
const usd = (n) => `${n.toFixed(2)} $`;
const failures = [];

// Grille de prix : tokens et coût fal de chaque service (coûts donnés pour
// 100 tokens, plus lisibles qu'au token).
console.log(
  `Règle : 100 tokens couvrent au plus ${usd(TOKEN_USD * 100)} de coût fal, prix arrondi aux ${PRICE_STEP_TOKENS} tokens supérieurs.\n`,
);
const grid = [];
for (const id of Object.keys(MODELS)) {
  const durations = id === "image" || id === "kling4" ? [undefined] : VIDEO_DURATIONS;
  for (const seconds of durations) {
    grid.push({
      Service: MODELS[id].label + (seconds ? ` ${seconds} s` : ""),
      "Coût fal": usd(costUsd(id, seconds)),
      Tokens: tokensFor(id, seconds),
      "Coût pour 100 tokens": usd((costUsd(id, seconds) / tokensFor(id, seconds)) * 100),
    });
  }
}
console.table(grid);

// Pire cas : chaque token utilisé coûte TOKEN_USD.
const costPerTokenEur = TOKEN_USD * EUR_PER_USD;

// Une offre : ce que le client paie en une fois, combien de paiements (donc de
// frais Mollie) et de tokens elle représente sur la période.
function offerRow(name, priceEur, tokens) {
  const ht = priceEur / (1 + VAT);
  const fees = paymentFees(priceEur);
  const row = { Offre: name, "Prix TTC": eur(priceEur), "Prix HT": eur(ht), "Frais Mollie": eur(fees), Tokens: tokens };
  for (const rate of USAGE_RATES) {
    const margin = ht - fees - tokens * rate * costPerTokenEur;
    row[`Bénéfice à ${rate * 100} %`] = `${eur(margin)} (${Math.round((100 * margin) / ht)} %)`;
  }
  const fullMargin = (ht - fees - tokens * costPerTokenEur) / ht;
  if (fullMargin < MIN_MARGIN) {
    failures.push(`${name} : marge de ${(fullMargin * 100).toFixed(1)} % à 100 % du quota, sous l'objectif de ${MIN_MARGIN * 100} %.`);
  }
  return row;
}

console.log("\nBénéfice mensuel par abonné (pire cas : chaque token au coût maximal) :");
console.table(Object.values(PLANS).map((plan) => offerRow(`${plan.label} mensuel`, plan.priceEur, plan.monthlyTokens)));

console.log("\nBénéfice annuel par abonné (frais Mollie une fois par an, 12 mois de quota) :");
console.table(Object.values(PLANS).map((plan) => offerRow(`${plan.label} annuel`, plan.annualPriceEur, plan.monthlyTokens * 12)));

console.log("\nBénéfice par pack en achat unique :");
console.table(Object.values(TOKEN_PACKS).map((pack) => offerRow(`Pack ${pack.tokens}`, pack.priceEur, pack.tokens)));

console.log(`\nFrais fixes estimés : ${eur(FIXED_EUR_PER_MONTH)} / mois`);
for (const plan of Object.values(PLANS)) {
  const margin = plan.priceEur / (1 + VAT) - paymentFees(plan.priceEur) - plan.monthlyTokens * costPerTokenEur;
  console.log(`  rentable dès ${Math.ceil(FIXED_EUR_PER_MONTH / margin)} abonnés ${plan.label} (quota utilisé à 100 %)`);
}

// L'achat unique doit toujours coûter plus cher au token que n'importe quel
// abonnement : le pack le moins cher contre le plan mensuel le plus cher.
const perToken = (price, tokens) => (price / tokens) * 1000;
const cheapestPack = Math.min(...Object.values(TOKEN_PACKS).map((pack) => perToken(pack.priceEur, pack.tokens)));
const dearestPlan = Math.max(...Object.values(PLANS).map((plan) => perToken(plan.priceEur, plan.monthlyTokens)));
console.log(`\nPour 1 000 tokens : pack le moins cher ${eur(cheapestPack)}, plan mensuel le plus cher ${eur(dearestPlan)}.`);
if (cheapestPack <= dearestPlan) {
  failures.push(`Le pack le moins cher (${eur(cheapestPack)} les 1 000 tokens) ne coûte plus plus cher que le plan mensuel le plus cher (${eur(dearestPlan)}).`);
}

// « 2 mois offerts » doit rester vrai sur chaque plan.
for (const plan of Object.values(PLANS)) {
  const expected = plan.priceEur * (12 - ANNUAL_FREE_MONTHS);
  if (Math.abs(plan.annualPriceEur - expected) > 0.005) {
    failures.push(`${plan.label} annuel : ${eur(plan.annualPriceEur)} au lieu de ${eur(expected)} pour ${ANNUAL_FREE_MONTHS} mois offerts.`);
  }
}

if (failures.length > 0) {
  console.error("\nÉCHEC :");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log(`\nOK : marge d'au moins ${MIN_MARGIN * 100} % sur chaque offre, packs plus chers au token que tout abonnement, ${ANNUAL_FREE_MONTHS} mois offerts sur l'annuel.`);
