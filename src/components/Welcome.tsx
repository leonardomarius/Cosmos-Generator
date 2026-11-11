"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { PLANS, formatTokens } from "@/config/product";
import { WELCOME_IMAGES, WELCOME_TOKENS, type WelcomeOffer } from "@/config/promo";

// Offre de lancement côté navigateur : bannière d'inscription, carte du cadeau
// de bienvenue, et offre payante après une création. L'état (offer) est
// calculé par le serveur (src/lib/promo.ts).

const LAST_DAY = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", weekday: "long", day: "numeric", month: "long" });
const EURO = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });
// Espaces insécables ( ) : « 10 s », « ! » et « : » ne passent jamais seuls à la ligne.
const WHAT_IT_BUYS = `De quoi créer une vidéo de 10 s, une vidéo de star ou ta statue, ou jusqu'à ${WELCOME_IMAGES} images.`;

// « 6 j 9 h 41 min », puis les secondes le dernier jour.
function remaining(endsAt: string, now: number): string {
  const total = Math.max(0, Math.floor((Date.parse(endsAt) - now) / 1000));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  if (days > 0) return `${days} j ${hours} h ${minutes} min`;
  return `${hours} h ${minutes} min ${String(total % 60).padStart(2, "0")} s`;
}

function Countdown({ endsAt }: { endsAt: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  // Rendu serveur et navigateur peuvent différer d'une seconde.
  return (
    <time dateTime={endsAt} suppressHydrationWarning className="whitespace-nowrap tabular-nums">
      {remaining(endsAt, now)}
    </time>
  );
}

const CTA =
  "liquid-glass liquid-glass--interactive liquid-glass--accent inline-flex min-h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-full px-5 text-base font-semibold disabled:opacity-60 md:w-auto";

// Bannière (visiteur) ou carte du cadeau (nouveau compte), en haut de l'accueil.
export function WelcomeCard({ offer }: { offer: WelcomeOffer }) {
  const router = useRouter();
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tokens = formatTokens(WELCOME_TOKENS);

  async function claim() {
    setClaiming(true);
    setError(null);
    const res = await fetch("/api/welcome", { method: "POST" }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : { error: "Connexion perdue : réessaie." };
    setClaiming(false);
    if (!res?.ok) setError(data.error ?? "Impossible d'ajouter tes tokens pour l'instant, réessaie.");
    // Solde, formulaires et carte relus par le serveur (la carte passe à « claimed »).
    router.refresh();
  }

  const eyebrow =
    offer.status === "claimed" ? (
      "Bienvenue sur Cosmos"
    ) : (
      <>
        Offre de lancement ·{" "}
        <span className="whitespace-nowrap">
          encore <Countdown endsAt={offer.endsAt} />
        </span>
      </>
    );

  const content: Record<WelcomeOffer["status"], { title: string; text: string; action: ReactNode }> = {
    signed_out: {
      title: `${tokens} offerts à l'inscription`,
      text: `${WHAT_IT_BUYS} Pour tout compte créé d'ici au ${LAST_DAY.format(new Date(Date.parse(offer.endsAt) - 1))}.`,
      action: (
        <Link href="/connexion?next=/" className={CTA}>
          Créer mon compte
          <Arrow />
        </Link>
      ),
    },
    available: {
      title: `Bienvenue ! ${tokens} offerts`,
      text: WHAT_IT_BUYS,
      action: (
        <button type="button" onClick={claim} disabled={claiming} className={CTA}>
          {claiming ? "Ajout en cours…" : `Récupérer mes ${tokens}`}
        </button>
      ),
    },
    claimed: {
      title: `C'est fait : ${tokens} sur ton compte`,
      text: WHAT_IT_BUYS,
      action: (
        <Link href="/chat" className={CTA}>
          Commencer à créer
          <Arrow />
        </Link>
      ),
    },
    sold_out: {
      title: `Bienvenue ! ${tokens} t'attendent`,
      text: WHAT_IT_BUYS,
      action: <Note>Tous les cadeaux du jour sont partis&nbsp;: reviens demain pour récupérer les tiens.</Note>,
    },
    unverified: {
      title: `Bienvenue ! ${tokens} t'attendent`,
      text: WHAT_IT_BUYS,
      action: <Note>Confirme ton adresse email pour récupérer tes tokens.</Note>,
    },
    disposable: {
      title: "Bienvenue sur Cosmos",
      text: "L'offre de bienvenue est réservée aux adresses email permanentes.",
      action: (
        <Link href="/abonnement" className={CTA}>
          Voir les offres
        </Link>
      ),
    },
  };
  const { title, text, action } = content[offer.status];

  return (
    <section
      aria-label="Offre de bienvenue"
      className="liquid-glass flex flex-col items-center gap-5 rounded-[28px] p-5 text-center sm:p-6 md:flex-row md:gap-6 md:text-left"
    >
      <span className="glass-icon shrink-0" aria-hidden="true">
        <GiftIcon />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-(--brand)">{eyebrow}</p>
        <h2 className="mt-1.5 text-balance text-xl font-semibold leading-snug sm:text-2xl">{title}</h2>
        <p className="mt-1.5 text-pretty text-base leading-relaxed text-secondary">{text}</p>
        {error && (
          <p role="alert" className="mt-3 rounded-2xl border border-red-600/20 bg-red-500/10 px-4 py-3 text-base text-red-700 sm:text-sm">
            {error}
          </p>
        )}
      </div>
      <div className="w-full shrink-0 md:w-auto md:max-w-64">{action}</div>
    </section>
  );
}

function Note({ children }: { children: ReactNode }) {
  return <p className="text-pretty text-base leading-relaxed text-secondary md:text-sm">{children}</p>;
}

// Après une création, pour un compte qui n'a jamais payé : l'offre payante.
export function PaidOfferCta() {
  return (
    <div className="liquid-glass space-y-3 rounded-[24px] px-5 py-5 text-center">
      <p className="text-lg font-semibold">Ça te plaît&nbsp;?</p>
      <p className="mx-auto max-w-xl text-balance text-base leading-relaxed text-secondary sm:text-sm">
        Avec un abonnement, tes créations passent en priorité, avec des tokens rechargés chaque mois. Dès{" "}
        {EURO.format(PLANS.essentiel.priceEur)} par mois.
      </p>
      <Link
        href="/abonnement"
        className="liquid-glass liquid-glass--interactive liquid-glass--accent inline-flex min-h-11 items-center justify-center rounded-full px-6 text-base font-semibold"
      >
        Voir les abonnements
      </Link>
    </div>
  );
}

function Arrow() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-2">
      <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GiftIcon() {
  return (
    <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 11h16v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9ZM3 7h18v4H3zM12 7v14M12 7S10.5 3 8 3a2 2 0 0 0 0 4M12 7s1.5-4 4-4a2 2 0 0 1 0 4" />
    </svg>
  );
}
