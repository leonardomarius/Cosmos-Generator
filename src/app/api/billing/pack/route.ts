import { accountSuspendedMessage, isPackId } from "@/config/product";
import { createPackPayment } from "@/lib/mollie";
import { siteUrl } from "@/lib/site-url";
import { currentUser } from "@/lib/supabase";
import { getAccount } from "@/lib/tokens";

// Ouvre la page de paiement Mollie pour acheter un pack de tokens, avec ou sans
// abonnement. Le prix et la quantité viennent de la config.
export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Connecte-toi d'abord." }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { pack?: unknown; waiver?: unknown } | null;
  if (!isPackId(body?.pack)) return Response.json({ error: "Pack inconnu." }, { status: 400 });

  try {
    if ((await getAccount(user.id)).blocked) return Response.json({ error: accountSuspendedMessage() }, { status: 403 });
    // Même renonciation que pour l'abonnement (art. L221-28 du Code de la consommation).
    if (body.waiver !== true) {
      return Response.json({ error: "Coche la case d'accès immédiat pour continuer." }, { status: 400 });
    }
    const url = await createPackPayment(user, body.pack, `${siteUrl(request)}/compte?achat=ok`);
    return Response.json({ url });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Paiement indisponible pour le moment." }, { status: 502 });
  }
}
