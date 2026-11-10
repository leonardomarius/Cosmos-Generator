import Link from "next/link";
import type { ReactNode } from "react";
import { ChatLink } from "@/components/ChatLink";
import { BeforeAfter } from "@/components/BeforeAfter";
import { IMAGE_EXAMPLE } from "@/config/examples";
import { formatTokens, tokensFor } from "@/config/product";

// Côte à côte, les deux cartes du hero partagent les rangées de la grille
// (subgrid) : titres, textes et pieds restent alignés, même quand un titre
// passe sur deux lignes.
const HERO_CARD = "liquid-glass group flex flex-col rounded-[32px] p-2 md:row-span-4 md:grid md:grid-rows-subgrid md:gap-y-0";
const VISUAL = "relative aspect-[16/10] overflow-hidden rounded-[24px] bg-foreground/8";

// Hero de l'accueil : vidéo et générations historiques côte à côte (empilées
// sur mobile), même gabarit et même poids.
export function GenerationCards() {
  return (
    <div className="grid gap-5 md:grid-cols-2 md:grid-rows-[auto_auto_1fr_auto]">
      {/* Preset de la vidéo de star (rendu WanGP du 2026-11-10), lancé depuis le chat. */}
      <ChatLink kind="star" className={`${HERO_CARD} liquid-glass--interactive`}>
        <div className={VISUAL}>
          <video
            src="/exemples/video-de-star.mp4"
            poster="/exemples/video-de-star.jpg"
            aria-label="Une personne arrive en star : elle sort d'un SUV et passe entre ses gardes du corps devant des fans qui filment"
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover object-[50%_40%] transition-transform duration-700 ease-(--ease-soft) group-hover:scale-[1.03]"
          />
          <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white/85 backdrop-blur-md">
            Généré par Cosmos
          </span>
        </div>
        <CardBody
          title="Vidéo de star"
          text="Une photo suffit : la personne de ton choix arrive en star, entre ses gardes du corps et des fans qui la filment."
          note={formatTokens(tokensFor("kling4"))}
          icon={<path d="M8 5.5v13a.8.8 0 0 0 1.2.7l10.4-6.5a.8.8 0 0 0 0-1.4L9.2 4.8a.8.8 0 0 0-1.2.7Z" />}
          action={<Cta>Créer ma vidéo de star</Cta>}
        />
      </ChatLink>

      <Link href="/statue" className={`${HERO_CARD} liquid-glass--interactive`}>
        <div className={VISUAL}>
          <video
            src="/exemples/statue-sculpteur.mp4"
            poster="/exemples/statue-sculpteur.jpg"
            aria-label="Un sculpteur taille une statue de marbre dans un atelier de la Renaissance"
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover"
          />
          <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white/85 backdrop-blur-md">
            Généré par Cosmos
          </span>
        </div>
        <CardBody
          title="Génération Historique"
          text="Les grands moments de l'histoire européenne, filmés : Michel-Ange sculptant la personne de votre choix, et d'autres à venir."
          note={formatTokens(tokensFor("statue"))}
          icon={<path d="M4 20h16M6 20V10M10 20V10M14 20V10M18 20V10M3.5 10h17M12 3.5 20 8H4l8-4.5Z" />}
          action={<Cta>Créer ma statue</Cta>}
        />
      </Link>
    </div>
  );
}

// Carte de la génération d'images, en largeur sous les effets de saison.
export function ImageGenerationCard() {
  return (
    <ChatLink
      kind="image"
      className="liquid-glass liquid-glass--interactive group flex flex-col rounded-[32px] p-2 md:flex-row md:gap-4"
    >
      <div className={`${VISUAL} md:w-[58%] md:shrink-0`}>
        <BeforeAfter before={IMAGE_EXAMPLE.before} after={IMAGE_EXAMPLE.after} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col md:py-2">
        <CardBody
          title="Génération Image & Photo"
          text="Une image ou une photo réaliste à partir de quelques mots, ou tes propres images transformées."
          note={formatTokens(tokensFor("image"))}
          icon={<path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-11ZM4 16l4.3-4.3a1.5 1.5 0 0 1 2.1 0L16 17.3M14 14l1.3-1.3a1.5 1.5 0 0 1 2.1 0L20 15.2M15.5 9.5h.01" />}
          action={<Cta>Créer une image</Cta>}
        />
      </div>
    </ChatLink>
  );
}

function CardBody({
  title,
  text,
  note,
  icon,
  action,
}: {
  title: string;
  text: string;
  note: string;
  icon: ReactNode;
  action: ReactNode;
}) {
  return (
    <>
      <div className="flex items-center gap-3.5 px-3 pt-5 sm:px-4">
        <span className="glass-icon shrink-0" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {icon}
          </svg>
        </span>
        <h2 className="text-2xl font-semibold leading-tight max-xs:text-xl">{title}</h2>
      </div>
      <p className="px-3 pt-4 leading-relaxed text-secondary sm:px-4">{text}</p>
      {/* Mobile : note au-dessus d'un bouton pleine largeur ; dès 640 px, sur
          une ligne. */}
      <div className="mt-auto flex flex-col gap-3 px-3 pb-3 pt-6 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:pb-4">
        <span className="whitespace-nowrap text-sm text-secondary">{note}</span>
        {action}
      </div>
    </>
  );
}

function Cta({ children }: { children: ReactNode }) {
  return (
    <span className="liquid-glass liquid-glass--accent inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full px-5 text-base font-semibold">
      {children}
      <svg viewBox="0 0 16 16" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-2 transition-transform duration-300 ease-(--ease-soft) group-hover:translate-x-0.5">
        <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
