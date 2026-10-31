"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PLANS, VIDEO_MODELS, type PlanId } from "@/config/product";

const VIDEO_TOKENS = VIDEO_MODELS.kling4.tokens;
const euros = (n: number) => n.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

export function PlanPicker() {
  const router = useRouter();
  const [waiver, setWaiver] = useState(false);
  const [pending, setPending] = useState<PlanId | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function choose(plan: PlanId) {
    setError(null);
    setPending(plan);
    const res = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan, waiver }),
    });
    const data = await res.json();
    if (res.status === 401) {
      router.push("/connexion?next=/abonnement");
      return;
    }
    if (!res.ok) {
      setPending(null);
      setError(data.error);
      return;
    }
    // Page de paiement Mollie, ou le compte après un changement de plan.
    window.location.assign(data.url);
  }

  return (
    <div className="mt-10 space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {(Object.keys(PLANS) as PlanId[]).map((id) => {
          const plan = PLANS[id];
          const videos = plan.monthlyTokens / VIDEO_TOKENS;
          return (
            <div key={id} className="liquid-glass flex flex-col rounded-[28px] p-6">
              <h2 className="text-xl font-semibold">{plan.label}</h2>
              <p className="mt-3 text-3xl font-semibold">
                {euros(plan.priceEur)}
                <span className="text-base font-normal text-secondary"> / mois</span>
              </p>
              <p className="mt-3 text-secondary">
                {plan.monthlyTokens} tokens par mois, soit {videos} vidéo{videos > 1 ? "s" : ""}
                {" "}({euros(plan.priceEur / videos)} la vidéo)
              </p>
              <button
                type="button"
                onClick={() => choose(id)}
                disabled={!waiver || pending !== null}
                className="liquid-glass liquid-glass--interactive liquid-glass--accent mt-6 rounded-full py-3 font-semibold disabled:opacity-60 disabled:saturate-50"
              >
                {pending === id ? "Redirection…" : "Choisir"}
              </button>
            </div>
          );
        })}
      </div>

      <label className="liquid-glass flex items-start gap-3 rounded-[24px] p-5 text-sm leading-relaxed text-secondary">
        <input
          type="checkbox"
          checked={waiver}
          onChange={(e) => setWaiver(e.target.checked)}
          className="mt-1 h-4 w-4 accent-orange-500"
        />
        <span>
          Je demande l&apos;accès immédiat à mes tokens et je renonce à mon droit
          de rétractation de 14 jours pour ce contenu numérique.
        </span>
      </label>

      {error && (
        <p className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>
      )}
    </div>
  );
}
