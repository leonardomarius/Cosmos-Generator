import type { Metadata } from "next";
import Link from "next/link";
import { EFFECTS } from "@/config/effects";
import { formatTokens } from "@/config/product";

// Page des offres de Noël. Aucun lien depuis l'accueil : on y arrive par un
// lien partagé (réseaux, emails…).
export const metadata: Metadata = {
  title: "Offres de Noël",
  description: "Les vidéos de Noël à offrir, prêtes tout de suite et envoyées par email.",
};

export default function ChristmasPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 pb-20 pt-14 sm:pt-20">
      <h1 className="text-center text-display font-semibold">Offres de Noël</h1>
      <div className="mt-10 grid gap-5">
        {EFFECTS.map((effect) => (
          <Link
            key={effect.slug}
            href={`/effets/${effect.slug}`}
            className="liquid-glass liquid-glass--interactive group flex flex-col items-center gap-8 rounded-[32px] p-2 md:flex-row-reverse md:justify-between md:gap-14 md:pl-10 md:pr-6 md:py-6"
          >
            <div className="relative aspect-[9/16] w-full max-w-[min(20rem,calc(85dvh*9/16))] shrink-0 overflow-hidden rounded-[24px] bg-foreground/8">
              <video
                src={effect.preview.video}
                poster={effect.preview.poster}
                autoPlay
                muted
                loop
                playsInline
                className="h-full w-full object-cover"
              />
            </div>
            <div className="w-full px-3 pb-3 text-center sm:px-4 sm:pb-4 md:max-w-lg md:p-0 md:text-left">
              <h2 className="text-2xl font-semibold leading-tight">{effect.title}</h2>
              <p className="mt-4 text-lg leading-relaxed text-secondary">{effect.pitch}</p>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-5 md:justify-start">
                <span className="liquid-glass liquid-glass--accent inline-flex min-h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-full px-5 text-base font-semibold sm:w-auto">
                  Créer sa vidéo
                  <svg viewBox="0 0 16 16" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-2 transition-transform duration-300 ease-(--ease-soft) group-hover:translate-x-0.5">
                    <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="whitespace-nowrap text-sm text-secondary">{formatTokens(effect.tokens)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
