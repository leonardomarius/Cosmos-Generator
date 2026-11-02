// Rentabilité de chaque plan, à relancer quand un prix change :
//   node scripts/economics.mjs
// Lit les plans, les modèles et la règle de prix dans src/config/product.ts.
import { MODELS, PLANS, PRICE_STEP_TOKENS, TOKEN_USD, VIDEO_DURATIONS, costUsd, tokensFor } from "../src/config/product.ts";

// Hypothèses, à ajuster si besoin.
const EUR_PER_USD = 0.86;
const VAT = 0.2; // TVA française ; l'OSS applique celle du pays du client dans l'UE.
const paymentFees = (ttc) => ttc * 0.018 + 0.25; // carte UE chez Mollie (tarif standard, à vérifier)
const FIXED_EUR_PER_MONTH = 20 * EUR_PER_USD + 25 * EUR_PER_USD + 20; // Vercel Pro, Supabase Pro, divers
const USAGE_RATES = [0.25, 0.5, 0.75, 1]; // part du quota réellement utilisée

const eur = (n) => `${n.toFixed(2)} €`;
const usd = (n) => `${n.toFixed(2)} $`;

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

// Bénéfice par abonné, au pire cas : chaque token utilisé coûte TOKEN_USD.
const costPerTokenEur = TOKEN_USD * EUR_PER_USD;
const rows = Object.values(PLANS).map((plan) => {
  const ht = plan.priceEur / (1 + VAT);
  const fees = paymentFees(plan.priceEur);
  const row = {
    Plan: plan.label,
    "Prix TTC": eur(plan.priceEur),
    "Prix HT": eur(ht),
    "Frais Mollie": eur(fees),
  };
  for (const rate of USAGE_RATES) {
    const margin = ht - fees - plan.monthlyTokens * rate * costPerTokenEur;
    row[`Bénéfice à ${rate * 100} %`] = `${eur(margin)} (${Math.round((100 * margin) / ht)} %)`;
  }
  return row;
});
console.log("\nBénéfice mensuel par abonné (pire cas : chaque token au coût maximal) :");
console.table(rows);

console.log(`\nFrais fixes estimés : ${eur(FIXED_EUR_PER_MONTH)} / mois`);
for (const plan of Object.values(PLANS)) {
  const margin = plan.priceEur / (1 + VAT) - paymentFees(plan.priceEur) - plan.monthlyTokens * costPerTokenEur;
  console.log(`  rentable dès ${Math.ceil(FIXED_EUR_PER_MONTH / margin)} abonnés ${plan.label} (quota utilisé à 100 %)`);
}
