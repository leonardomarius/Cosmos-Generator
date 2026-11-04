import type { Metadata } from "next";
import { Suspense } from "react";
import { BlindVote } from "@/components/BlindVote";
import { loadCampaignPairs } from "@/lib/presets/lab";
import { CAMPAIGN_ID } from "@/lib/presets/vote";

export const metadata: Metadata = { title: "Ton avis sur ces vidéos", robots: { index: false } };

// Page du benchmark à l'aveugle, ouverte par un lien secret envoyé aux votants.
export default function VotePage({ params }: PageProps<"/lab/vote/[id]">) {
  return (
    <div className="mx-auto max-w-3xl px-5 pb-20 pt-14">
      <h1 className="text-title font-semibold">Ton avis sur ces vidéos</h1>
      <p className="mt-3 text-lg text-secondary">
        Chaque paire montre la même personne, dans deux vidéos créées par deux
        réglages différents. Regarde-les en entier, puis note chacune de 1
        (raté) à 5 (parfait). Il n&apos;y a pas de bonne réponse.
      </p>
      <Suspense fallback={<p className="mt-10 text-secondary">Chargement…</p>}>
        {params.then(({ id }) => (
          <Campaign id={id} />
        ))}
      </Suspense>
    </div>
  );
}

async function Campaign({ id }: { id: string }) {
  const pairs = CAMPAIGN_ID.test(id) ? await loadCampaignPairs(id).catch((err) => (console.error(err), null)) : null;
  if (!pairs) {
    return <p className="liquid-glass mt-10 rounded-[28px] p-6 text-center text-secondary">Ce vote est terminé. Merci !</p>;
  }
  return <BlindVote campaignId={id} pairs={pairs} />;
}
