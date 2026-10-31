import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { PRODUCT, supportEmail } from "@/config/product";

export const metadata: Metadata = { title: "Politique de confidentialité" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Politique de confidentialité">
      <h2>Données collectées</h2>
      <p>
        Adresse email, photo envoyée, informations de commande. Les données de
        carte bancaire sont traitées uniquement par Mollie.
      </p>
      <h2>Finalité</h2>
      <p>
        Générer et livrer la vidéo commandée, gérer le paiement et les
        éventuels remboursements.
      </p>
      <h2>Durée de conservation</h2>
      <p>
        Les photos et vidéos sont supprimées automatiquement sous{" "}
        {PRODUCT.retentionDays} jours. Les données de facturation sont
        conservées selon les obligations légales.
      </p>
      <h2>Sous-traitants</h2>
      <p>
        Supabase (données), Mollie (paiement), fal.ai (génération vidéo),
        service de modération d&apos;images, Vercel (hébergement), service
        d&apos;envoi d&apos;emails.
      </p>
      <h2>Vos droits</h2>
      <p>
        Accès, rectification, effacement : écrire à {supportEmail()}.
        Réclamation possible auprès de la CNIL.
      </p>
    </LegalPage>
  );
}
