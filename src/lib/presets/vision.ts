// Vérifications par un modèle de vision : la photo du client avant tout appel
// payant, puis l'image-clé et la vidéo. Le modèle répond en JSON, les règles de
// refus sont dans le preset.
import type { MediaProvider } from "@/lib/presets/provider";
import type { PresetSpec, QaCheck } from "@/lib/presets/spec";

export type Verdict = {
  fields: Record<string, unknown>;
  // Messages des règles déclenchées, dans l'ordre du preset.
  refusals: string[];
  costUsd: number | null;
};

const VISION_ENDPOINT = "openrouter/router/vision";

// Le JSON de la réponse, même entouré de texte ou de ```json.
export function parseVisionJson(text: string): Record<string, unknown> {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) throw new Error("Réponse de vision sans JSON");
  return JSON.parse(text.slice(start, end + 1)) as Record<string, unknown>;
}

// "true", "1" : le modèle ne respecte pas toujours le type demandé.
const same = (a: unknown, b: unknown) => String(a).trim().toLowerCase() === String(b).trim().toLowerCase();

export function applyRules(check: QaCheck, fields: Record<string, unknown>): string[] {
  const refusals: string[] = [];
  for (const rule of check.refuse_if) {
    const value = fields[rule.field];
    if (rule.is !== undefined && same(value, rule.is)) refusals.push(rule.message);
    if (rule.is_not !== undefined && !same(value, rule.is_not)) refusals.push(rule.message);
  }
  return refusals;
}

// Un champ absent n'est pas une réponse : sans lui, une règle ne se déclencherait
// jamais et une photo non vérifiée passerait.
export function missingFields(check: QaCheck, fields: Record<string, unknown>): string[] {
  return check.refuse_if.filter((rule) => fields[rule.field] === undefined || fields[rule.field] === null).map((rule) => rule.field);
}

export async function judge(provider: MediaProvider, preset: PresetSpec, check: QaCheck, imageUrls: string[]): Promise<Verdict> {
  const data = (await provider.run(VISION_ENDPOINT, {
    model: preset.qa.vision_model,
    prompt: check.prompt.join(" "),
    image_urls: imageUrls,
    temperature: 0,
    max_tokens: 400,
  })) as { output?: string; usage?: { cost?: number } | null };
  const fields = parseVisionJson(data.output ?? "");
  const missing = missingFields(check, fields);
  if (missing.length > 0) throw new Error(`Réponse de vision incomplète : ${missing.join(", ")}`);
  return { fields, refusals: applyRules(check, fields), costUsd: data.usage?.cost ?? null };
}
