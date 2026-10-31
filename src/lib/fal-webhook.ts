// Vérification de la signature des webhooks fal.ai (Ed25519), selon
// https://fal.ai/docs/model-apis/model-endpoints/webhooks :
// message = request id, user id, timestamp et SHA-256 du corps brut,
// séparés par "\n", signé avec l'une des clés publiques du JWKS de fal.
import { createHash, createPublicKey, verify, type KeyObject } from "node:crypto";

const JWKS_URL = "https://rest.fal.ai/.well-known/jwks.json";
// fal demande de rafraîchir les clés au moins toutes les 24 h.
const JWKS_MAX_AGE_MS = 12 * 3600 * 1000;
// Écart maximum accepté avec l'heure de la requête (anti-rejeu).
const MAX_CLOCK_SKEW_S = 300;

let cachedKeys: { keys: KeyObject[]; fetchedAt: number } | null = null;

async function falPublicKeys(forceRefresh = false): Promise<KeyObject[]> {
  if (!forceRefresh && cachedKeys && Date.now() - cachedKeys.fetchedAt < JWKS_MAX_AGE_MS) {
    return cachedKeys.keys;
  }
  const res = await fetch(JWKS_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`JWKS fal indisponible (${res.status})`);
  const { keys = [] } = (await res.json()) as { keys?: { x?: string }[] };
  const parsed = keys.flatMap((k) => {
    if (!k.x) return [];
    try {
      return [createPublicKey({ key: { kty: "OKP", crv: "Ed25519", x: k.x }, format: "jwk" })];
    } catch {
      return [];
    }
  });
  cachedKeys = { keys: parsed, fetchedAt: Date.now() };
  return parsed;
}

// true seulement si la requête vient bien de fal, avec un corps intact et récent.
export async function isValidFalWebhook(headers: Headers, rawBody: Buffer): Promise<boolean> {
  const requestId = headers.get("x-fal-webhook-request-id");
  const userId = headers.get("x-fal-webhook-user-id");
  const timestamp = headers.get("x-fal-webhook-timestamp");
  const signatureHex = headers.get("x-fal-webhook-signature");
  if (!requestId || !userId || !timestamp || !signatureHex) return false;
  if (!/^\d+$/.test(timestamp) || Math.abs(Date.now() / 1000 - Number(timestamp)) > MAX_CLOCK_SKEW_S) {
    return false;
  }
  if (!/^[0-9a-f]+$/i.test(signatureHex) || signatureHex.length % 2 !== 0) return false;
  const signature = Buffer.from(signatureHex, "hex");

  const bodyHash = createHash("sha256").update(rawBody).digest("hex");
  const message = Buffer.from([requestId, userId, timestamp, bodyHash].join("\n"), "utf8");
  const matches = (keys: KeyObject[]) => keys.some((k) => verify(null, message, k, signature));

  if (matches(await falPublicKeys())) return true;
  // fal a peut-être changé de clé depuis la mise en cache : on recharge,
  // au plus toutes les 5 min (une fausse requête ne doit pas déclencher d'appel).
  if (cachedKeys && Date.now() - cachedKeys.fetchedAt < 5 * 60 * 1000) return false;
  return matches(await falPublicKeys(true));
}
