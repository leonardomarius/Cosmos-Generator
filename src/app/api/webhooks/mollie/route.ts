import { handlePaymentWebhook } from "@/lib/mollie";

// Appelée par Mollie à chaque changement d'état d'un paiement (premier
// paiement, prélèvement, montée de plan, achat unique) et à chaque
// rétrofacturation. C'est elle qui remplit les tokens et bloque les comptes :
// rien n'est à faire à la main.
// Mollie n'envoie que "id=tr_…" : le paiement est relu chez Mollie.
// Réponse 2xx = traité ; sinon Mollie renvoie l'appel (10 fois sur 26 h).
// Toutes les opérations sont idempotentes : un appel rejoué n'a aucun effet.
export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const id = form?.get("id");
  if (typeof id !== "string" || !/^tr_\w+$/.test(id)) return new Response(null, { status: 200 });

  try {
    await handlePaymentWebhook(id);
    return new Response(null, { status: 200 });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Traitement impossible, réessayer." }, { status: 500 });
  }
}
