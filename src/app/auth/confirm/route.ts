import { shouldGreet } from "@/lib/promo";
import { safeNextPath, siteUrl } from "@/lib/site-url";
import { sessionClient } from "@/lib/supabase";

// Arrivée depuis le lien de connexion reçu par email ou depuis Google : échange
// le code contre une session (cookies), puis renvoie vers la page demandée.
// Un compte créé pendant l'offre de lancement, qui n'a pas encore récupéré
// ses tokens de bienvenue, arrive sur l'accueil : la carte du cadeau l'y attend.
// Le lien doit être ouvert dans le navigateur qui l'a demandé.
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const code = params.get("code");
  const next = safeNextPath(params.get("next"), "/chat");
  const base = siteUrl(request);

  if (code) {
    const supabase = await sessionClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const greet = await shouldGreet(data.user);
      return Response.redirect(`${base}${greet ? "/" : next}`, 303);
    }
    console.error(error);
  }
  // Google renvoie "error" quand la connexion est refusée ou annulée.
  const reason = params.has("error") ? "google" : "lien";
  return Response.redirect(`${base}/connexion?erreur=${reason}&next=${encodeURIComponent(next)}`, 303);
}
