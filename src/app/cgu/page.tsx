import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { PRODUCT, formatPrice } from "@/config/product";

export const metadata: Metadata = { title: "Conditions générales" };

export default function CguPage() {
  return (
    <LegalPage title="Conditions générales d'utilisation et de vente">
      <h2>Le service</h2>
      <p>
        {PRODUCT.siteName} génère, par intelligence artificielle, une vidéo de{" "}
        {PRODUCT.videoDurationSeconds} secondes à partir d&apos;une photo
        fournie par l&apos;utilisateur. Le scénario de la vidéo est fixe.
      </p>
      <h2>Prix et paiement</h2>
      <p>Le prix est de {formatPrice()} TTC par vidéo, payable par carte via Stripe.</p>
      <h2>Photo et consentement</h2>
      <p>
        L&apos;utilisateur certifie être la personne représentée ou disposer de
        son accord explicite, et que cette personne est majeure. Les photos de
        mineurs apparents, de nudité ou de personnalités publiques sont refusées.
      </p>
      <h2>Échec et remboursement</h2>
      <p>Si la génération échoue, le paiement est remboursé automatiquement.</p>
      <h2>Droit de rétractation</h2>
      <p>
        [À compléter : renonciation au droit de rétractation pour un contenu
        numérique fourni immédiatement.]
      </p>
    </LegalPage>
  );
}
