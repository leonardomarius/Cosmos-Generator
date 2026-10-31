import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { UploadForm } from "@/components/UploadForm";
import { currentUser } from "@/lib/supabase";
import { getAccount, hasActiveSubscription } from "@/lib/tokens";

export const metadata: Metadata = { title: "Créer ma vidéo" };

export default function CreatePage() {
  return (
    <div className="mx-auto max-w-xl px-5 pb-20 pt-14">
      <h1 className="text-title font-semibold">Créer ma vidéo</h1>
      <p className="mt-3 text-lg text-secondary">
        Une photo du proche en pied, de face, avec tout le corps visible,
        à la lumière du jour et seul sur la photo. En option, un gros plan de
        son visage. Évite lunettes de soleil, casquette et photos floues :
        plus la photo est nette, plus la vidéo lui ressemble.
      </p>
      <Suspense fallback={<p className="mt-10 text-secondary">Chargement…</p>}>
        <CreateGate />
      </Suspense>
    </div>
  );
}

// Le formulaire n'apparaît qu'aux comptes connectés qui ont des tokens
// (ou un abonnement en cours, pour voir leur solde même à 0).
async function CreateGate() {
  const user = await currentUser();
  if (!user?.email) {
    return <Gate text="Connecte-toi pour créer ta vidéo." href="/connexion?next=/creer" label="Se connecter" />;
  }
  const account = await getAccount(user.id);
  if (!hasActiveSubscription(account) && account.balance === 0) {
    return (
      <Gate
        text="Choisis un abonnement : tes tokens sont rechargés chaque mois."
        href="/abonnement"
        label="Voir les abonnements"
      />
    );
  }
  return <UploadForm email={user.email} balance={account.balance} />;
}

function Gate({ text, href, label }: { text: string; href: string; label: string }) {
  return (
    <div className="liquid-glass mt-10 space-y-5 rounded-[28px] p-6 text-center">
      <p className="text-secondary">{text}</p>
      <Link
        href={href}
        className="liquid-glass liquid-glass--interactive liquid-glass--accent inline-block rounded-full px-6 py-3 font-semibold"
      >
        {label}
      </Link>
    </div>
  );
}
