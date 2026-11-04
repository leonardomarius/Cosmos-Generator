// Vote à l'aveugle du Preset Lab : ce que partagent la page des votants, la route
// des notes et le calcul des résultats. Aucune dépendance au serveur.
export const LAB_BUCKET = "preset-lab";

export const VOTE_CRITERIA = [
  { id: "realisme", label: "Réalisme", hint: "On dirait une vraie vidéo filmée" },
  { id: "stabilite", label: "Stabilité", hint: "Pas de scintillement, l'image ne tremble pas bizarrement" },
  { id: "mouvement", label: "Mouvement", hint: "La démarche et les gestes sont naturels" },
  { id: "visage", label: "Ressemblance", hint: "La personne ressemble à sa photo, du début à la fin" },
  { id: "defauts", label: "Absence de défauts", hint: "Pas de mains, de visages ou d'objets déformés" },
] as const;

export type VoteCriterion = (typeof VOTE_CRITERIA)[number]["id"];
export type VideoScores = Record<VoteCriterion, number>;
export type PairScores = { a: VideoScores; b: VideoScores };
export type VotePair = { photo: string; a: string; b: string };

export const CAMPAIGN_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isPairScores(value: unknown): value is PairScores {
  if (!value || typeof value !== "object") return false;
  const scores = value as Record<string, Record<string, unknown>>;
  return ["a", "b"].every((side) =>
    VOTE_CRITERIA.every(({ id }) => {
      const note = scores[side]?.[id];
      return Number.isInteger(note) && (note as number) >= 1 && (note as number) <= 5;
    }),
  );
}
