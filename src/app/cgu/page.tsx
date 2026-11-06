import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { SANTA_EFFECT } from "@/config/effects";
import { MODELS, PLANS, PRODUCT, TOKEN_PACKS, formatTokens, type PackId, type PlanId } from "@/config/product";

export const metadata: Metadata = { title: "Conditions générales" };

const planIds = Object.keys(PLANS) as PlanId[];
const euros = (n: number) => n.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

export default function CguPage() {
  return (
    <LegalPage title="Conditions générales d'utilisation et de vente">
      <h2>Le service</h2>
      <p>
        {PRODUCT.siteName} génère, par intelligence artificielle, des images et
        des vidéos à partir d&apos;une description et, si l&apos;utilisateur le
        souhaite, d&apos;images qu&apos;il fournit. Il propose aussi des vidéos de
        référence au scénario fixe : l&apos;une de {PRODUCT.videoDurationSeconds}{" "}
        secondes, où la personne d&apos;une ou deux photos fournies par
        l&apos;utilisateur remplace le personnage principal, l&apos;autre de{" "}
        {MODELS.statue.seconds} secondes, où une statue prend le visage de deux
        photos fournies par l&apos;utilisateur. S&apos;y ajoutent des effets de
        saison au scénario fixe, comme la vidéo du Père Noël.
      </p>
      <h2>Prix</h2>
      <p>
        Les générations se paient en tokens. Les prix sont indiqués toutes taxes
        comprises et le paiement est assuré par Mollie. Trois offres sont
        proposées :
      </p>
      <ul>
        <li>
          Abonnement mensuel, prélevé chaque mois :{" "}
          {planIds.map((id) => `${PLANS[id].label}, ${euros(PLANS[id].priceEur)} pour ${formatTokens(PLANS[id].monthlyTokens)} par mois`).join(" ; ")}.
        </li>
        <li>
          Abonnement annuel, payé en une fois pour l&apos;année et renouvelé
          chaque année :{" "}
          {planIds.map((id) => `${PLANS[id].label}, ${euros(PLANS[id].annualPriceEur)} pour ${formatTokens(PLANS[id].monthlyTokens)} par mois`).join(" ; ")}.
        </li>
        <li>
          Achat unique, sans abonnement :{" "}
          {(Object.keys(TOKEN_PACKS) as PackId[]).map((id) => `${formatTokens(TOKEN_PACKS[id].tokens)} pour ${euros(TOKEN_PACKS[id].priceEur)}`).join(" ; ")}.
        </li>
      </ul>
      <p>
        Les tokens d&apos;abonnement sont rechargés chaque mois au quota du plan,
        y compris sur l&apos;abonnement annuel : les tokens non utilisés ne sont pas
        reportés. Les tokens achetés n&apos;expirent pas et sont conservés après la
        fin d&apos;un abonnement. Les tokens d&apos;abonnement sont dépensés en premier.
      </p>
      <p>
        La vidéo du Père Noël s&apos;achète aussi à l&apos;unité, sans abonnement ni
        tokens, pour {euros(SANTA_EFFECT.priceEur)}. Ce paiement donne droit à une
        vidéo et ne crédite aucun token.
      </p>
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
