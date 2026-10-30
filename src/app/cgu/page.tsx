import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { PRODUCT } from "@/config/product";

export const metadata: Metadata = { title: "Conditions générales" };

export default function CguPage() {
  return (
    <LegalPage title="Conditions générales d'utilisation et de vente">
      <h2>Le service</h2>
      <p>
        {PRODUCT.siteName} génère, par intelligence artificielle, une vidéo de{" "}
        {PRODUCT.videoDurationSeconds} secondes à partir d&apos;une ou deux photos
        fournies par l&apos;utilisateur. Le scénario de la vidéo est fixe.
      </p>
      <h2>Prix</h2>
      <p>Le service est en phase de test : aucun paiement n&apos;est demandé.</p>
      <h2>Photo et consentement</h2>
      <p>
        L&apos;utilisateur certifie être la personne représentée ou disposer de
        son accord explicite, et que cette personne est majeure. Les photos de
        mineurs apparents, de nudité ou de personnalités publiques sont refusées.
      </p>
      <h2>Droit de rétractation</h2>
      <p>
        [À compléter : renonciation au droit de rétractation pour un contenu
        numérique fourni immédiatement.]
      </p>
    </LegalPage>
  );
}
