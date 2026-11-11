import { RATE_LIMITS } from "@/config/promo";
import { WelcomeError, claimWelcomeBonus } from "@/lib/promo";
import { allowRequest, ipFingerprint } from "@/lib/request-guard";
import { currentUser } from "@/lib/supabase";

// Cadeau de bienvenue, demandé depuis la carte de l'accueil. Toutes les
// règles (compte créé pendant l'offre, email vérifié, un cadeau par compte,
// plafond du jour) sont vérifiées par src/lib/promo.ts et la base.
export async function POST(request: Request) {
  const ipHash = ipFingerprint(request);
  if (ipHash && !(await allowRequest(`welcome:${ipHash}`, RATE_LIMITS.welcome))) {
    return Response.json({ error: "Trop de demandes : réessaie dans quelques minutes." }, { status: 429 });
  }
  const user = await currentUser();
  if (!user?.email) return Response.json({ error: "Connecte-toi pour récupérer tes tokens." }, { status: 401 });
  try {
    const balance = await claimWelcomeBonus(user);
    return Response.json({ balance });
  } catch (err) {
    if (err instanceof WelcomeError) return Response.json({ error: err.message, code: err.code }, { status: err.status });
    console.error(err);
    return Response.json({ error: "Impossible d'ajouter tes tokens pour l'instant, réessaie." }, { status: 500 });
  }
}
