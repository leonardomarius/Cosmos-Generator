import { safeNextPath, siteUrl } from "@/lib/site-url";
import { sessionClient } from "@/lib/supabase";

// Connexion avec Google : renvoie vers l'écran de Google, qui ramène ensuite sur
// /auth/confirm (comme le lien email), puis sur "next". Le compte est créé à la
// première connexion.
export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const next = safeNextPath(form?.get("next"), "/creer");
  const base = siteUrl(request);

  const supabase = await sessionClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${base}/auth/confirm?next=${encodeURIComponent(next)}`, skipBrowserRedirect: true },
  });
  if (error || !data.url) {
    console.error(error);
    return Response.redirect(`${base}/connexion?erreur=google&next=${encodeURIComponent(next)}`, 303);
  }
  return Response.redirect(data.url, 303);
}
