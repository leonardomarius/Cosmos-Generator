// Rentabilité de chaque plan, à relancer quand un prix change :
//   node scripts/economics.mjs
// Lit les plans et les modèles dans src/config/product.ts.
import { PLANS, VIDEO_MODELS } from "../src/config/product.ts";

// Hypothèses, à ajuster si besoin.
const EUR_PER_USD = 0.86;
const VAT = 0.2; // TVA française ; l'OSS applique celle du pays du client dans l'UE.
const stripeFees = (ttc) => ttc * 0.015 + 0.25 + ttc * 0.007; // carte UE + Stripe Billing
const FIXED_EUR_PER_MONTH = 20 * EUR_PER_USD + 25 * EUR_PER_USD + 20; // Vercel Pro, Supabase Pro, divers
const USAGE_RATES = [1, 0.6]; // part du quota réellement utilisée

const model = VIDEO_MODELS.kling4;
const costPerTokenEur = (model.costUsd * EUR_PER_USD) / model.tokens;
const eur = (n) => `${n.toFixed(2)} €`;

console.log(`Coût d'une vidéo ${model.label} : ${eur(model.costUsd * EUR_PER_USD)} (${model.tokens} tokens)\n`);

const rows = Object.values(PLANS).map((plan) => {
  const ht = plan.priceEur / (1 + VAT);
  const fees = stripeFees(plan.priceEur);
  const row = {
    Plan: plan.label,
    "Prix TTC": eur(plan.priceEur),
    "Prix HT": eur(ht),
    "Frais Stripe": eur(fees),
    Vidéos: plan.monthlyTokens / model.tokens,
    "TTC / vidéo": eur(plan.priceEur / (plan.monthlyTokens / model.tokens)),
  };
  for (const rate of USAGE_RATES) {
    const margin = ht - fees - plan.monthlyTokens * rate * costPerTokenEur;
    row[`Marge à ${rate * 100} %`] = `${eur(margin)} (${Math.round((100 * margin) / ht)} %)`;
  }
  return row;
});
console.table(rows);

console.log(`\nFrais fixes estimés : ${eur(FIXED_EUR_PER_MONTH)} / mois`);
for (const plan of Object.values(PLANS)) {
  const margin = plan.priceEur / (1 + VAT) - stripeFees(plan.priceEur) - plan.monthlyTokens * costPerTokenEur;
  console.log(`  rentable dès ${Math.ceil(FIXED_EUR_PER_MONTH / margin)} abonnés ${plan.label} (quota utilisé à 100 %)`);
}
