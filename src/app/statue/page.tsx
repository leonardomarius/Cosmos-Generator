import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountGate } from "@/components/AccountGate";
import { StatueForm } from "@/components/StatueForm";

export const metadata: Metadata = { title: "Ta statue de la Renaissance" };

export default function StatuePage() {
  return (
    <div className="mx-auto max-w-xl px-5 pb-20 pt-14">
      <h1 className="text-title font-semibold">Ta statue de la Renaissance</h1>
      <p className="mt-3 text-lg text-secondary">
        Dans l&apos;atelier de Michel-Ange, la statue de marbre prend le visage de
        ton choix. Son corps et le reste de la vidéo ne changent pas.
      </p>
      <video
        src="/exemples/statue-sculpteur.mp4"
        poster="/exemples/statue-sculpteur.jpg"
        aria-label="Un sculpteur taille une statue de marbre dans un atelier de la Renaissance"
        autoPlay
        muted
        loop
        playsInline
        className="mt-8 aspect-video w-full rounded-[24px] bg-foreground/8 object-cover"
      />
      <p className="mt-8 text-lg text-secondary">
        Deux photos du même visage : l&apos;une de face, l&apos;autre de profil.
        Choisis des photos nettes, à la lumière du jour, sans lunettes de soleil
        ni casquette.
      </p>
      <Suspense fallback={<p className="mt-10 text-secondary">Chargement…</p>}>
        <AccountGate next="/statue" what="ta statue">
          {({ email, balance, upsell }) => <StatueForm email={email} balance={balance} upsell={upsell} />}
        </AccountGate>
      </Suspense>
    </div>
  );
}
