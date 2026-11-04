// Format d'un preset (presets/<id>/preset.json) : un fichier versionné, pas du
// code. Ici : ses types, le remplissage de ses gabarits, son coût et ses
// vérifications. Aucun appel réseau, aucune dépendance au serveur.
import { PLANS, PRICE_STEP_TOKENS, TOKEN_PACKS, TOKEN_USD } from "@/config/product";

export type PresetStatus = "draft" | "published" | "retired";

export type Pricing = { source: string; checked: string } & (
  | { unit: "second"; usd: number; billed: "output" | "input+output" }
  | { unit: "run"; usd: number; short_clip_usd?: number; short_clip_seconds?: number }
);

export type ModelSpec = {
  provider: "fal";
  endpoint: string;
  pricing: Pricing;
  limits?: { min_seconds?: number; max_seconds?: number; min_side_px?: number; max_prompt_chars?: number };
  // Comment le modèle désigne la personne dans le prompt ("@Element1", "@Image1").
  subject_token?: string;
  // Gabarit de la requête, voir renderInput.
  input: Record<string, unknown>;
};

export type VariantSpec = {
  id: string;
  model: string;
  // raw : la vidéo telle quelle ; depth : star effacée par une silhouette.
  source: "raw" | "depth";
  prompt?: string;
  keyframe: boolean;
  note?: string;
};

export type QaRule = { field: string; is?: unknown; is_not?: unknown; message: string };
export type QaCheck = { prompt: string[]; refuse_if: QaRule[] };

export type PresetSpec = {
  id: string;
  version: string;
  status: PresetStatus;
  name: string;
  slug: string;
  subtitle: string;
  pitch: string;
  preview_video: string;
  thumbnail: string;
  reference: {
    master: string;
    seconds: number;
    fps: number;
    frames: number;
    width: number;
    height: number;
    assets: {
      raw: string;
      depth: string;
      audio: string;
      mask: string;
      label: string;
      hero_face: string;
      hero_body: string;
      hero_profile: string;
    };
    hero_frames: { hero_face: number; hero_body: number; hero_profile: number };
    timeline: { from: number; to: number; shot: string; risk: string }[];
  };
  source_requirements: {
    photos: { min: number; max: number };
    min_short_side_px: number;
    max_subjects: number;
    notes_for_user: string;
  };
  prep: {
    mode: "basic" | "depth_mask" | "face_mesh";
    once: boolean;
    sam: {
      endpoint: string;
      object_id: number;
      detection_threshold: number;
      box_prompts: { frame_index: number; x_min: number; y_min: number; x_max: number; y_max: number }[];
      point_prompts: { frame_index: number; x: number; y: number; label: 0 | 1 }[];
    };
    depth: { endpoint: string; model: string; colormap: string; resolution: string };
  };
  prompts: Record<string, string[]>;
  keyframe_stage: { model: string; prompt: string };
  models: Record<string, ModelSpec>;
  variants: VariantSpec[];
  selected_variant: string;
  post: { restore_audio: boolean; composite_mask: boolean; metadata_comment: string };
  qa: {
    // shadow : le verdict est noté sans rien bloquer, le temps de le comparer
    // aux notes humaines ; enforce : un refus fait échouer la commande.
    mode: "shadow" | "enforce";
    vision_model: string;
    vision_usd: number;
    max_auto_retries: number;
    photo_gate: QaCheck;
    keyframe: QaCheck;
    video: QaCheck;
  };
  economics: { tokens: number; expected_failure_rate: number; benchmark: string };
};

// Valeurs disponibles pour les gabarits. null : absente (photo 2 facultative…).
export type TemplateValues = {
  prompt?: string | null;
  source_url?: string | null;
  photo_1?: string | null;
  photo_2?: string | null;
  keyframe?: string | null;
  hero_face?: string | null;
  hero_body?: string | null;
  hero_profile?: string | null;
  hero_face_frame?: number | null;
  duration?: number | null;
};

const TEMPLATE_KEYS = [
  "prompt",
  "source_url",
  "photo_1",
  "photo_2",
  "keyframe",
  "hero_face",
  "hero_body",
  "hero_profile",
  "hero_face_frame",
  "duration",
];
const PLACEHOLDER = /^\{([a-z0-9_|]+)\}$/;

// Remplit un gabarit de requête. Une chaîne "{a|b}" prend la première valeur
// présente. Une valeur absente disparaît : clé retirée d'un objet, élément
// retiré d'une liste. Seule une chaîne entière est un gabarit : aucun texte
// n'est interprété à l'intérieur d'un prompt.
export function renderInput<T>(template: T, values: TemplateValues): T {
  return renderValue(template, values) as T;
}

function renderValue(value: unknown, values: TemplateValues): unknown {
  if (typeof value === "string") {
    const match = PLACEHOLDER.exec(value);
    if (!match) return value;
    for (const key of match[1].split("|")) {
      const found = values[key as keyof TemplateValues];
      if (found !== null && found !== undefined) return found;
    }
    return null;
  }
  if (Array.isArray(value)) {
    return value.map((item) => renderValue(item, values)).filter((item) => item !== null);
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value).map(([key, item]) => [key, renderValue(item, values)] as const);
    return Object.fromEntries(entries.filter(([, item]) => item !== null));
  }
  return value;
}

function placeholdersOf(value: unknown): string[] {
  if (typeof value === "string") return PLACEHOLDER.exec(value)?.[1].split("|") ?? [];
  if (Array.isArray(value)) return value.flatMap(placeholdersOf);
  if (value && typeof value === "object") return Object.values(value).flatMap(placeholdersOf);
  return [];
}

export function variantOf(preset: PresetSpec, id: string = preset.selected_variant): VariantSpec {
  const variant = preset.variants.find((v) => v.id === id);
  if (!variant) throw new Error(`Variante inconnue : ${id}`);
  return variant;
}

// Prompt d'une étape, écrit pour le modèle qui le reçoit.
export function promptFor(preset: PresetSpec, promptId: string | undefined, model: ModelSpec): string | null {
  if (!promptId) return null;
  const text = preset.prompts[promptId].join(" ");
  return model.subject_token ? text.replaceAll("@Element1", model.subject_token) : text;
}

export function modelCostUsd(model: ModelSpec, seconds: number): number {
  const { pricing } = model;
  if (pricing.unit === "run") {
    const short = pricing.short_clip_usd !== undefined && seconds <= (pricing.short_clip_seconds ?? 0);
    return short ? pricing.short_clip_usd! : pricing.usd;
  }
  return pricing.usd * seconds * (pricing.billed === "input+output" ? 2 : 1);
}

// Coût d'une commande réussie, en dollars. Vision : une vérification par photo
// (2 au plus), une pour l'image-clé, une pour la vidéo.
export function runCostUsd(preset: PresetSpec, variantId: string = preset.selected_variant, seconds = preset.reference.seconds): number {
  const variant = variantOf(preset, variantId);
  const keyframe = variant.keyframe ? modelCostUsd(preset.models[preset.keyframe_stage.model], seconds) : 0;
  const visionCalls = preset.source_requirements.photos.max + (variant.keyframe ? 1 : 0) + 1;
  return modelCostUsd(preset.models[variant.model], seconds) + keyframe + visionCalls * preset.qa.vision_usd;
}

// Une vidéo échouée est remboursée au client mais payée au fournisseur :
// chaque vidéo acceptée porte aussi le coût des échecs.
export function acceptedCostUsd(preset: PresetSpec, variantId: string = preset.selected_variant): number {
  return runCostUsd(preset, variantId) / (1 - preset.economics.expected_failure_rate);
}

// Mêmes hypothèses que scripts/economics.mjs.
const EUR_PER_USD = 0.86;
const VAT = 0.2;
const paymentFees = (ttc: number) => ttc * 0.018 + 0.25;

// Le moins bon revenu net d'un token, hors TVA et frais de paiement : celui de
// l'offre la moins chère au token (aujourd'hui Réalisateur à l'année). Une marge
// tenue ici est tenue sur toutes les offres.
export function worstEurPerToken(): number {
  const plans = Object.values(PLANS);
  const offers: [number, number][] = [
    ...plans.map((plan): [number, number] => [plan.priceEur, plan.monthlyTokens]),
    ...plans.map((plan): [number, number] => [plan.annualPriceEur, plan.monthlyTokens * 12]),
    ...Object.values(TOKEN_PACKS).map((pack): [number, number] => [pack.priceEur, pack.tokens]),
  ];
  return Math.min(...offers.map(([ttc, tokens]) => (ttc / (1 + VAT) - paymentFees(ttc)) / tokens));
}

// Marge sur le coût par vidéo acceptée, au pire cas.
export function marginRate(preset: PresetSpec, variantId: string = preset.selected_variant, tokens: number = preset.economics.tokens): number {
  const revenue = tokens * worstEurPerToken();
  return (revenue - acceptedCostUsd(preset, variantId) * EUR_PER_USD) / revenue;
}

// Prix minimum en tokens : la règle de src/config/product.ts, et la marge exigée
// pour publier, au pire cas.
export function minTokens(preset: PresetSpec, variantId: string = preset.selected_variant): number {
  const accepted = acceptedCostUsd(preset, variantId);
  const byRule = accepted / TOKEN_USD;
  const byMargin = (accepted * EUR_PER_USD) / (1 - PUBLISH_CRITERIA.minMargin) / worstEurPerToken();
  return Math.ceil(Math.max(byRule, byMargin) / PRICE_STEP_TOKENS - 1e-9) * PRICE_STEP_TOKENS;
}

export type BenchmarkResult = {
  version: string;
  variant: string;
  raters: number;
  pairs: number;
  win_or_tie_rate: number;
  failure_rate: number;
  margin_rate: number;
  date: string;
};

// Critères de publication du brief.
export const PUBLISH_CRITERIA = { minWinOrTie: 0.7, maxFailure: 0.15, minMargin: 0.6, minRaters: 5 } as const;

export function benchmarkProblems(preset: PresetSpec, result: BenchmarkResult | null): string[] {
  if (!result) return ["aucun benchmark enregistré (benchmark.json)"];
  const problems: string[] = [];
  if (result.version !== preset.version) problems.push(`benchmark fait sur la version ${result.version}, pas ${preset.version}`);
  if (result.variant !== preset.selected_variant) problems.push(`benchmark fait sur ${result.variant}, pas ${preset.selected_variant}`);
  if (result.raters < PUBLISH_CRITERIA.minRaters) problems.push(`${result.raters} votants, ${PUBLISH_CRITERIA.minRaters} minimum`);
  if (result.win_or_tie_rate < PUBLISH_CRITERIA.minWinOrTie) problems.push(`${pct(result.win_or_tie_rate)} de paires gagnées ou à égalité, ${pct(PUBLISH_CRITERIA.minWinOrTie)} minimum`);
  if (result.failure_rate > PUBLISH_CRITERIA.maxFailure) problems.push(`${pct(result.failure_rate)} d'échecs, ${pct(PUBLISH_CRITERIA.maxFailure)} maximum`);
  if (result.margin_rate < PUBLISH_CRITERIA.minMargin) problems.push(`marge de ${pct(result.margin_rate)}, ${pct(PUBLISH_CRITERIA.minMargin)} minimum`);
  return problems;
}

const pct = (n: number) => `${Math.round(n * 100)} %`;

// Tout ce qui rend un preset inutilisable, sans réseau. exists : un fichier du
// dossier du preset existe-t-il ? urls : URL des fichiers fixes chez le fournisseur.
export function presetProblems(
  preset: PresetSpec,
  { exists, benchmark, maskApproved, uploaded }: {
    exists: (asset: string) => boolean;
    benchmark: BenchmarkResult | null;
    maskApproved: boolean;
    uploaded: (assetKey: string) => boolean;
  },
): string[] {
  const problems: string[] = [];
  const { reference } = preset;

  if (reference.frames !== reference.seconds * reference.fps) problems.push("nombre d'images incohérent avec la durée");
  for (const key of ["raw", "audio", "label", "hero_face"] as const) {
    if (!exists(reference.assets[key])) problems.push(`fichier manquant : ${reference.assets[key]} (lancer scripts/preset-prepare.mjs)`);
  }

  const check = (where: string, model: ModelSpec | undefined, promptId: string | undefined) => {
    if (!model) return problems.push(`${where} : modèle inconnu`);
    const { limits } = model;
    for (const key of placeholdersOf(model.input)) {
      if (!TEMPLATE_KEYS.includes(key)) problems.push(`${where} : gabarit inconnu {${key}}`);
    }
    if (promptId && !preset.prompts[promptId]) problems.push(`${where} : prompt inconnu (${promptId})`);
    const prompt = promptId && preset.prompts[promptId] ? promptFor(preset, promptId, model) : null;
    if (prompt && limits?.max_prompt_chars && prompt.length > limits.max_prompt_chars) {
      problems.push(`${where} : prompt de ${prompt.length} caractères, ${limits.max_prompt_chars} maximum`);
    }
    if (limits?.min_side_px && Math.min(reference.width, reference.height) < limits.min_side_px) {
      problems.push(`${where} : vidéo de ${reference.width} px de large, ${limits.min_side_px} minimum`);
    }
    if (limits?.max_seconds && reference.seconds > limits.max_seconds) {
      problems.push(`${where} : vidéo de ${reference.seconds} s, ${limits.max_seconds} s maximum`);
    }
    if (limits?.min_seconds && reference.seconds < limits.min_seconds) {
      problems.push(`${where} : vidéo de ${reference.seconds} s, ${limits.min_seconds} s minimum`);
    }
    return null;
  };

  const ids = new Set<string>();
  for (const variant of preset.variants) {
    if (ids.has(variant.id)) problems.push(`variante en double : ${variant.id}`);
    ids.add(variant.id);
    check(variant.id, preset.models[variant.model], variant.prompt);
  }
  check("image-clé", preset.models[preset.keyframe_stage.model], preset.keyframe_stage.prompt);
  if (!ids.has(preset.selected_variant)) problems.push(`variante retenue inconnue : ${preset.selected_variant}`);
  else {
    const needed = minTokens(preset);
    if (preset.economics.tokens < needed) {
      problems.push(`prix de ${preset.economics.tokens} tokens, ${needed} minimum avec ${preset.selected_variant}`);
    }
  }

  // Ce qu'exige une mise en ligne, en plus de ce qui précède.
  if (preset.status === "published") {
    const selected = preset.variants.find((v) => v.id === preset.selected_variant);
    if (selected) {
      const assetsNeeded = selected.source === "depth" ? ["depth"] : ["raw"];
      if (selected.keyframe) assetsNeeded.push("hero_face");
      for (const key of assetsNeeded) {
        if (!uploaded(key)) problems.push(`fichier non envoyé au fournisseur : ${key} (scripts/preset-prepare.mjs upload)`);
      }
      if (selected.source === "depth" && !maskApproved) problems.push("masque non approuvé (scripts/preset-prepare.mjs approve-mask)");
    }
    if (preset.post.composite_mask && !exists(reference.assets.mask)) problems.push("masque manquant pour le recollage");
    for (const problem of benchmarkProblems(preset, benchmark)) problems.push(`publication interdite : ${problem}`);
  }
  return problems;
}
