// Filtre des descriptions envoyées à la génération (Cosmos uniquement).
// Contenu sexuel ou dénudé refusé avant la mise en file : rien n'est réservé,
// aucun token n'est retiré. Le PC vérifie aussi chaque résultat (détecteur de
// nudité du planificateur), ce filtre n'est que la première barrière.

// Chaque entrée est un début de mot : « masturb » couvre masturbation, masturber…
// Les mots courts ou ambigus sont écrits en entier ($ final) pour ne pas bloquer
// « canal », « violet » ou « au sein de ».
const SEXUAL = [
  // Anglais
  "porn", "xxx$", "nsfw$", "sex$", "sexy$", "sexual", "sexting", "nude", "nudity", "naked", "topless",
  "bottomless", "nipple", "boob", "tits$", "titties", "penis", "dick$", "dicks$", "cock$", "cocks$",
  "cum$", "cumshot", "vagina", "pussy", "clit", "anus$", "anal$", "blowjob", "handjob", "footjob",
  "fellatio", "cunnilingus", "orgasm", "masturbat", "erotic", "hentai", "fetish", "bdsm", "bondage",
  "stripper", "striptease", "undress", "unclothed", "genital", "intercourse", "threesome", "orgy",
  "orgies", "rape$", "raped$", "raping", "incest", "onlyfans", "milf$", "horny", "lewd$", "ejaculat",
  "semen$", "deepthroat", "erection", "aroused", "seduct", "gangbang", "creampie", "bukkake",
  // Français
  "sexe$", "sexes$", "sexuel", "nu$", "nue$", "nus$", "nues$", "nudite", "seins$", "teton", "nichon",
  "zizi", "vagin", "clitoris", "fellation", "sodomi", "branlette", "branler", "masturb", "orgasme",
  "erotique", "deshabill", "denud", "viol$", "viols$", "violer", "violee", "inceste", "ejacul",
  "sperme", "baise$", "partouze", "levrette", "pornographi", "obscen",
];

// Formulations en plusieurs mots (même normalisation que le texte).
const PHRASES = [
  "wearing nothing", "nothing on", "no clothes", "without clothes",
  "(?:tak|took|remov|strip|pull)[a-z]* off (?:her|his|their|all) clothes", "sans vetement", "sans vetements", "sans habit", "sans habits",
  "tout nu", "toute nue", "en tenue d eve", "en tenue d adam", "sans rien sur",
];

// Refusés seulement avec une photo : sur une vraie personne, c'est un déshabillage.
const WITH_PHOTO = [
  "bikini", "lingerie", "underwear", "panties", "bra$", "bras$", "swimsuit", "swimwear", "thong",
  "culotte", "soutien gorge", "sous vetement", "maillot de bain", "see through",
  "decollete", "cleavage",
];

// Mineurs : priorité absolue. Termes de la pédocriminalité refusés dans tous les cas.
const CHILD_ABUSE = [
  "loli$", "lolis$", "lolicon", "shota$", "shotacon", "jailbait", "pedo$", "pedophil", "paedo", "pedobear",
  "pthc$", "preteen", "pre teen", "underage", "under age", "pedocrimin", "pedoporn",
];

// Mots qui désignent un mineur…
const MINOR = [
  "child", "children", "kid$", "kids$", "kiddie", "toddler", "baby$", "babies$", "infant", "teen", "minor$",
  "minors$", "schoolgirl", "schoolboy", "school girl", "school boy", "little girl", "little boy", "young girl",
  "young boy", "boy$", "boys$", "enfant", "gamin", "fillette", "petite fille", "petit garcon", "garcon",
  "garconnet", "bebe", "mineur", "ado$", "ados$", "adolescent", "ecolier", "ecoliere", "collegien", "lyceen",
  "jeune fille", "pubert",
  "(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen) years? old",
  "(?:un|deux|trois|quatre|cinq|six|sept|huit|neuf|dix|onze|douze|treize|quatorze|quinze|seize|dix sept) ans$",
];
// … et âges de 0 à 17 ans écrits en chiffres (« 14 ans », « 15yo », « 16-year-old »).
const MINOR_AGE = /\b(?:1[0-7]|[0-9])\s*(?:-\s*)?(?:ans?|yo|y\s*o|yrs?|years?)\b/;

// Contexte corporel ou intime : refusé dès qu'il côtoie un mineur dans la même description.
const INTIMATE = [
  "bikini", "lingerie", "underwear", "panties", "bra$", "swimsuit", "swimwear", "thong", "bath", "bathing",
  "bathtub", "shower", "bed$", "bedroom", "kiss", "massage", "seduc", "sensual", "intimate", "body", "bodies",
  "skin$", "pose$", "posing", "spread", "legs$", "wet$", "tight", "skirt", "lick", "suck", "touch", "caress",
  "cuddle", "bain$", "baignoire", "douche", "(?:au|dans (?:le|son|un)|sur (?:le|son|un)) lit$", "chambre",
  "bisou", "embrass", "calin", "sensuel", "intime", "corps$", "peau$", "jambes", "mouill", "jupe",
  "minijupe", "lecher", "leche$", "sucer", "suce$", "tripot",
  "maillot", "culotte", "soutien gorge", "sous vetement", "string$", "pyjama", "nuisette",
];

// Minuscules, sans accents, chiffres « leet » remplacés, ponctuation → espaces.
function normalize(text: string, keepDigits = false): string {
  const plain = text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  if (keepDigits) return plain.replace(/[^a-z0-9]+/g, " ").trim();
  return plain
    .replace(/[0134578@$]/g, (c) => ({ "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "8": "b", "@": "a", $: "s" })[c] ?? c)
    .replace(/[^a-z]+/g, " ")
    .trim();
}

function toPattern(entries: string[]): RegExp {
  const parts = entries.map((entry) => {
    const exact = entry.endsWith("$");
    const word = entry.replace(/\$$/, "").replace(/ /g, " +");
    return exact ? `${word}\\b` : word;
  });
  return new RegExp(`\\b(?:${parts.join("|")})`);
}

const SEXUAL_PATTERN = toPattern([...SEXUAL, ...PHRASES]);
const WITH_PHOTO_PATTERN = toPattern(WITH_PHOTO);
// Mots écrits lettre par lettre (« p o r n », « s.e.x.e ») : on les recolle.
const SPELLED = /\b(?:[a-z] ){2,}[a-z]\b/g;
const SPELLED_WORDS = /^(?:porn|porno|sex|sexe|nude|nue|naked|penis|hentai|nsfw|xxx|blowjob|fellation)$/;

const CHILD_ABUSE_PATTERN = toPattern(CHILD_ABUSE);
const MINOR_PATTERN = toPattern(MINOR);
const INTIMATE_PATTERN = toPattern(INTIMATE);

export const BLOCKED_PROMPT_MESSAGE =
  "Cette description n'est pas autorisée sur Cosmos : pas de contenu sexuel ni dénudé.";
export const BLOCKED_MINOR_MESSAGE =
  "Cette description n'est pas autorisée sur Cosmos : aucun contenu corporel ou intime impliquant un mineur.";

// Renvoie le message d'erreur si la description est refusée, sinon null.
export function checkPrompt(prompt: string, hasPhotos: boolean): string | null {
  const text = normalize(prompt);
  if (CHILD_ABUSE_PATTERN.test(text)) return BLOCKED_MINOR_MESSAGE;
  const minor = MINOR_PATTERN.test(text) || MINOR_AGE.test(normalize(prompt, true));
  if (minor && INTIMATE_PATTERN.test(text)) return BLOCKED_MINOR_MESSAGE;
  if (SEXUAL_PATTERN.test(text)) return BLOCKED_PROMPT_MESSAGE;
  if (hasPhotos && WITH_PHOTO_PATTERN.test(text)) return BLOCKED_PROMPT_MESSAGE;
  for (const spelled of text.match(SPELLED) ?? []) {
    if (SPELLED_WORDS.test(spelled.replace(/ /g, ""))) return BLOCKED_PROMPT_MESSAGE;
  }
  return null;
}
