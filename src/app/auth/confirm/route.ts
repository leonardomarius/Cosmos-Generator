import { safeNextPath, siteUrl } from "@/lib/site-url";
import { sessionClient } from "@/lib/supabase";

// Arrivée depuis le lien de connexion reçu par email ou depuis Google : échange
// le code contre une session (cookies), puis renvoie vers la page demandée.
// Le lien doit être ouvert dans le navigateur qui l'a demandé.
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const code = params.get("code");
  const next = safeNextPath(params.get("next"), "/creer");
  const base = siteUrl(request);

  if (code) {
    const supabase = await sessionClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return Response.redirect(`${base}${next}`, 303);
    console.error(error);
  }
  // Google renvoie "error" quand la connexion est refusée ou annulée.
  const reason = params.has("error") ? "google" : "lien";
  return Response.redirect(`${base}/connexion?erreur=${reason}&next=${encodeURIComponent(next)}`, 303);
}
