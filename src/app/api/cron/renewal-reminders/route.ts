import { sendRenewalReminders } from "@/lib/renewal-reminders";

// Appelée chaque jour par Vercel Cron (vercel.json) : prévient les abonnés
// annuels avant le renouvellement de leur abonnement.
// Vercel envoie "Authorization: Bearer <CRON_SECRET>" : personne d'autre ne
// peut déclencher l'envoi.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Non autorisé." }, { status: 401 });
  }
  try {
    const result = await sendRenewalReminders();
    return Response.json(result, { status: result.failed > 0 ? 500 : 200 });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Envoi impossible." }, { status: 500 });
  }
}
