import { siteUrl } from "@/lib/site-url";
import { customerIdFor, stripe } from "@/lib/stripe";
import { currentUser } from "@/lib/supabase";

// Portail Stripe : changer de plan, de carte, télécharger les factures et
// résilier en quelques clics (obligatoire en France depuis 2023).
export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Connecte-toi d'abord." }, { status: 401 });
  try {
    const portal = await stripe().billingPortal.sessions.create({
      customer: await customerIdFor(user),
      return_url: `${siteUrl(request)}/compte`,
    });
    return Response.json({ url: portal.url });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Portail indisponible pour le moment." }, { status: 502 });
  }
}
