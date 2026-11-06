import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { PRODUCT, supportEmail } from "@/config/product";

export const metadata: Metadata = { title: "Politique de confidentialité" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Politique de confidentialité">
      <h2>Données collectées</h2>
      <p>
        Adresse email, photo envoyée, mensurations si elles sont renseignées,
        informations de commande. Les données de carte bancaire sont traitées
        uniquement par Mollie.
      </p>
      <h2>Finalité</h2>
      <p>
        Générer et livrer les images et vidéos commandées, gérer le paiement et les
        éventuels remboursements.
      </p>
      <h2>Durée de conservation</h2>
      <p>
        Les photos, images et vidéos sont supprimées automatiquement sous{" "}
        {PRODUCT.retentionDays} jours. Les données de facturation sont
        conservées selon les obligations légales.
      </p>
      <p>
        Les mensurations, facultatives, ne sont pas enregistrées dans notre base
        de données : elles sont transmises à fal.ai avec la demande de génération,
        et peuvent rester jusqu&apos;à 90 jours dans l&apos;historique de ce service.
      </p>
      <p>
        Pour un achat à l&apos;unité de la vidéo du Père Noël, la photo reste dans
        le navigateur du client pendant le paiement et n&apos;est envoyée
        qu&apos;une fois celui-ci confirmé. Elle y est effacée dès que la vidéo est
        créée ou, si le paiement est abandonné, à la première visite après 24 heures.
      </p>
      <h2>Sous-traitants</h2>
      <p>
        Supabase (données), Mollie (paiement), fal.ai (génération d&apos;images et de vidéos),
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
