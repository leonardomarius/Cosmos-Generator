// Garde-fous contre les abus : empreinte de l'adresse IP, limites de
// fréquence (table rate_limits) et emails jetables.
import { createHmac } from "node:crypto";
import disposableDomains from "@/data/disposable-email-domains.json";
import { adminClient } from "@/lib/supabase";

// Adresse IP du visiteur. Sur Vercel, x-real-ip et x-forwarded-for sont
// écrits par la plateforme : le visiteur ne peut pas les choisir.
export function ipFromHeaders(headers: Headers): string | null {
  const real = headers.get("x-real-ip")?.trim();
  if (real) return real;
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
}

// Empreinte HMAC de l'IP : on compte par connexion sans jamais stocker
// l'adresse elle-même.
export function fingerprintIp(ip: string | null): string | null {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!ip || !key) return null;
  return createHmac("sha256", key).update(ip).digest("base64url").slice(0, 32);
}

export function ipFingerprint(request: Request): string | null {
  return fingerprintIp(ipFromHeaders(request.headers));
}

// Compte une requête pour "key". false : limite dépassée, refuser.
// Si la base ne répond pas, la requête passe : une panne du compteur ne doit
// pas bloquer tout le site.
export async function allowRequest(key: string, rule: { windowSeconds: number; max: number }): Promise<boolean> {
  const { data, error } = await adminClient().rpc("hit_rate_limit", {
    p_key: key,
    p_window_seconds: rule.windowSeconds,
    p_max: rule.max,
  });
  if (error) {
    console.error("Limite de fréquence indisponible", error);
    return true;
  }
  return data !== false;
}

const DISPOSABLE = new Set<string>(disposableDomains);

// Domaine (ou domaine parent) d'un service d'email jetable connu.
// Liste : github.com/disposable-email-domains/disposable-email-domains.
export function isDisposableEmail(email: string): boolean {
  let domain = email.split("@").pop()?.trim().toLowerCase() ?? "";
  while (domain.includes(".")) {
    if (DISPOSABLE.has(domain)) return true;
    domain = domain.slice(domain.indexOf(".") + 1);
  }
  return false;
}

// Le compte existe-t-il déjà ? En cas de doute, oui : on ne bloque jamais la
// connexion d'un client existant.
export async function accountExists(email: string): Promise<boolean> {
  const { data, error } = await adminClient().rpc("auth_email_exists", { p_email: email });
  if (error) {
    console.error("Vérification du compte impossible", error);
    return true;
  }
  return data === true;
}
