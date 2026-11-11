"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// Interrupteur et plafond du jour de l'offre de bienvenue (/admin), appliqués
// tout de suite, sans redéploiement.
export function AdminPromoControls({
  enabled,
  adminDailyBudget,
  envDailyBudget,
}: {
  enabled: boolean;
  adminDailyBudget: number | null;
  envDailyBudget: number;
}) {
  const router = useRouter();
  const [budget, setBudget] = useState(adminDailyBudget === null ? "" : String(adminDailyBudget));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(patch: { enabled?: boolean; dailyBudget?: number | null }) {
    setSaving(true);
    setError(null);
    const res = await fetch("/api/admin/promo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const data = await res.json().catch(() => ({ error: "Enregistrement impossible." }));
    setSaving(false);
    if (!res.ok) setError(data.error);
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <button
        type="button"
        disabled={saving}
        onClick={() => {
          if (!enabled || confirm("Couper l'offre de bienvenue tout de suite ?")) save({ enabled: !enabled });
        }}
        className={`liquid-glass liquid-glass--interactive w-full rounded-full py-3 text-base font-semibold disabled:opacity-60 ${enabled ? "" : "liquid-glass--accent"}`}
      >
        {enabled ? "Couper l'offre maintenant" : "Rouvrir l'offre"}
      </button>

      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          save({ dailyBudget: budget.trim() === "" ? null : Number(budget) });
        }}
      >
        <label className="min-w-0 flex-1 text-sm text-secondary">
          Cadeaux par jour au maximum (vide : {envDailyBudget}, valeur de FREE_DAILY_BUDGET)
          <input
            type="number"
            min={0}
            inputMode="numeric"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder={String(envDailyBudget)}
            className="mt-2 block w-full rounded-2xl border border-foreground/15 bg-white/80 px-4 py-2.5 text-base text-foreground focus:border-foreground/40 focus:outline-none"
          />
        </label>
        <button
          type="submit"
          disabled={saving}
          className="liquid-glass liquid-glass--interactive min-h-11 rounded-full px-5 text-sm font-semibold disabled:opacity-60"
        >
          Enregistrer
        </button>
      </form>

      {error && (
        <p className="rounded-2xl border border-red-600/20 bg-red-500/10 px-4 py-3 text-sm text-red-700">{error}</p>
      )}
    </div>
  );
}
