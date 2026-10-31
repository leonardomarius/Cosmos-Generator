// Jeton placé dans l'URL du webhook fal : il contient l'email du client,
// chiffré et authentifié (AES-256-GCM) avec WEBHOOK_TOKEN_SECRET.
// Personne d'autre que le serveur ne peut le lire ni en fabriquer un faux,
// et l'email n'apparaît jamais en clair dans une URL.
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { GENERATION } from "@/config/product";

type Payload = { email: string; issuedAt: number };

function key(): Buffer {
  const secret = process.env.WEBHOOK_TOKEN_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("WEBHOOK_TOKEN_SECRET manquant ou trop court (32 caractères minimum) dans .env.local");
  }
  return createHash("sha256").update(secret).digest();
}

export function createNotificationToken(email: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const payload: Payload = { email, issuedAt: Date.now() };
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(payload), "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString("base64url");
}

// Renvoie l'email du client, ou null si le jeton est faux, modifié ou expiré.
// Une configuration manquante lève une erreur (et n'est pas confondue avec un faux jeton).
export function readNotificationToken(token: string): string | null {
  const secretKey = key();
  try {
    const raw = Buffer.from(token, "base64url");
    if (raw.length < 12 + 16 + 1) return null;
    const decipher = createDecipheriv("aes-256-gcm", secretKey, raw.subarray(0, 12));
    decipher.setAuthTag(raw.subarray(12, 28));
    const json = Buffer.concat([decipher.update(raw.subarray(28)), decipher.final()]).toString("utf8");
    const { email, issuedAt } = JSON.parse(json) as Payload;
    const maxAgeMs = GENERATION.webhookTokenMaxAgeHours * 3600 * 1000;
    if (typeof email !== "string" || !(Date.now() - issuedAt < maxAgeMs)) return null;
    return email;
  } catch {
    return null;
  }
}
