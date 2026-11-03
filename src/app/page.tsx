import Link from "next/link";
import { Suspense, ViewTransition } from "react";
import { ExampleVideo } from "@/components/ExampleVideo";
import { GenerationCards } from "@/components/GenerationCards";
import { PromptStudio } from "@/components/PromptStudio";
import { EFFECTS } from "@/config/effects";
import { PRODUCT, formatTokens, tokensFor } from "@/config/product";
import { currentUser } from "@/lib/supabase";
import { getAccount } from "@/lib/tokens";

const STEPS = [
  { title: "1. Les photos", text: "Envoie 1 ou 2 photos nettes du proche à faire apparaître." },
  { title: "2. Génération", text: "Cosmos le place dans la vidéo, dans la même pose et la même tenue." },
  { title: "3. La vidéo", text: "Prête en quelques minutes, à regarder et télécharger." },
];

// Icônes décoratives des étapes (même ordre que STEPS).
const STEP_ICONS = [
  <path key="photo" d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0" />,
  <path key="pay" d="M3 7.5A1.5 1.5 0 0 1 4.5 6h15A1.5 1.5 0 0 1 21 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 16.5v-9ZM3 10h18M7 14.5h4" />,
  <path key="video" d="M8 5.5v13a.8.8 0 0 0 1.2.7l10.4-6.5a.8.8 0 0 0 0-1.4L9.2 4.8a.8.8 0 0 0-1.2.7Z" />,
];

// Passage au chat (14e caractère tapé, ou une carte du hero) : la page
// s'efface vers le haut pendant que le chat arrive (globals.css).
export default function Home() {
  return (
    <ViewTransition exit={{ "to-chat": "home-exit", default: "none" }} default="none">
      <div className="mx-auto max-w-5xl px-5 pb-20 pt-14 sm:pt-20">
        <section>
          <h1 className="text-center text-display font-semibold">Imagine-le, on le génère</h1>
          <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-relaxed text-secondary sm:text-xl">
            Une image ou une vidéo à partir de quelques mots, avec tes propres
            images si tu veux.
          </p>
          <div className="mt-10">
            <GenerationCards />
          </div>
        </section>

        <section className="mx-auto mt-section max-w-3xl">
          <h2 className="text-center text-title font-semibold">Écris ton idée</h2>
          <p className="mt-4 text-center text-lg leading-relaxed text-secondary">
            Commence à la décrire ici, la suite s&apos;écrit dans le chat.
          </p>
          <div className="mt-10">
            <Suspense fallback={<div className="liquid-glass min-h-80 rounded-[32px]" aria-busy="true" />}>
              <StudioGate />
            </Suspense>
          </div>
        </section>

        <section className="mt-section">
          <h2 className="text-center text-title font-semibold md:text-left">Effets de saison</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {EFFECTS.map((effect) => (
              <Link
                key={effect.slug}
                href={`/effets/${effect.slug}`}
                className="liquid-glass liquid-glass--interactive block rounded-[28px] p-6"
              >
                <h3 className="text-xl font-semibold">{effect.title}</h3>
                <p className="mt-2 leading-relaxed text-secondary">{effect.subtitle}</p>
                <p className="mt-5 text-sm font-semibold">Créer · {formatTokens(effect.tokens)}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-section">
          <h2 className="text-center text-title font-semibold md:text-left">Vidéos de référence</h2>
          <div className="mt-10 flex flex-col items-center gap-14 md:flex-row md:items-center md:justify-between">
            <div className="max-w-lg text-center md:text-left">
              <p className="text-2xl font-semibold">{PRODUCT.tagline}</p>
              <p className="mt-6 text-lg leading-relaxed text-secondary sm:text-xl">
                Une vidéo de {PRODUCT.videoDurationSeconds} secondes où ton proche
                devient la star. 1 ou 2 photos suffisent, aucun texte à écrire.
              </p>
              <div className="mt-10 flex flex-col items-center gap-4 md:items-start">
                <Link
                  href="/creer"
                  className="liquid-glass liquid-glass--interactive liquid-glass--accent w-full text-balance rounded-full px-4 py-4 text-base font-semibold sm:w-auto sm:px-8 sm:text-lg"
                >
                  Utiliser cette vidéo · {formatTokens(tokensFor("kling4"))}
                </Link>
                <p className="text-xs text-tertiary">
                  Vidéo disponible {PRODUCT.retentionDays} jours · Photos
                  supprimées sous {PRODUCT.retentionDays} jours
                </p>
              </div>
            </div>
            <ExampleVideo />
          </div>

          <div className="mt-16 grid gap-5 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <div
                key={step.title}
                className="liquid-glass liquid-glass--interactive cursor-default rounded-[28px] p-6"
              >
                <span className="glass-icon mb-5" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {STEP_ICONS[i]}
                  </svg>
                </span>
                <h3 className="text-[17px] font-semibold">{step.title}</h3>
                <p className="mt-2 text-base leading-relaxed text-secondary sm:text-sm">{step.text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </ViewTransition>
  );
}

// Le générateur connaît le compte : non connecté, il propose de se connecter.
async function StudioGate() {
  const user = await currentUser();
  if (!user?.email) return <PromptStudio email={null} balance={0} />;
  const account = await getAccount(user.id);
  return <PromptStudio email={user.email} balance={account.balance} />;
}
