import { WelcomeCard } from "@/components/Welcome";
import { welcomeOfferFor } from "@/lib/promo";
import { currentUser } from "@/lib/supabase";

// Haut de l'accueil pendant l'offre de lancement : bannière d'inscription pour
// les visiteurs, carte du cadeau pour les comptes créés pendant l'offre. Lue à
// chaque visite : hors des dates, ou coupée depuis /admin, elle disparaît.
export async function WelcomeSlot() {
  const offer = await welcomeOfferFor(await currentUser());
  if (!offer) return null;
  return (
    <div className="mb-12 sm:mb-14">
      <WelcomeCard offer={offer} />
    </div>
  );
}

// Place réservée pendant la lecture de l'offre : la page ne saute pas à
// l'arrivée de la carte.
export function WelcomeSlotPlaceholder() {
  return (
    <div className="mb-12 sm:mb-14" aria-hidden="true">
      {/* Hauteurs mesurées de la bannière d'inscription (cas le plus fréquent). */}
      <div className="liquid-glass min-h-[22.5rem] rounded-[28px] sm:min-h-[19rem] md:min-h-[14rem] lg:min-h-[10.3rem]" />
    </div>
  );
}
