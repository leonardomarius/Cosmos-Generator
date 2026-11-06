// Textes de la carte de la vidéo du Père Noël, sans ffmpeg : la route de
// paiement les contrôle aussi, pour qu'un client ne paie jamais une commande
// que le rendu refuserait.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { checkChildName, checkGifts } from "@/config/effects";
import { missingCharacters, readFontMetrics, type FontMetrics } from "@/lib/font-metrics";

// Incluse dans le déploiement par next.config.ts : sans le commentaire
// turbopackIgnore, Next embarquerait tout le projet.
export const FONT_FILE = path.resolve(/*turbopackIgnore: true*/ process.cwd(), "src/assets/fonts/DancingScript.ttf");

let font: FontMetrics | null = null;
export async function loadFont(): Promise<FontMetrics> {
  font ??= readFontMetrics(await readFile(FONT_FILE));
  return font;
}

export function cardTitle(childName: string | null): string {
  return childName ? `Liste de Noël de ${childName}` : "Ma liste de Noël";
}

// Renvoie un message d'erreur, ou null si le prénom et les cadeaux conviennent.
export async function checkSantaTexts(childName: string, gifts: string[]): Promise<string | null> {
  const problem = checkChildName(childName) ?? checkGifts(gifts);
  if (problem) return problem;
  const missing = missingCharacters(await loadFont(), [cardTitle(childName || null), ...gifts].join(" "));
  return missing.length > 0 ? `Caractère non pris en charge : ${missing.join(" ")}` : null;
}
