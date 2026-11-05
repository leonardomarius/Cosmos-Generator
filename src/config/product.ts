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

// Quatre services, chacun en un seul appel à fal.ai (les effets saisonniers,
// sans IA à chaque commande, sont dans src/config/effects.ts) :
// - image : prompt du client, avec ou sans images (Nano Banana 2.1) ;
// - prompt : vidéo à partir du prompt seul (Kling 4.0) ;
// - promptImages : vidéo à partir du prompt et d'images (Kling 4.0) ;
// - kling4 : vidéo de référence, où la star est remplacée par la personne
//   des photos, avec un prompt fixe (Kling 4.0). Son identifiant reste
//   "kling4" : il est enregistré dans les générations déjà lancées.

// Star de la vidéo de référence, telle qu'on la voit à l'écran : la nommer
// évite que le modèle remplace un garde du corps ou un fan. À mettre à jour
// si la vidéo change.
const REFERENCE_STAR =
  "the young man with brown wavy hair and a thick mustache, wearing a black jacket over a white t-shirt, dark trousers and white sneakers, who steps out of the black SUV and walks between the bodyguards to the restaurant";

// Prompt fixe, identique pour chaque client. "@Video1" et "@Element1" sont
// la façon dont Kling désigne la vidéo et la personne des photos.
// Le proche remplace la star entièrement, visage et corps : rien du visage,
// de la moustache ou des cheveux d'origine ne doit rester.
// La tenue de star (veste noire, t-shirt blanc) est gardée : elle fait l'effet
// "célébrité" et convient à tout le monde, quelle que soit la photo envoyée.
// Visage : on demande un visage net et sans déformation, surtout quand la
// star passe face à la caméra, sans toucher au mouvement.
const REPLACE_PROMPT = [
  `Replace ${REFERENCE_STAR} in @Video1 with @Element1, the whole person from head to toe.`,
  "Keep every movement, the timing, the handheld camera motion, the bodyguards, the crowd of fans, the background and the lighting exactly as in the original video.",
  "The new person must look exactly like the reference photos in every frame: same face, hairstyle, hair color, skin tone, facial hair, height, body build and proportions. Do not keep the face, mustache or hair of the original man unless the reference photos have them.",
  "Keep the same outfit: black jacket, white t-shirt, dark trousers and white sneakers.",
  "Keep the face clearly visible and recognizable, especially when the person walks toward the camera and smiles.",
  "Photorealistic, natural skin texture, sharp and detailed face with no warping.",
].join(" ");

// Prix en tokens : 1 token couvre au plus TOKEN_USD de coût fal, et chaque
// prix est arrondi aux 5 tokens supérieurs (605 tokens pour une vidéo de
// 10 s). 100 tokens du plan le moins cher au token (Réalisateur) rapportent
// ≈ 0,58 € net de TVA et de frais : la marge reste d'environ 60 % au moins,
// même si tout le quota est utilisé (calcul dans scripts/economics.mjs).
export const TOKEN_USD = 0.0026;
export const PRICE_STEP_TOKENS = 5;

// Résolution de toutes les vidéos générées. Les tarifs ci-dessous sont ceux
// du 720p : le 1080p coûte 50 % de plus (0,235 $/s, 0,141 $/s en
// video-to-video) et ferait passer les marges sous l'objectif.
export const VIDEO_RESOLUTION = "720p";

// Tarifs fal (pages des modèles, novembre 2026), en 720p pour les vidéos.
export const MODELS = {
  image: {
    label: "Image",
    kind: "image",
    falModel: "fal-ai/nano-banana-2.1",
    // Même modèle quand le client ajoute des images.
    falEditModel: "fal-ai/nano-banana-2.1/edit",
    // fal n'affiche pas son prix : 0,0336 $ chez Google en 1K, plus la marge
    // habituelle de fal. À confirmer sur la première facture.
    usdPerImage: 0.04,
    // Prix fixé au-dessus de la règle (20 tokens).
    tokens: 25,
  },
  prompt: {
    label: "Vidéo",
    kind: "video",
    falModel: "kling/v4/text-to-video",
    usdPerSecond: 0.157,
  },
  promptImages: {
    label: "Vidéo avec images",
    kind: "video",
    falModel: "kling/v4/reference-to-video",
    usdPerSecond: 0.157,
  },
  // Photos du client, dans l'ordre demandé par le formulaire :
  // 1. la personne en pied, de face ;
  // 2. facultative : un gros plan du visage.
  kling4: {
    label: "Vidéo de référence",
    kind: "video",
    falModel: "kling/v4/video-to-video/edit",
    // Un "élément" Kling : la vue de face en pied (photo 1), et le gros plan
    // du visage (photo 2) en référence, ou la photo 1 à défaut.
    prompt: REPLACE_PROMPT,
    // 0,094 $/s facturé sur l'entrée + la sortie : 0,188 $ par seconde produite.
    usdPerSecond: 0.188,
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

// Coût fal d'une génération, en dollars. "seconds" : durée de la vidéo par
// prompt (ignorée pour une image et pour la vidéo de référence).
export function costUsd(model: ModelId, seconds?: VideoDuration): number {
  const spec = MODELS[model];
  if (spec.kind === "image") return spec.usdPerImage;
  const duration = model === "kling4" ? PRODUCT.videoDurationSeconds : (seconds ?? VIDEO_DURATIONS[0]);
  return spec.usdPerSecond * duration;
}

// Prix pour le client, en tokens : fixé dans MODELS s'il y est, sinon déduit
// du coût fal (le petit epsilon évite qu'une erreur d'arrondi des flottants
// ajoute 5 tokens).
export function tokensFor(model: ModelId, seconds?: VideoDuration): number {
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
// Marge visée : au moins 50 % du HT même si tout le quota est utilisé
// (calcul dans scripts/economics.mjs).
export const PLANS = {
  essentiel: {
    label: "Essentiel",
    priceEur: 9.99,
    annualPriceEur: 99.9,
    monthlyTokens: 1000,
  },
  star: {
    label: "Star",
    priceEur: 24.99,
    annualPriceEur: 249.9,
    monthlyTokens: 3000,
  },
  producteur: {
    label: "Réalisateur",
    priceEur: 49.99,
    annualPriceEur: 499.9,
    monthlyTokens: 7000,
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

// Prix annuel ramené au mois, arrondi au centime (99,90 € : 8,33 €).
export function annualPricePerMonthEur(plan: PlanId): number {
  return Math.round(Math.round(PLANS[plan].annualPriceEur * 100) / 12) / 100;
}

// Packs en achat unique : jamais expirés, toujours plus chers au token que
// n'importe quel abonnement (vérifié par scripts/economics.mjs).
// "plan" : l'abonnement au même nombre de tokens, pour la comparaison affichée.
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
  // Durée de validité du jeton placé dans l'URL du webhook fal : file
  // d'attente + génération + renvois du webhook par fal (1 h maximum).
  webhookTokenMaxAgeHours: 24,
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
