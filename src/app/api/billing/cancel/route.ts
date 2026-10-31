import { cancelSubscription } from "@/lib/mollie";
import { currentUser } from "@/lib/supabase";

// Résiliation en un clic depuis le compte (obligatoire en France depuis 2023).
export async function POST() {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Connecte-toi d'abord." }, { status: 401 });
  try {
    await cancelSubscription(user.id);
    return Response.json({ canceled: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Résiliation impossible pour le moment, réessaie." }, { status: 502 });
  }
}
