// Presets vidéo : une vidéo de référence fixe, préparée une seule fois, où la
// personne de la photo du client remplace la star. Chaque preset est un dossier
// presets/<id>/ (preset.json, benchmark.md, fichiers fixes). Pour en ajouter un :
// son dossier, puis une entrée ici. Un preset n'apparaît aux clients que si son
// statut est "published", ce que refuse scripts/preset-lab.mjs check tant que
// les critères du benchmark ne sont pas atteints.
import arriveeStar from "../../presets/arrivee-star/preset.json";
import arriveeStarUrls from "../../presets/arrivee-star/assets/urls.json";
import type { PresetSpec } from "@/lib/presets/spec";

export type PresetAssetUrls = Partial<Record<string, { sha256: string; url: string }>>;

export const PRESETS: readonly PresetSpec[] = [arriveeStar as unknown as PresetSpec];

// URL des fichiers fixes chez le fournisseur (scripts/preset-prepare.mjs upload).
const ASSET_URLS: Record<string, PresetAssetUrls> = { "arrivee-star": arriveeStarUrls as PresetAssetUrls };

export function presetBySlug(slug: string): PresetSpec | null {
  return PRESETS.find((preset) => preset.slug === slug) ?? null;
}

export function presetById(id: string): PresetSpec | null {
  return PRESETS.find((preset) => preset.id === id) ?? null;
}

export function presetAssetUrls(id: string): PresetAssetUrls {
  return ASSET_URLS[id] ?? {};
}

// Enregistré dans generations.model.
export function presetModelId(preset: PresetSpec): string {
  return `preset:${preset.id}@${preset.version}`;
}
