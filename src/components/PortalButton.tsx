"use client";

import { useState } from "react";

// Ouvre le portail Stripe : changer de plan, de carte, factures, résiliation.
export function PortalButton() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function open() {
    setError(null);
    setPending(true);
    const res = await fetch("/api/billing/portal", { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setPending(false);
      setError(data.error);
      return;
    }
    window.location.assign(data.url);
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        disabled={pending}
        className="liquid-glass liquid-glass--interactive rounded-full px-5 py-3 font-semibold disabled:opacity-60"
      >
        {pending ? "Redirection…" : "Gérer mon abonnement"}
      </button>
      {error && <p className="text-sm text-red-300">{error}</p>}
    </>
  );
}
