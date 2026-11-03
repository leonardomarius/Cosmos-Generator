import type { ReactNode } from "react";
import { ChatLink } from "@/components/ChatLink";
import { BeforeAfter } from "@/components/BeforeAfter";
import { exampleVideoSources } from "@/components/ExampleVideo";
import { IMAGE_EXAMPLE } from "@/config/examples";
import { VIDEO_DURATIONS, formatTokens, tokensFor } from "@/config/product";
import type { GenerationKind } from "@/lib/chat-draft";

// Hero de l'accueil : les deux services côte à côte (empilés sur mobile),
// même gabarit et même poids. Chaque carte ouvre le chat dans son mode.
export function GenerationCards() {
  const video = exampleVideoSources();

  return (
    <div className="grid gap-5 md:grid-cols-2 md:grid-rows-[auto_auto_1fr_auto]">
      <GenerationCard
        kind="video"
        title="Génération Vidéo"
        text={`Décris une scène, Cosmos la filme : de ${VIDEO_DURATIONS[0]} à ${VIDEO_DURATIONS.at(-1)} secondes, en portrait, paysage ou carré.`}
        price={`Dès ${formatTokens(tokensFor("prompt", VIDEO_DURATIONS[0]))}`}
        cta="Créer une vidéo"
        icon={<path d="M8 5.5v13a.8.8 0 0 0 1.2.7l10.4-6.5a.8.8 0 0 0 0-1.4L9.2 4.8a.8.8 0 0 0-1.2.7Z" />}
        visual={
          video ? (
            <>
              <video
                src={video.src}
                poster={video.poster}
                autoPlay
                muted
                loop
                playsInline
                className="h-full w-full object-cover object-[50%_42%] transition-transform duration-700 ease-(--ease-soft) group-hover:scale-[1.03]"
              />
              <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white/85 backdrop-blur-md">
                Généré par Cosmos
              </span>
            </>
          ) : (
            <span className="hero-mesh hero-mesh--video" />
          )
        }
      />
      <GenerationCard
        kind="image"
        title="Génération Image & Photo"
        text="Une image ou une photo réaliste à partir de quelques mots, ou tes propres images transformées."
        price={formatTokens(tokensFor("image"))}
        cta="Créer une image"
        icon={<path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-11ZM4 16l4.3-4.3a1.5 1.5 0 0 1 2.1 0L16 17.3M14 14l1.3-1.3a1.5 1.5 0 0 1 2.1 0L20 15.2M15.5 9.5h.01" />}
        visual={<BeforeAfter before={IMAGE_EXAMPLE.before} after={IMAGE_EXAMPLE.after} />}
      />
    </div>
  );
}

function GenerationCard({
  kind,
  title,
  text,
  price,
  cta,
  icon,
  visual,
}: {
  kind: GenerationKind;
  title: string;
  text: string;
  price: string;
  cta: string;
  icon: ReactNode;
  visual: ReactNode;
}) {
  // Côte à côte, les deux cartes partagent les rangées de la grille
  // (subgrid) : titres, textes et boutons restent alignés, même quand un
  // titre passe sur deux lignes.
  return (
    <ChatLink
      kind={kind}
      className="liquid-glass liquid-glass--interactive group flex flex-col rounded-[32px] p-2 md:row-span-4 md:grid md:grid-rows-subgrid md:gap-y-0"
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-[24px] bg-foreground/8">{visual}</div>
      <div className="flex items-center gap-3.5 px-3 pt-5 sm:px-4">
        <span className="glass-icon shrink-0" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {icon}
          </svg>
        </span>
        <h2 className="text-2xl font-semibold leading-tight max-xs:text-xl">{title}</h2>
      </div>
      <p className="px-3 pt-4 leading-relaxed text-secondary sm:px-4">{text}</p>
      {/* Mobile : prix au-dessus d'un bouton pleine largeur ; dès 640 px,
          sur une ligne. */}
      <div className="mt-auto flex flex-col gap-3 px-3 pb-3 pt-6 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:pb-4">
        <span className="whitespace-nowrap text-sm text-secondary">{price}</span>
        <span className="liquid-glass liquid-glass--accent inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full px-5 text-base font-semibold">
          {cta}
          <svg viewBox="0 0 16 16" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-2 transition-transform duration-300 ease-(--ease-soft) group-hover:translate-x-0.5">
            <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    </ChatLink>
  );
}
