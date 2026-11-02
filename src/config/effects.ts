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
  // Prix fixe : aucune IA par commande, il ne dépend pas d'un coût fal.
  tokens: number;
  seconds: number;
};

export const SANTA_EFFECT = {
  id: "santa",
  slug: "pere-noel",
  title: "Vidéo du Père Noël",
  subtitle: "Crée une vidéo magique du Père Noël pour ton enfant",
  // ≈ 12,50 € avec l'abonnement Star (3 000 tokens pour 24,99 €).
  tokens: 1500,
  seconds: 20,
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

// Écran magique du plan par-dessus l'épaule, repris à l'envers pour la fin.
const SANTA_SCREEN: Pick<SantaTemplate["shots"][number], "corners" | "cleanPlate"> = {
  corners: [[316, 247], [615, 252], [594, 735], [302, 714]],
  cleanPlate: "src/assets/effects/pere-noel/ecran-vide-9x16.png",
};

// Vidéo de référence validée le 2 novembre 2026 (20 s, 720p, 24 images/s) :
// le QG, le gag des lutins, l'écran magique (9,04-13 s), le sourire du Père
// Noël, puis retour sur l'écran (18-20 s).
export const SANTA_TEMPLATE: SantaTemplate = {
  video: "src/assets/effects/pere-noel/reference-9x16.mp4",
  width: 720,
  height: 1280,
  card: { width: 490, height: 775 },
  revealAt: 9.4,
  shots: [
    { from: 217 / 24, to: 312 / 24, ...SANTA_SCREEN },
    { from: 432 / 24, to: 480 / 24, ...SANTA_SCREEN },
  ],
};

// Prénom : lettres, espaces, tirets et apostrophes.
const NAME_PATTERN = /^[\p{L}][\p{L}\p{M} '’-]*$/u;
// Cadeau : lettres, chiffres et ponctuation simple. La police de la carte est
// vérifiée à part (unsupportedCharacters dans src/lib/santa-video.ts).
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
