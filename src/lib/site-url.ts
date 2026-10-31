// Adresse du site pour les liens de retour (email de connexion, Mollie) :
// PUBLIC_BASE_URL en production, sinon l'adresse de la requête (localhost).
export function siteUrl(request: Request): string {
  return process.env.PUBLIC_BASE_URL?.replace(/\/+$/, "") || new URL(request.url).origin;
}

// Chemin interne seulement ("/compte"), jamais une autre adresse ("//site.fr").
export function safeNextPath(value: unknown, fallback = "/"): string {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value : fallback;
}
