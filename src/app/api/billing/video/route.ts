import { SANTA_EFFECT, checkDeliveryEmail, cleanText } from "@/config/effects";
import { accountSuspendedMessage } from "@/config/product";
import { createVideoPayment } from "@/lib/mollie";
import { checkSantaTexts } from "@/lib/santa-text";
import { siteUrl } from "@/lib/site-url";
import { currentUser } from "@/lib/supabase";
import { getAccount } from "@/lib/tokens";
import { recordVideoPurchase } from "@/lib/video-purchases";

// Ouvre la page de paiement Mollie pour acheter la vidéo du Père Noël à l'unité,
// une fois le formulaire rempli. La photo reste dans le navigateur ; le prénom et
// les cadeaux sont contrôlés ici : le client ne doit jamais payer une commande
// que le rendu refuserait. Le prix vient de la config, jamais de la requête.
export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Connecte-toi d'abord." }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { waiver?: unknown; deliveryEmail?: unknown; childName?: unknown; gifts?: unknown } | null;
  try {
    if ((await getAccount(user.id)).blocked) return Response.json({ error: accountSuspendedMessage() }, { status: 403 });
    // Même renonciation que pour les tokens (art. L221-28 du Code de la consommation).
    if (body?.waiver !== true) {
      return Response.json({ error: "Coche la case d'accès immédiat pour continuer." }, { status: 400 });
    }
    const gifts = Array.isArray(body.gifts) ? body.gifts.map((gift) => cleanText(String(gift))) : [];
    const problem =
      checkDeliveryEmail(String(body.deliveryEmail ?? "").trim()) ??
      (await checkSantaTexts(cleanText(String(body.childName ?? "")), gifts));
    if (problem) return Response.json({ error: problem }, { status: 400 });

    const returnUrl = `${siteUrl(request)}/effets/${SANTA_EFFECT.slug}?achat=ok`;
    // Prix à 0 € (test) : Mollie refuse 0,00 €. L'achat est enregistré comme le
    // ferait son webhook et le client revient directement, comme après paiement.
    const price: number = SANTA_EFFECT.priceEur;
    if (price <= 0) {
      await recordVideoPurchase(user.id, SANTA_EFFECT.id, `gratuit-${crypto.randomUUID()}`);
      return Response.json({ url: returnUrl });
    }
    const url = await createVideoPayment(user, SANTA_EFFECT, returnUrl);
    return Response.json({ url });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Paiement indisponible pour le moment." }, { status: 502 });
  }
}
