// Couche fournisseur des presets : la machine (machine.ts) ne connaît que cette
// interface. Pour un autre fournisseur, une entrée de plus dans PROVIDERS et
// "provider" dans le preset ; rien d'autre ne change. Serveur uniquement.

export type ProviderStatus =
  | { state: "queued" }
  | { state: "running" }
  | { state: "done" }
  | { state: "failed"; error: string; refused: boolean };

export type ProviderResult = { url: string | null; data: unknown };

export type MediaProvider = {
  // Lance une tâche payante et renvoie son identifiant.
  submit(endpoint: string, input: object, options: { webhookUrl: string | null }): Promise<string>;
  // Lève une erreur si le fournisseur ne répond pas : la tâche n'est pas perdue,
  // on redemandera plus tard.
  status(endpoint: string, requestId: string): Promise<ProviderStatus>;
  result(endpoint: string, requestId: string): Promise<ProviderResult>;
  cancel(endpoint: string, requestId: string): Promise<void>;
  // Appel court et synchrone (vision).
  run(endpoint: string, input: object): Promise<unknown>;
};

// Refus du filtre de contenu du modèle : le client doit changer de photo,
// réessayer ne servirait à rien.
export class ProviderRefusedError extends Error {
  readonly refused = true;
}

export function isProviderRefusal(err: unknown): boolean {
  return (err as { refused?: unknown } | null)?.refused === true;
}

const QUEUE_URL = "https://queue.fal.run";
const RUN_URL = "https://fal.run";

function falHeaders() {
  const key = process.env.FAL_KEY;
  if (!key) throw new Error("FAL_KEY manquant dans .env.local");
  return {
    Authorization: `Key ${key}`,
    "Content-Type": "application/json",
    // Photos de clients : rien dans l'historique de fal (90 jours par défaut),
    // et sans ce délai fal garde les fichiers générés sans limite, en public.
    // 24 h suffisent : le résultat est aussitôt copié dans le stockage privé.
    "X-Fal-Store-IO": "0",
    "X-Fal-Object-Lifecycle-Preference": JSON.stringify({ expiration_duration_seconds: 24 * 3600 }),
  };
}

// Pour suivre une tâche, fal n'utilise que "propriétaire/app".
function requestUrl(endpoint: string, requestId: string): string {
  return `${QUEUE_URL}/${endpoint.split("/").slice(0, 2).join("/")}/requests/${requestId}`;
}

function isRefusal(detail: string): boolean {
  return detail.includes("content_policy_violation");
}

const temporary = (status: number) => status === 429 || status >= 500;

export const falProvider: MediaProvider = {
  async submit(endpoint, input, { webhookUrl }) {
    const query = webhookUrl ? `?fal_webhook=${encodeURIComponent(webhookUrl)}` : "";
    const res = await fetch(`${QUEUE_URL}/${endpoint}${query}`, {
      method: "POST",
      headers: falHeaders(),
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const detail = await res.text();
      if (isRefusal(detail)) throw new ProviderRefusedError(detail);
      throw new Error(`fal.ai a refusé la tâche (${res.status}) : ${detail}`);
    }
    const { request_id } = (await res.json()) as { request_id: string };
    return request_id;
  },

  async status(endpoint, requestId) {
    const res = await fetch(`${requestUrl(endpoint, requestId)}/status`, { headers: falHeaders(), cache: "no-store" });
    if (temporary(res.status)) throw new Error(`Statut fal indisponible (${res.status})`);
    if (!res.ok) return { state: "failed", error: `Tâche inconnue de fal (${res.status})`, refused: false };
    const { status } = (await res.json()) as { status: string };
    if (status === "IN_QUEUE") return { state: "queued" };
    if (status === "IN_PROGRESS") return { state: "running" };

    // COMPLETED : la tâche est finie, avec succès ou en erreur.
    const result = await fetch(requestUrl(endpoint, requestId), { headers: falHeaders(), cache: "no-store" });
    if (temporary(result.status)) {
      const detail = await result.text();
      // Un modèle qui plante répond aussi en 5xx : seul un corps sans détail
      // ressemble à une panne passagère.
      if (!detail.includes("detail")) throw new Error(`Résultat fal indisponible (${result.status})`);
      return { state: "failed", error: `Génération échouée (${result.status}) : ${detail}`, refused: isRefusal(detail) };
    }
    if (!result.ok) {
      const detail = await result.text();
      return { state: "failed", error: `Génération échouée (${result.status}) : ${detail}`, refused: isRefusal(detail) };
    }
    return { state: "done" };
  },

  async result(endpoint, requestId) {
    const res = await fetch(requestUrl(endpoint, requestId), { headers: falHeaders(), cache: "no-store" });
    if (!res.ok) throw new Error(`Résultat fal indisponible (${res.status})`);
    const data = (await res.json()) as { video?: { url: string }; images?: { url: string }[] };
    return { url: data.video?.url ?? data.images?.[0]?.url ?? null, data };
  },

  async cancel(endpoint, requestId) {
    await fetch(`${requestUrl(endpoint, requestId)}/cancel`, { method: "PUT", headers: falHeaders() });
  },

  async run(endpoint, input) {
    const res = await fetch(`${RUN_URL}/${endpoint}`, { method: "POST", headers: falHeaders(), body: JSON.stringify(input) });
    if (!res.ok) throw new Error(`fal.ai a refusé l'appel (${res.status}) : ${await res.text()}`);
    return res.json();
  },
};

export const PROVIDERS: Record<string, MediaProvider> = { fal: falProvider };
