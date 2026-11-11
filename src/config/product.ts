// Toute la configuration "métier" du produit est centralisée ici.
// Rien de secret : les clés API vont dans le fichier .env.local.

export const PRODUCT = {
  siteName: "Cosmos Generator",
  tagline: "Fais apparaître un proche en star, filmé par ses fans",
  videoDurationSeconds: 10,
  retentionDays: 7,
  // Vidéo de référence dans laquelle la personne est remplacée.
  referenceVideoPath: "/exemple.mp4",
} as const;

// Cinq services, tous rendus sur le PC par WanGP (presets du planificateur ;
// les effets saisonniers, sans IA à chaque commande, sont dans
// src/config/effects.ts) : image, prompt (vidéo par prompt), promptImages
// (vidéo par prompt et images), kling4 (vidéo de star : identifiant gardé, il
// est enregistré dans les générations déjà lancées) et statue.

// Prix en tokens : 1 token couvre au plus TOKEN_USD de coût de référence
// (ancien tarif fal, gardé comme base des prix ; la statue, la plus coûteuse,
// est à ce plafond), et chaque prix est arrondi aux 5 tokens
// supérieurs. Les autres prix sont calés sur l'Essentiel : 2 vidéos par mois.
// Depuis le 2026-11-11, une vidéo de 10 s coûte autant qu'une vidéo preset
// (star, statue) : 1 300 tokens, le montant du cadeau de bienvenue
// (src/config/promo.ts). Les autres durées et l'image n'ont pas changé.
// Marges par offre et par taux d'utilisation : scripts/economics.mjs.
export const TOKEN_USD = 0.0026;
export const PRICE_STEP_TOKENS = 5;

// Coûts de référence : anciens tarifs fal (novembre 2026, 720p), qui servent
// toujours de base aux prix en tokens et à scripts/economics.mjs.
export const MODELS = {
  image: {
    label: "Image",
    kind: "image",
    usdPerImage: 0.04,
    tokens: 60,
  },
  prompt: {
    label: "Vidéo",
    kind: "video",
    usdPerSecond: 0.157,
  },
  promptImages: {
    label: "Vidéo avec images",
    kind: "video",
    usdPerSecond: 0.157,
  },
  // Photos du client, dans l'ordre demandé par le formulaire :
  // 1. la personne en pied, de face ;
  // 2. facultative : un gros plan du visage.
  kling4: {
    label: "Vidéo de référence",
    kind: "video",
    // 0,094 $/s facturé sur l'entrée + la sortie : 0,188 $ par seconde produite.
    usdPerSecond: 0.188,
    // Vidéo de star (preset WanGP rendu sur le PC) : 1300 tokens depuis le 2026-11-10.
    tokens: 1300,
  },
  // Photos du client : 1. le visage de face ; 2. le visage de profil.
  statue: {
    label: "Vidéo de statue",
    kind: "video",
    // Même tarif que la vidéo de référence ; la vidéo du sculpteur dure 18,93 s.
    usdPerSecond: 0.188,
    seconds: 19,
    // Même prix que la vidéo de star et la vidéo de 10 s depuis le 2026-11-11.
    tokens: 1300,
  },
} as const;

export type ModelId = keyof typeof MODELS;

export function isModelId(value: unknown): value is ModelId {
  return typeof value === "string" && Object.hasOwn(MODELS, value);
}

// Durées proposées pour les vidéos par prompt. La vidéo de référence garde
// la durée de la vidéo d'origine.
export const VIDEO_DURATIONS = [5, 10, 15, 20] as const;
export type VideoDuration = (typeof VIDEO_DURATIONS)[number];

export function isVideoDuration(value: unknown): value is VideoDuration {
  return VIDEO_DURATIONS.includes(value as VideoDuration);
}

export const ASPECT_RATIOS = ["9:16", "16:9", "1:1"] as const;
export type AspectRatio = (typeof ASPECT_RATIOS)[number];

export function isAspectRatio(value: unknown): value is AspectRatio {
  return ASPECT_RATIOS.includes(value as AspectRatio);
}

// Coût de référence d'une génération, en dollars. "seconds" : durée de la vidéo par
// prompt (ignorée pour une image et pour les vidéos de référence).
export function costUsd(model: ModelId, seconds?: VideoDuration): number {
  const spec = MODELS[model];
  if (spec.kind === "image") return spec.usdPerImage;
  const duration =
    model === "statue"
      ? MODELS.statue.seconds
      : model === "kling4"
        ? PRODUCT.videoDurationSeconds
        : (seconds ?? VIDEO_DURATIONS[0]);
  return spec.usdPerSecond * duration;
}

const PROMPT_VIDEO_TOKENS: Record<VideoDuration, number> = { 5: 695, 10: 1300, 15: 2070, 20: 2750 };

// Prix pour le client, en tokens : fixé ci-dessus ou dans MODELS, sinon déduit
// du coût de référence (le petit epsilon évite qu'une erreur d'arrondi des flottants
// ajoute 5 tokens).
export function tokensFor(model: ModelId, seconds?: VideoDuration): number {
  if (model === "prompt" || model === "promptImages") return PROMPT_VIDEO_TOKENS[seconds ?? VIDEO_DURATIONS[0]];
  const spec = MODELS[model];
  if ("tokens" in spec) return spec.tokens;
  const steps = Math.ceil(costUsd(model, seconds) / (TOKEN_USD * PRICE_STEP_TOKENS) - 1e-9);
  return Math.max(1, steps) * PRICE_STEP_TOKENS;
}

// "1 000 tokens", avec l'espace des milliers à la française.
export function formatTokens(n: number): string {
  return `${n.toLocaleString("fr-FR")} token${n > 1 ? "s" : ""}`;
}

// Abonnements, au mois ou à l'année. Le solde d'abonnement est remis au quota
// chaque mois (y compris sur l'annuel, payé en une fois) : les tokens non
// utilisés ne sont pas reportés.
// "priceEur" et "annualPriceEur" sont les montants TTC prélevés par Mollie.
// L'Essentiel couvre 2 vidéos par mois, au choix : 10 s ou vidéos de référence,
// statue comprise (2 × 1 300 tokens). Marges : scripts/economics.mjs.
export const PLANS = {
  essentiel: {
    label: "Essentiel",
    priceEur: 12.99,
    annualPriceEur: 129.9,
    monthlyTokens: 2750,
  },
  star: {
    label: "Star",
    priceEur: 34.99,
    annualPriceEur: 349.9,
    monthlyTokens: 7500,
  },
  producteur: {
    label: "Réalisateur",
    priceEur: 69.99,
    annualPriceEur: 699.9,
    monthlyTokens: 16000,
  },
} as const;

export type PlanId = keyof typeof PLANS;

// Mois offerts sur l'annuel, vérifiés par scripts/economics.mjs.
export const ANNUAL_FREE_MONTHS = 2;

export const BILLING_INTERVALS = ["month", "year"] as const;
export type BillingInterval = (typeof BILLING_INTERVALS)[number];

export function isBillingInterval(value: unknown): value is BillingInterval {
  return BILLING_INTERVALS.includes(value as BillingInterval);
}

export function planPriceEur(plan: PlanId, interval: BillingInterval): number {
  return interval === "year" ? PLANS[plan].annualPriceEur : PLANS[plan].priceEur;
}

// Prix annuel ramené au mois, arrondi au centime (129,90 € : 10,83 €).
export function annualPricePerMonthEur(plan: PlanId): number {
  return Math.round(Math.round(PLANS[plan].annualPriceEur * 100) / 12) / 100;
}

// Packs en achat unique : jamais expirés, toujours plus chers au token que
// n'importe quel abonnement (vérifié par scripts/economics.mjs).
// "plan" : l'abonnement comparé dans la boutique, qui donne plus de tokens.
export const TOKEN_PACKS = {
  pack1000: { tokens: 1000, priceEur: 14.99, plan: "essentiel" },
  pack3000: { tokens: 3000, priceEur: 37.99, plan: "star" },
  pack7000: { tokens: 7000, priceEur: 74.99, plan: "producteur" },
} as const satisfies Record<string, { tokens: number; priceEur: number; plan: PlanId }>;

export type PackId = keyof typeof TOKEN_PACKS;

export function isPackId(value: unknown): value is PackId {
  return typeof value === "string" && Object.hasOwn(TOKEN_PACKS, value);
}

// Ce que le client économise chaque mois avec l'abonnement équivalent au pack.
export function packMonthlySavingEur(pack: PackId): number {
  const { priceEur, plan } = TOKEN_PACKS[pack];
  return Math.round((priceEur - PLANS[plan].priceEur) * 100) / 100;
}

// Email de contact public (SUPPORT_EMAIL), jamais celui des administrateurs.
export function supportEmail(): string {
  return process.env.SUPPORT_EMAIL || "[Email de contact]";
}

// Compte bloqué après une rétrofacturation : message calme, sans accusation.
export function accountSuspendedMessage(): string {
  return `Ton compte est suspendu à la suite d'une contestation de paiement. Pour en parler, écris-nous à ${supportEmail()}.`;
}

export function isPlanId(value: unknown): value is PlanId {
  return typeof value === "string" && Object.hasOwn(PLANS, value);
}

export const GENERATION = {
  // Délai entre deux vérifications de l'avancement (côté navigateur).
  pollIntervalMs: 5000,
} as const;

// Adresse où le client reçoit sa vidéo (et l'email d'excuse si ça échoue).
export const EMAIL_RULES = {
  maxLength: 254,
  // Volontairement simple : le vrai test est la réception de l'email.
  pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

export const UPLOAD_RULES = {
  maxPhotos: 2,
  acceptedTypes: ["image/jpeg", "image/png", "image/webp"],
  maxSizeBytes: 10 * 1024 * 1024, // 10 Mo
  // Phase de test : 512 px pour accepter les photos trouvées en ligne.
  // Au-dessus de 768 px, le visage d'une photo en pied garde plus de détails.
  minDimensionPx: 512,
} as const;

// Générateur par prompt (image ou vidéo). Mêmes formats et poids que
// UPLOAD_RULES pour les images ajoutées.
export const PROMPT_RULES = {
  maxLength: 1500,
  // 4 images réduites à 1536 px restent sous la limite de 4,5 Mo par
  // requête de Vercel.
  maxImages: 4,
  maxImageSidePx: 1536,
  minDimensionPx: 300,
} as const;
