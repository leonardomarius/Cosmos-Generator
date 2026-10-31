"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// Résiliation de l'abonnement Mollie, après confirmation.
export function CancelButton({ until }: { until: string | null }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cancel() {
    const keep = until ? ` Tu gardes tes tokens jusqu'au ${until}.` : "";
    if (!window.confirm(`Résilier ton abonnement ?${keep}`)) return;
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
        className="liquid-glass liquid-glass--interactive rounded-full px-5 py-3 font-semibold disabled:opacity-60"
      >
        {pending ? "Résiliation…" : "Résilier"}
      </button>
      {error && <p className="text-sm text-red-300">{error}</p>}
    </>
  );
}
