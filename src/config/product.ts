// Toute la configuration "métier" du produit est centralisée ici.
// Rien de secret : les clés API vont dans le fichier .env.local.

export const PRODUCT = {
  siteName: "Cosmos Generator",
  tagline: "Deviens la star d'une vidéo de parkour en 1 photo",
  priceCents: 499,
  currency: "eur",
  videoDurationSeconds: 8,
  retentionDays: 7,
  // Vidéo de référence dans laquelle la personne est remplacée.
  referenceVideoPath: "/exemple.mp4",
} as const;

export const UPLOAD_RULES = {
  acceptedTypes: ["image/jpeg", "image/png", "image/webp"],
  maxSizeBytes: 10 * 1024 * 1024, // 10 Mo
  minDimensionPx: 512,
} as const;

export function formatPrice(cents: number = PRODUCT.priceCents) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: PRODUCT.currency.toUpperCase(),
  }).format(cents / 100);
}
