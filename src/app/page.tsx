import { Suspense, ViewTransition } from "react";
import { GenerationCards, ImageGenerationCard } from "@/components/GenerationCards";
import { WelcomeSlot, WelcomeSlotPlaceholder } from "@/components/WelcomeSlot";
import { PromptStudio } from "@/components/PromptStudio";
import { supportEmail } from "@/config/product";
import { currentUser } from "@/lib/supabase";
import { getAccount, hasPaid } from "@/lib/tokens";

// Passage au chat (14e caractère tapé, ou une carte du hero) : la page
// s'efface vers le haut pendant que le chat arrive (globals.css).
export default function Home() {
  return (
    <ViewTransition exit={{ "to-chat": "home-exit", default: "none" }} default="none">
      <div className="mx-auto max-w-5xl px-5 pb-20 pt-14 sm:pt-20">
        <Suspense fallback={<WelcomeSlotPlaceholder />}>
          <WelcomeSlot />
        </Suspense>
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

        <section className="mt-section">
          <ImageGenerationCard />
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
      </div>
    </ViewTransition>
  );
}

// Le générateur connaît le compte : non connecté, il propose de se connecter.
async function StudioGate() {
  const user = await currentUser();
  if (!user?.email) return <PromptStudio email={null} balance={0} />;
  const [account, paid] = await Promise.all([getAccount(user.id), hasPaid(user.id)]);
  return (
    <PromptStudio
      email={user.email}
      balance={account.balance}
      suspendedContact={account.blocked ? supportEmail() : null}
      upsell={!paid}
    />
  );
}
