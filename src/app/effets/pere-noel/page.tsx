import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountGate } from "@/components/AccountGate";
import { SantaForm } from "@/components/SantaForm";
import { SANTA_EFFECT } from "@/config/effects";
import { availableVideoPurchases } from "@/lib/video-purchases";

export const metadata: Metadata = { title: SANTA_EFFECT.title, description: SANTA_EFFECT.subtitle };

const price = SANTA_EFFECT.priceEur.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

async function SantaOrder({ userId, email, balance }: { userId: string; email: string; balance: number }) {
  const purchases = await availableVideoPurchases(userId, SANTA_EFFECT.id);
  return <SantaForm email={email} balance={balance} purchases={purchases} />;
}

export default function SantaPage() {
  return (
    <div className="mx-auto max-w-xl px-5 pb-20 pt-14">
      <h1 className="text-title font-semibold">{SANTA_EFFECT.title}</h1>
      <p className="mt-3 text-lg text-secondary">
        {SANTA_EFFECT.seconds} secondes de magie : le Père Noël découvre le
        visage de ton enfant et sa liste de cadeaux, puis lui sourit.
      </p>
      <p className="mt-3 text-lg font-semibold">{price} à l&apos;unité, sans abonnement.</p>
      <Suspense fallback={<p className="mt-10 text-secondary">Chargement…</p>}>
        <AccountGate next={`/effets/${SANTA_EFFECT.slug}`} what="la vidéo du Père Noël" tokensRequired={false}>
          {(account) => <SantaOrder {...account} />}
        </AccountGate>
      </Suspense>
    </div>
  );
}
