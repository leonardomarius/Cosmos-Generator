// Mensurations facultatives de la personne : mêmes règles dans le navigateur et
// sur le serveur, qui les ajoute au prompt fixe de la vidéo. Bornes larges : un
// chiffre hors limites est une faute de frappe, pas une morphologie.
export const BODY_MEASUREMENTS = [
  { id: "heightCm", label: "Taille", unit: "cm", min: 120, max: 230, prompt: "height" },
  { id: "weightKg", label: "Poids", unit: "kg", min: 30, max: 250, prompt: "weight" },
  { id: "chestCm", label: "Tour de poitrine", unit: "cm", min: 50, max: 200, prompt: "chest" },
  { id: "waistCm", label: "Tour de taille", unit: "cm", min: 40, max: 200, prompt: "waist" },
  { id: "hipsCm", label: "Tour de hanches", unit: "cm", min: 50, max: 200, prompt: "hips" },
] as const;

export type MeasurementId = (typeof BODY_MEASUREMENTS)[number]["id"];
export type BodyMeasurements = Partial<Record<MeasurementId, number>>;

// "read" donne la valeur brute d'un champ : formulaire du navigateur ou FormData
// reçu par le serveur. Un champ vide est simplement ignoré.
export function readBodyMeasurements(read: (id: MeasurementId) => unknown): BodyMeasurements | { error: string } {
  const measurements: BodyMeasurements = {};
  for (const { id, label, unit, min, max } of BODY_MEASUREMENTS) {
    const raw = read(id) ?? "";
    if (raw === "") continue;
    const value = typeof raw === "string" && /^\d{1,3}$/.test(raw) ? Number(raw) : NaN;
    if (!(value >= min && value <= max)) return { error: `${label} : entre ${min} et ${max} ${unit}.` };
    measurements[id] = value;
  }
  return measurements;
}

// Corpulence en mots, déduite de la taille et du poids : complète les chiffres,
// que le modèle ne sait pas mesurer à l'image près.
function buildWord(heightCm: number, weightKg: number): string {
  const bmi = weightKg / (heightCm / 100) ** 2;
  if (bmi < 18.5) return "slim";
  if (bmi < 25) return "average";
  if (bmi < 30) return "sturdy";
  return "heavy";
}

// Phrases à ajouter au prompt, ou null si aucune mensuration n'est donnée.
export function describeBody(measurements: BodyMeasurements): string | null {
  const parts = BODY_MEASUREMENTS.flatMap(({ id, unit, prompt }) => {
    const value = measurements[id];
    return value === undefined ? [] : [`${prompt} ${value} ${unit}`];
  });
  if (parts.length === 0) return null;
  const { heightCm, weightKg } = measurements;
  if (heightCm !== undefined && weightKg !== undefined) parts.push(`${buildWord(heightCm, weightKg)} build`);
  return `Real body measurements of the new person: ${parts.join(", ")}. Match this silhouette and this height relative to the other people in the video, without changing the outfit or the movements.`;
}
