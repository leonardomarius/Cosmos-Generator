import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountGate } from "@/components/AccountGate";
import { UploadForm } from "@/components/UploadForm";

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
        <AccountGate next="/creer" what="ta vidéo">
          {({ email, balance }) => <UploadForm email={email} balance={balance} />}
        </AccountGate>
      </Suspense>
    </div>
  );
}
