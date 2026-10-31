import type { Metadata } from "next";
import { PlanPicker } from "@/components/PlanPicker";

export const metadata: Metadata = { title: "Abonnements" };

export default function PlansPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 pb-20 pt-14">
      <h1 className="text-title font-semibold">Abonnements</h1>
      <p className="mt-3 max-w-2xl text-lg text-secondary">
        Tes tokens sont rechargés chaque mois, à la date de ton abonnement. Les
        tokens non utilisés ne sont pas reportés. Si une vidéo échoue, ses
        tokens te sont rendus. Résiliable à tout moment depuis ton compte.
      </p>
      <PlanPicker />
      <p className="mt-6 text-sm text-secondary">Prix TTC. Paiement sécurisé par Mollie (carte ou prélèvement SEPA).</p>
    </div>
  );
}
