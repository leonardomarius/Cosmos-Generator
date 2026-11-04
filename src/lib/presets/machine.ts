// Déroulé d'une commande de preset : image-clé → vidéo → assemblage. Chaque appel
// à advance fait avancer la tâche autant que possible puis rend la main ; un
// webhook, le suivi du navigateur ou la tâche quotidienne peuvent l'appeler sans
// risque, même plusieurs fois. Le même code sert au site (jobs.ts) et au
// Preset Lab (scripts/preset-lab.mjs) : ce qui est testé est ce qui est vendu.
// Règle d'or : aucune génération payante n'est relancée après une réponse
// ambiguë. La tâche échoue, le client est remboursé, et on regarde chez fal.
import { isProviderRefusal, type MediaProvider } from "@/lib/presets/provider";
import { modelCostUsd, promptFor, renderInput, variantOf, type ModelSpec, type PresetSpec, type TemplateValues } from "@/lib/presets/spec";
import type { Verdict } from "@/lib/presets/vision";

export type PaidStage = "keyframe" | "video";
export type Stage = PaidStage | "finish";

export type Step = {
  endpoint: string;
  // Noté AVANT l'appel payant : sans identifiant ensuite, l'envoi est ambigu.
  submittedAt: string;
  requestId: string | null;
  attempts: number;
  outputUrl: string | null;
  verdict: Pick<Verdict, "fields" | "refusals"> | null;
};

export type Job = {
  id: string;
  presetId: string;
  presetVersion: string;
  variantId: string;
  status: "running" | "done" | "failed";
  stage: Stage;
  steps: Partial<Record<PaidStage, Step>>;
  resultUrl: string | null;
  error: string | null;
  // refused : refus du filtre du modèle, à expliquer au client.
  errorKind: "refused" | "failed" | null;
  costUsd: number;
};

export type Assembled = {
  // Lien de la vidéo finale.
  url: string;
  // Planche d'images pour la vérification de la vidéo.
  sheetUrl: string;
};

export type MachineDeps = {
  provider: (id: string) => MediaProvider;
  save: (job: Job) => Promise<void>;
  // URL à jour des photos et des fichiers fixes (les liens signés sont courts).
  values: (job: Job) => Promise<TemplateValues>;
  webhookUrl: (job: Job) => string | null;
  judge: (check: "keyframe" | "video", imageUrls: string[]) => Promise<Verdict>;
  assemble: (job: Job, generatedUrl: string) => Promise<Assembled>;
  // Tokens : rendus si la tâche échoue. Sans effet si déjà fait. Si elle lève
  // une erreur, la tâche reste ouverte et sera reprise.
  settle: (job: Job) => Promise<void>;
  // Email et ménage, au mieux : ne remet jamais en cause le résultat.
  notify: (job: Job) => Promise<void>;
  log?: (message: string) => void;
};

export function newJob(id: string, preset: PresetSpec, variantId: string = preset.selected_variant): Job {
  return {
    id,
    presetId: preset.id,
    presetVersion: preset.version,
    variantId,
    status: "running",
    stage: variantOf(preset, variantId).keyframe ? "keyframe" : "video",
    steps: {},
    resultUrl: null,
    error: null,
    errorKind: null,
    costUsd: 0,
  };
}

function stageModel(preset: PresetSpec, job: Job, stage: PaidStage): { model: ModelSpec; promptId?: string } {
  if (stage === "keyframe") {
    return { model: preset.models[preset.keyframe_stage.model], promptId: preset.keyframe_stage.prompt };
  }
  const variant = variantOf(preset, job.variantId);
  return { model: preset.models[variant.model], promptId: variant.prompt };
}

// Fin de la tâche : tokens réglés, puis état enregistré, puis notification.
export async function close(job: Job, deps: MachineDeps, outcome: { url: string } | { error: string; kind: "refused" | "failed" }) {
  if ("url" in outcome) {
    job.status = "done";
    job.resultUrl = outcome.url;
  } else {
    job.status = "failed";
    job.error = outcome.error;
    job.errorKind = outcome.kind;
  }
  await deps.settle(job);
  await deps.save(job);
  await deps.notify(job).catch((err) => console.error(`Tâche ${job.id} : notification impossible`, err));
}

async function submit(job: Job, preset: PresetSpec, deps: MachineDeps, stage: PaidStage, attempts: number) {
  const { model, promptId } = stageModel(preset, job, stage);
  const values = await deps.values(job);
  const input = renderInput(model.input, {
    ...values,
    prompt: promptFor(preset, promptId, model),
    keyframe: job.steps.keyframe?.outputUrl ?? null,
  });
  const step: Step = {
    endpoint: model.endpoint,
    submittedAt: new Date().toISOString(),
    requestId: null,
    attempts,
    outputUrl: null,
    verdict: null,
  };
  job.steps[stage] = step;
  await deps.save(job);
  try {
    step.requestId = await deps.provider(model.provider).submit(model.endpoint, input, { webhookUrl: deps.webhookUrl(job) });
  } catch (err) {
    console.error(`Tâche ${job.id} : envoi ${stage} impossible`, err);
    await close(job, deps, { error: `Envoi ${stage} impossible`, kind: isProviderRefusal(err) ? "refused" : "failed" });
    return;
  }
  // Coût estimé d'après le preset, sur la durée demandée.
  job.costUsd += modelCostUsd(model, values.duration ?? preset.reference.seconds);
  await deps.save(job);
  deps.log?.(`${stage} envoyé : ${step.requestId}`);
}

// Une vérification indisponible ne bloque jamais une vidéo déjà payée : la tâche
// continue, et l'absence de verdict reste visible dans ses étapes.
async function judged(deps: MachineDeps, job: Job, check: "keyframe" | "video", imageUrls: string[]): Promise<Step["verdict"]> {
  try {
    const { fields, refusals } = await deps.judge(check, imageUrls);
    deps.log?.(`${check} : ${refusals.join(", ") || "acceptée"}`);
    return { fields, refusals };
  } catch (err) {
    console.error(`Tâche ${job.id} : vérification ${check} indisponible`, err);
    return { fields: {}, refusals: [] };
  }
}

// true si la tâche a changé d'étape, false si elle attend le fournisseur.
async function progress(job: Job, preset: PresetSpec, deps: MachineDeps, stage: PaidStage): Promise<boolean> {
  const step = job.steps[stage];
  if (!step) {
    await submit(job, preset, deps, stage, 1);
    return false;
  }
  if (!step.requestId) {
    await close(job, deps, { error: `Envoi ${stage} ambigu : à vérifier chez le fournisseur avant de relancer`, kind: "failed" });
    return false;
  }

  const { model } = stageModel(preset, job, stage);
  const provider = deps.provider(model.provider);
  if (!step.outputUrl) {
    const status = await provider.status(step.endpoint, step.requestId);
    if (status.state === "queued" || status.state === "running") return false;
    if (status.state === "failed") {
      await close(job, deps, { error: status.error, kind: status.refused ? "refused" : "failed" });
      return false;
    }
    const result = await provider.result(step.endpoint, step.requestId);
    if (!result.url) {
      await close(job, deps, { error: "Aucun résultat renvoyé par le fournisseur", kind: "failed" });
      return false;
    }
    step.outputUrl = result.url;
    await deps.save(job);
    deps.log?.(`${stage} terminé`);
  }

  if (stage === "keyframe" && !step.verdict) {
    const { photo_1 } = await deps.values(job);
    step.verdict = await judged(deps, job, "keyframe", [photo_1 as string, step.outputUrl]);
    await deps.save(job);
    const refusals = step.verdict?.refusals ?? [];
    if (refusals.length > 0 && preset.qa.mode === "enforce") {
      // Une image-clé ratée est un résultat clair, pas une réponse ambiguë.
      if (step.attempts <= preset.qa.max_auto_retries) {
        await submit(job, preset, deps, stage, step.attempts + 1);
        return false;
      }
      await close(job, deps, { error: refusals.join(", "), kind: "failed" });
      return false;
    }
  }

  job.stage = stage === "keyframe" ? "video" : "finish";
  await deps.save(job);
  return true;
}

async function finish(job: Job, preset: PresetSpec, deps: MachineDeps) {
  const video = job.steps.video;
  if (!video?.outputUrl) {
    await close(job, deps, { error: "Vidéo générée introuvable", kind: "failed" });
    return;
  }
  // Une panne ici (réseau, stockage) laisse la tâche à cette étape : sa reprise
  // ne coûte rien, la vidéo est déjà payée.
  const { url, sheetUrl } = await deps.assemble(job, video.outputUrl);
  if (!video.verdict) {
    const { photo_1 } = await deps.values(job);
    video.verdict = await judged(deps, job, "video", [photo_1 as string, sheetUrl]);
    await deps.save(job);
    const refusals = video.verdict?.refusals ?? [];
    // Jamais de nouvelle génération automatique : échec propre et remboursement.
    if (refusals.length > 0 && preset.qa.mode === "enforce") {
      await close(job, deps, { error: refusals.join(", "), kind: "failed" });
      return;
    }
  }
  await close(job, deps, { url });
}

export async function advance(job: Job, preset: PresetSpec, deps: MachineDeps): Promise<Job> {
  // Trois étapes au plus par passage.
  for (let round = 0; round < 3 && job.status === "running"; round++) {
    if (job.stage === "finish") {
      await finish(job, preset, deps);
      break;
    }
    if (!(await progress(job, preset, deps, job.stage))) break;
  }
  return job;
}
