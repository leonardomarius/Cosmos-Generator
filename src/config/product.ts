// Toute la configuration "métier" du produit est centralisée ici.
// Rien de secret : les clés API vont dans le fichier .env.local.
// Phase de test : aucun prix n'est affiché ni demandé.

export const PRODUCT = {
  siteName: "Cosmos Generator",
  tagline: "Fais apparaître un proche dans une vidéo de parkour",
  videoDurationSeconds: 8,
  retentionDays: 7,
  // Vidéo de référence dans laquelle la personne est remplacée.
  referenceVideoPath: "/exemple.mp4",
} as const;

// La génération se fait en deux étapes, sur fal.ai :
// 1. Personnage : Nano Banana crée une photo du proche dans la pose et la
//    tenue de la scène, à partir de ses photos et d'une image de la vidéo.
// 2. Vidéo : Wan 2.2 Animate (mode "replace") remplace la personne de la
//    vidéo de référence par ce personnage.
// La vidéo de référence doit être en 16 fps : fal facture à la frame,
// une vidéo en 30 fps coûterait presque deux fois plus cher.
export const GENERATION = {
  characterModel: "fal-ai/nano-banana/edit",
  // Format de la vidéo de référence (1080×1440).
  characterAspectRatio: "3:4",
  // Prompt prêt à l'emploi. L'image 1 est la scène, les suivantes le proche.
  characterPrompt: [
    "Image 1 is a frame from a parkour video. The other image(s) show one real person.",
    "Recreate image 1 exactly — same pose, same white t-shirt, blue shorts and sneakers,",
    "same framing, camera angle, background and lighting — but replace the man with",
    "the person from the other image(s).",
    "Keep that person's identity faithfully: face, hairstyle and hair color, skin tone,",
    "facial hair, age and body build.",
    "Photorealistic, sharp, whole body visible, exactly one person in the image,",
    "no text, no watermark.",
  ].join(" "),
  falModel: "fal-ai/wan/v2.2-14b/animate/replace",
  resolution: "720p",
  videoQuality: "high",
  // Délai entre deux vérifications de l'avancement (côté navigateur).
  pollIntervalMs: 5000,
} as const;

export const UPLOAD_RULES = {
  maxPhotos: 2,
  acceptedTypes: ["image/jpeg", "image/png", "image/webp"],
  maxSizeBytes: 10 * 1024 * 1024, // 10 Mo
  minDimensionPx: 512,
} as const;
