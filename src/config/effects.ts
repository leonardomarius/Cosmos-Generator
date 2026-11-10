// Effets saisonniers : des vidéos au scénario fixe, où le client remplit un
// petit formulaire au lieu d'écrire un prompt. La vidéo de référence est
// générée une seule fois avec l'IA ; chaque commande y colle la photo et les
// textes du client (src/lib/santa-video.ts), sans nouvelle génération.
// Pour en ajouter un : une entrée dans EFFECTS, sa vidéo de référence et sa
// configuration ci-dessous, sa page, son formulaire et sa route.

export type Effect = {
  // Enregistré dans generations.model.
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  // Présentation sur l'accueil.
  pitch: string;
  // Aperçu muet affiché sur l'accueil (scripts/prepare-santa-teaser.mjs).
  preview: { video: string; poster: string };
  // Prix fixe : aucune IA par commande, il ne dépend pas d'un coût fal.
  tokens: number;
  // Achat à l'unité, sans abonnement ni tokens (src/lib/video-purchases.ts).
  priceEur: number;
  seconds: number;
};

export const SANTA_EFFECT = {
  id: "santa",
  slug: "pere-noel",
  title: "Vidéo du Père Noël",
  subtitle: "Crée une vidéo magique du Père Noël pour ton enfant",
  pitch:
    "Le Père Noël découvre le visage de ton enfant et sa liste de cadeaux dans son cadre magique, puis lui fait un sourire complice. Une photo et la liste suffisent : la vidéo est prête tout de suite et envoyée par email.",
  preview: { video: "/effets/pere-noel-apercu.mp4", poster: "/effets/pere-noel-apercu.jpg" },
  // Proportionnel à la durée : 965 tokens pour 20 s, soit 1 302,75 pour 27 s,
  // arrondi au palier de 5 supérieur. ≈ 6,09 € avec l'abonnement Star.
  // TEST du 2026-11-10 : gratuit pour essayer la vidéo en production.
  // Prix normal : 1305. À remettre après le test.
  tokens: 0,
  priceEur: 9.99,
  seconds: 27,
} as const satisfies Effect;

export const EFFECTS: readonly Effect[] = [SANTA_EFFECT];

// --- Vidéo du Père Noël -----------------------------------------------------

export const SANTA_RULES = {
  // 1 enfant en V1 : une seule photo. Le formulaire et la route lisent ce
  // nombre ; pour plusieurs enfants, il faudra une carte à plusieurs photos.
  maxChildren: 1,
  // Longueurs calculées avec la police de la carte : jusque-là, le titre
  // « Liste de Noël de … » et chaque cadeau s'écrivent en pleine taille.
  maxNameLength: 16,
  minGifts: 1,
  maxGifts: 4,
  maxGiftLength: 35,
} as const;

export type Point = [number, number];
export type SantaTemplate = {
  // Vidéo de référence (chemin depuis la racine du projet).
  video: string;
  width: number;
  height: number;
  // Images par seconde de la vidéo de référence.
  fps: number;
  // Taille de la carte dessinée (photo + liste), aux proportions de l'écran.
  card: { width: number; height: number };
  // Apparition de la carte, en fondu (secondes).
  revealAt: number;
  // Plans où l'écran magique est visible, avec ses quatre coins dans l'image
  // (haut-gauche, haut-droite, bas-droite, bas-gauche, en pixels), mesurés une
  // fois sur la vidéo validée. Caméra fixe : les coins ne bougent pas.
  // cleanPlate : image du plan où rien ne passe devant l'écran. Si quelque
  // chose passe devant (le bonnet du Père Noël…), il reste devant la carte.
  shots: { from: number; to: number; corners: [Point, Point, Point, Point]; cleanPlate?: string }[];
};

// Écran magique du plan par-dessus l'épaule, repris après le gros plan.
const SANTA_SCREEN: Pick<SantaTemplate["shots"][number], "corners" | "cleanPlate"> = {
  corners: [[474, 370], [923, 378], [891, 1103], [453, 1071]],
  cleanPlate: "src/assets/effects/pere-noel/ecran-vide-1080p.png",
};
// Le même écran en gros plan. Rien ne passe devant : pas de cleanPlate.
const SANTA_CLOSE_UP_CORNERS: SantaTemplate["shots"][number]["corners"] = [[216, 412], [875, 424], [829, 1488], [185, 1442]];

const SANTA_FPS = 30;
// Début d'un plan, donné par sa première image. Tombe entre deux images pour
// qu'un arrondi ne fasse jamais changer une image de plan.
const cutAt = (frame: number) => (frame - 0.5) / SANTA_FPS;

// Vidéo de référence validée le 5 novembre 2026 (27 s, 1080p, 30 images/s) :
// le QG, le gag des lutins, l'écran magique (9,07-13 s), le sourire du Père
// Noël, le gros plan sur l'écran (18-20 s), l'écran de dos (20-22,03 s), puis
// le recul sur le QG. Coupée juste avant le noir de fin, son en fondu sur 1 s.
export const SANTA_TEMPLATE: SantaTemplate = {
  video: "src/assets/effects/pere-noel/reference-1080p.mp4",
  width: 1080,
  height: 1920,
  fps: SANTA_FPS,
  card: { width: 735, height: 1163 },
  revealAt: 9.4,
  shots: [
    { from: cutAt(272), to: cutAt(390), ...SANTA_SCREEN },
    { from: cutAt(540), to: cutAt(600), corners: SANTA_CLOSE_UP_CORNERS },
    { from: cutAt(600), to: cutAt(661), ...SANTA_SCREEN },
  ],
};

// Prénom : lettres, espaces, tirets et apostrophes.
const NAME_PATTERN = /^[\p{L}][\p{L}\p{M} '’-]*$/u;
// Cadeau : lettres, chiffres et ponctuation simple. La police de la carte est
// vérifiée à part (checkSantaTexts dans src/lib/santa-text.ts).
const GIFT_PATTERN = /^[\p{L}\p{M}\p{N} '’"«».,!?&+:()/-]+$/u;

// Espaces multiples réduits, comme le texte sera affiché.
export function cleanText(text: string): string {
  return text.normalize("NFC").replace(/\s+/g, " ").trim();
}

// Renvoie un message d'erreur, ou null si le prénom (facultatif) convient.
export function checkChildName(name: string): string | null {
  if (!name) return null;
  if (name.length > SANTA_RULES.maxNameLength) {
    return `Prénom trop long : ${SANTA_RULES.maxNameLength} caractères maximum.`;
  }
  if (!NAME_PATTERN.test(name)) return "Le prénom ne peut contenir que des lettres, espaces, tirets et apostrophes.";
  return null;
}

// Adresse où la vidéo est envoyée, saisie par le client dans le formulaire.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function checkDeliveryEmail(email: string): string | null {
  if (!email) return "Indique l'email où recevoir la vidéo.";
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) return "Cet email n'est pas valide.";
  return null;
}

// Renvoie un message d'erreur, ou null si la liste de cadeaux convient.
export function checkGifts(gifts: string[]): string | null {
  if (gifts.length < SANTA_RULES.minGifts) return "Ajoute au moins un cadeau.";
  if (gifts.length > SANTA_RULES.maxGifts) return `${SANTA_RULES.maxGifts} cadeaux maximum.`;
  for (const gift of gifts) {
    if (!gift) return "Un cadeau est vide : remplis-le ou retire-le.";
    if (gift.length > SANTA_RULES.maxGiftLength) {
      return `« ${gift.slice(0, 20)}… » est trop long : ${SANTA_RULES.maxGiftLength} caractères maximum par cadeau.`;
    }
    if (!GIFT_PATTERN.test(gift)) return `« ${gift} » contient des caractères non acceptés.`;
  }
  return null;
}
