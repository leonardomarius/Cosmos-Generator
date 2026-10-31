// Toute la configuration "métier" du produit est centralisée ici.
// Rien de secret : les clés API vont dans le fichier .env.local.
// Phase de test : aucun prix n'est affiché ni demandé.

export const PRODUCT = {
  siteName: "Cosmos Generator",
  tagline: "Fais apparaître un proche en star, filmé par ses fans",
  videoDurationSeconds: 10,
  retentionDays: 7,
  // Vidéo de référence dans laquelle la personne est remplacée.
  referenceVideoPath: "/exemple.mp4",
} as const;

// La génération se fait en un seul appel à fal.ai : la vidéo de référence,
// les photos du client et un prompt fixe partent ensemble au modèle vidéo,
// qui remplace la star par la personne des photos.
// Un seul modèle : Kling 4.0.

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

// Photos du client, dans l'ordre demandé par le formulaire :
// 1. la personne en pied, de face ;
// 2. facultative : un gros plan du visage.
export const VIDEO_MODELS = {
  kling4: {
    label: "Kling 4.0",
    falModel: "kling/v4/video-to-video/edit",
    // Un "élément" Kling : la vue de face en pied (photo 1), et le gros plan
    // du visage (photo 2) en référence, ou la photo 1 à défaut.
    prompt: REPLACE_PROMPT,
    // 1080p pour le visage : 0,141 $/s, facturé sur l'entrée + la sortie,
    // soit ≈ 2,82 $ pour la vidéo de référence de 10 s.
    resolution: "1080p",
    costUsd: 2.82,
    // Prix pour le client. Règle : 1 token ≈ 0,30 $ de coût fal.
    tokens: 10,
  },
} as const;

export type VideoModelId = keyof typeof VIDEO_MODELS;

export function isVideoModelId(value: unknown): value is VideoModelId {
  return typeof value === "string" && Object.hasOwn(VIDEO_MODELS, value);
}

// Abonnements mensuels. Le solde est remis au quota à chaque paiement reçu :
// les tokens non utilisés ne sont pas reportés.
// "priceEur" est le montant TTC prélevé chaque mois par Mollie.
// Marge visée : au moins 50 % du HT même si tout le quota est utilisé
// (calcul dans scripts/economics.mjs).
export const PLANS = {
  essentiel: {
    label: "Essentiel",
    priceEur: 9.99,
    monthlyTokens: 10,
  },
  star: {
    label: "Star",
    priceEur: 24.99,
    monthlyTokens: 30,
  },
  producteur: {
    label: "Producteur",
    priceEur: 49.99,
    monthlyTokens: 70,
  },
} as const;

export type PlanId = keyof typeof PLANS;

// Email de contact public (SUPPORT_EMAIL), jamais celui des administrateurs.
export function supportEmail(): string {
  return process.env.SUPPORT_EMAIL || "[Email de contact]";
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
