// Offre de lancement : les comptes créés pendant l'offre reçoivent des tokens
// de bienvenue, l'équivalent d'une vidéo de 10 s ou d'une vidéo preset. Rien
// de secret ici : ce fichier est lu aussi par le navigateur. Les valeurs par
// défaut sont remplacées par les variables d'environnement (voir
// .env.example) ; l'interrupteur et le plafond du jour se changent aussi
// depuis /admin, sans redéploiement.
import { MODELS, tokensFor } from "@/config/product";

export const PROMO = {
  // Premier et dernier jour inclus, à Paris (PROMO_START, PROMO_END).
  defaultStart: "2026-11-11",
  defaultEnd: "2026-11-17",
  // Cadeaux accordés par jour au maximum, tous comptes confondus (FREE_DAILY_BUDGET).
  defaultDailyBudget: 60,
} as const;

// Tokens offerts : le prix d'une vidéo preset (= une vidéo de 10 s).
export const WELCOME_TOKENS = tokensFor("kling4");
// Images que le cadeau permet de créer.
export const WELCOME_IMAGES = Math.floor(WELCOME_TOKENS / MODELS.image.tokens);

// Limites de fréquence, par adresse IP (empreinte), en fenêtres fixes.
export const RATE_LIMITS = {
  // Lancements de génération.
  generations: { windowSeconds: 10 * 60, max: 10 },
  // Demandes de lien de connexion.
  login: { windowSeconds: 60 * 60, max: 10 },
  // Demandes du cadeau de bienvenue.
  welcome: { windowSeconds: 60 * 60, max: 10 },
} as const;

// État de l'offre pour un visiteur, calculé par le serveur (src/lib/promo.ts).
// - signed_out : pas connecté (bannière d'inscription) ;
// - available : compte créé pendant l'offre, cadeau à récupérer ;
// - claimed : cadeau reçu il y a moins d'un quart d'heure (confirmation) ;
// - sold_out : plafond du jour atteint, à récupérer demain ;
// - unverified : email pas encore confirmé ;
// - disposable : adresse email jetable.
export type WelcomeStatus = "signed_out" | "available" | "claimed" | "sold_out" | "unverified" | "disposable";

export type WelcomeOffer = {
  status: WelcomeStatus;
  // Fin de l'offre (exclue), en ISO : pour le compte à rebours.
  endsAt: string;
};
