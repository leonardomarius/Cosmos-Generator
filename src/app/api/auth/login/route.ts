import { EMAIL_RULES } from "@/config/product";
import { safeNextPath, siteUrl } from "@/lib/site-url";
import { sessionClient } from "@/lib/supabase";

// Envoie un lien de connexion par email (pas de mot de passe). Le compte est
// créé au premier lien. Le lien ramène sur /auth/confirm, puis sur "next".
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: unknown; next?: unknown } | null;
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  if (email.length > EMAIL_RULES.maxLength || !EMAIL_RULES.pattern.test(email)) {
    return Response.json({ error: "Adresse email invalide." }, { status: 400 });
  }
  const next = safeNextPath(body?.next, "/creer");

  const supabase = await sessionClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${siteUrl(request)}/auth/confirm?next=${encodeURIComponent(next)}` },
  });
  if (error) {
    console.error(error);
    const status = error.status === 429 ? 429 : 502;
    const message = status === 429 ? "Trop de demandes : réessaie dans quelques minutes." : "Envoi du lien impossible.";
    return Response.json({ error: message }, { status });
  }
  return Response.json({ sent: true });
}
