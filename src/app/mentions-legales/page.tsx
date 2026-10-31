import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { supportEmail } from "@/config/product";

export const metadata: Metadata = { title: "Mentions légales" };

export default function LegalNoticePage() {
  return (
    <LegalPage title="Mentions légales">
      <h2>Éditeur</h2>
      <p>[Nom ou raison sociale] — [Adresse] — [SIRET] — {supportEmail()}</p>
      <h2>Directeur de la publication</h2>
      <p>[Nom]</p>
      <h2>Hébergeur</h2>
      <p>Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.</p>
      <h2>Intelligence artificielle</h2>
      <p>
        Les vidéos produites sur ce site sont générées par intelligence
        artificielle et portent la mention « Généré par IA ».
      </p>
    </LegalPage>
  );
}
