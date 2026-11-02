import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountGate } from "@/components/AccountGate";
import { SantaForm } from "@/components/SantaForm";
import { SANTA_EFFECT } from "@/config/effects";

export const metadata: Metadata = { title: SANTA_EFFECT.title, description: SANTA_EFFECT.subtitle };

export default function SantaPage() {
  return (
    <div className="mx-auto max-w-xl px-5 pb-20 pt-14">
      <h1 className="text-title font-semibold">{SANTA_EFFECT.title}</h1>
      <p className="mt-3 text-lg text-secondary">
        {SANTA_EFFECT.seconds} secondes de magie : les lutins font les fous dans
        le QG du Père Noël, puis le Père Noël découvre le visage de ton enfant
        et sa liste de cadeaux dans son cadre magique, et lui fait un sourire
        complice. La vidéo est personnalisée avec la photo et la liste que tu
        donnes ici.
      </p>
      <Suspense fallback={<p className="mt-10 text-secondary">Chargement…</p>}>
        <AccountGate next={`/effets/${SANTA_EFFECT.slug}`} what="la vidéo du Père Noël">
          {({ email, balance }) => <SantaForm email={email} balance={balance} />}
        </AccountGate>
      </Suspense>
    </div>
  );
}
