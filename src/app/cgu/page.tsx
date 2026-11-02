import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { PRODUCT } from "@/config/product";

export const metadata: Metadata = { title: "Conditions générales" };

export default function CguPage() {
  return (
    <LegalPage title="Conditions générales d'utilisation et de vente">
      <h2>Le service</h2>
      <p>
        {PRODUCT.siteName} génère, par intelligence artificielle, des images et
        des vidéos à partir d&apos;une description et, si l&apos;utilisateur le
        souhaite, d&apos;images qu&apos;il fournit. Il propose aussi des vidéos de
        référence de {PRODUCT.videoDurationSeconds} secondes, au scénario fixe,
        où la personne d&apos;une ou deux photos fournies par l&apos;utilisateur
        remplace le personnage principal, et des effets de saison au scénario
        fixe, comme la vidéo du Père Noël.
      </p>
      <h2>Prix</h2>
      <p>Le service est en phase de test : aucun paiement n&apos;est demandé.</p>
      <h2>Photo et consentement</h2>
      <p>
        L&apos;utilisateur certifie être la personne représentée ou disposer de
        son accord explicite, et que cette personne est majeure. Les photos de
        mineurs apparents, de nudité ou de personnalités publiques sont refusées.
      </p>
      <p>
        Seule exception : la vidéo du Père Noël, réalisée à partir de la photo
        du visage d&apos;un enfant. Elle est réservée à son parent ou à son
        représentant légal, qui le certifie avant l&apos;envoi. Cette photo ne
        sert qu&apos;à créer la vidéo demandée et est supprimée dans les mêmes
        délais que les autres.
      </p>
      <h2>Droit de rétractation</h2>
      <p>
        [À compléter : renonciation au droit de rétractation pour un contenu
        numérique fourni immédiatement.]
      </p>
    </LegalPage>
  );
}
