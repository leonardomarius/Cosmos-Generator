"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { BillingInterval } from "@/config/product";

// Résiliation de l'abonnement Mollie, après confirmation.
export function CancelButton({ until, interval }: { until: string | null; interval: BillingInterval }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cancel() {
    const keep = !until
      ? ""
      : interval === "year"
        ? ` L'année en cours n'est pas remboursée : tes tokens restent rechargés chaque mois jusqu'au ${until}.`
        : ` Tu gardes tes tokens d'abonnement jusqu'au ${until}.`;
    if (!window.confirm(`Résilier ton abonnement ?${keep} Tes tokens achetés sont conservés.`)) return;
    setError(null);
    setPending(true);
    const res = await fetch("/api/billing/cancel", { method: "POST" });
    setPending(false);
    if (!res.ok) {
      setError((await res.json()).error);
      return;
    }
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={cancel}
        disabled={pending}
        className="min-h-11 text-left text-sm text-secondary underline underline-offset-4 disabled:opacity-60"
      >
        {pending ? "Résiliation…" : "Résilier mon abonnement"}
      </button>
      {error && <p className="text-base text-red-700 sm:text-sm">{error}</p>}
    </>
  );
}
