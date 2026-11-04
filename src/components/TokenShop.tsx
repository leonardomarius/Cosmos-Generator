"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import {
  ANNUAL_FREE_MONTHS,
  PLANS,
  TOKEN_PACKS,
  annualPricePerMonthEur,
  formatTokens,
  packMonthlySavingEur,
  planPriceEur,
  tokensFor,
  type BillingInterval,
  type PackId,
  type PlanId,
} from "@/config/product";

// Abonné en cours, null pour un visiteur ou un client sans abonnement.
export type ShopViewer = {
  plan: PlanId;
  interval: BillingInterval;
  canceled: boolean;
  nextPlan: PlanId | null;
  nextInterval: BillingInterval | null;
  // Fin de la période payée, déjà formatée ("12 mars 2027").
  periodEnd: string;
};

// Exemples de ce que permet une offre : vidéos par prompt de 10 s, ou images.
const VIDEO_TOKENS = tokensFor("prompt", 10);
const IMAGE_TOKENS = tokensFor("image");
const euros = (n: number) => n.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

function capacity(tokens: number): string {
  const videos = Math.floor(tokens / VIDEO_TOKENS);
  const images = Math.floor(tokens / IMAGE_TOKENS);
  return `jusqu'à ${videos} vidéo${videos > 1 ? "s" : ""} de 10 s ou ${images} image${images > 1 ? "s" : ""}`;
}

type PlanAction = { label: string; note?: string; disabled?: boolean };

// Ce que fait le bouton d'un plan, selon l'abonnement en cours (mêmes règles
// que changePlan dans src/lib/mollie.ts).
function planAction(viewer: ShopViewer | null, plan: PlanId, interval: BillingInterval): PlanAction {
  if (!viewer) return { label: "Choisir" };
  const renewal = `Au renouvellement, le ${viewer.periodEnd}.`;
  if (viewer.canceled) return { label: "Se réabonner", note: `Aucun paiement avant le ${viewer.periodEnd}.` };

  const isCurrent = plan === viewer.plan && interval === viewer.interval;
  const isNext = plan === (viewer.nextPlan ?? viewer.plan) && interval === (viewer.nextInterval ?? viewer.interval);
  if (isCurrent && isNext) return { label: "Ton plan actuel", disabled: true };
  if (isNext) return { label: "Déjà programmé", note: renewal, disabled: true };
  if (isCurrent) return { label: "Garder ce plan", note: "Annule le changement programmé." };
  if (interval !== viewer.interval) {
    return { label: interval === "year" ? "Passer à l'annuel" : "Passer au mensuel", note: renewal };
  }
  return planPriceEur(plan, interval) > planPriceEur(viewer.plan, interval)
    ? { label: "Passer à ce plan", note: "La différence au prorata est prélevée tout de suite." }
    : { label: "Passer à ce plan", note: renewal };
}

// Inactif tant que la case n'est pas cochée : un bouton aria-disabled reste
// cliquable, pour ramener le client à la case qu'il n'a peut-être pas vue.
const DISABLED_LOOK = "aria-disabled:cursor-not-allowed aria-disabled:opacity-60 aria-disabled:saturate-50";

export function TokenShop({ viewer }: { viewer: ShopViewer | null }) {
  const router = useRouter();
  const waiverRef = useRef<HTMLInputElement>(null);
  const [interval, setInterval] = useState<BillingInterval>(viewer?.interval ?? "month");
  const [waiver, setWaiver] = useState(false);
  const [nudged, setNudged] = useState(false);
  const [pending, setPending] = useState<PlanId | PackId | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function buy(id: PlanId | PackId, path: string, body: object) {
    if (!waiver) {
      setNudged(true);
      waiverRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
      waiverRef.current?.focus({ preventScroll: true });
      return;
    }
    if (pending) return;
    setError(null);
    setPending(id);
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, waiver }),
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
    <div className="mt-10 space-y-8">
      <div className="liquid-glass rounded-[24px] p-5">
        <label className="flex cursor-pointer items-start gap-3 text-base leading-relaxed text-secondary sm:text-sm">
          <input
            ref={waiverRef}
            type="checkbox"
            checked={waiver}
            onChange={(e) => setWaiver(e.target.checked)}
            aria-describedby="waiver-status"
            className="mt-1 h-5 w-5 shrink-0 accent-(--brand) sm:h-4 sm:w-4"
          />
          <span>
            Je demande l&apos;accès immédiat à mes tokens, par abonnement ou par achat unique, et je renonce à mon droit
            de rétractation de 14 jours pour ce contenu numérique.
          </span>
        </label>
        <p
          id="waiver-status"
          aria-live="polite"
          className={`mt-2 pl-8 text-sm sm:pl-7 ${nudged && !waiver ? "font-semibold text-foreground" : "text-secondary"}`}
        >
          {waiver ? "C'est bon, tu peux choisir ton offre." : "Coche cette case pour activer les boutons d'achat."}
        </p>
      </div>

      {error && (
        <p role="alert" className="rounded-2xl border border-red-600/20 bg-red-500/10 px-4 py-3 text-base text-red-700 sm:text-sm">
          {error}
        </p>
      )}

      {/* Dès 1280 px : abonnements sur 2/3, packs sur 1/3. En dessous : empilés. */}
      <div className="grid gap-10 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] xl:gap-6">
        <section aria-labelledby="shop-plans" className="min-w-0">
          <div className="liquid-glass rounded-[28px] p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
              <h2 id="shop-plans" className="text-2xl font-semibold">Abonnements</h2>
              <IntervalSwitch interval={interval} onChange={setInterval} />
            </div>
            <p className="mt-3 text-secondary">
              Tes tokens sont rechargés chaque mois, sans report des tokens non utilisés. Résiliable à tout moment depuis
              ton compte.
            </p>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {(Object.keys(PLANS) as PlanId[]).map((id) => {
              const plan = PLANS[id];
              const action = planAction(viewer, id, interval);
              return (
                <div key={id} className="liquid-glass flex flex-col rounded-[28px] p-6">
                  <h3 className="text-xl font-semibold">{plan.label}</h3>
                  <p className="mt-3 whitespace-nowrap text-3xl font-semibold md:text-[1.625rem] lg:text-3xl">
                    {euros(planPriceEur(id, interval))}
                    <span className="text-base font-normal text-secondary"> / {interval === "year" ? "an" : "mois"}</span>
                  </p>
                  {/* Ligne vide en mensuel à partir de 768 px : les cartes restent alignées avec l'annuel. */}
                  <p className={`mt-1 min-h-6 text-sm text-secondary ${interval === "year" ? "" : "hidden md:block"}`}>
                    {interval === "year" && `soit ${euros(annualPricePerMonthEur(id))} / mois`}
                  </p>
                  <p className="mt-3 text-secondary">
                    <strong className="font-semibold text-foreground">{formatTokens(plan.monthlyTokens)} par mois</strong> :{" "}
                    {capacity(plan.monthlyTokens)}
                  </p>
                  {/* La note au-dessus du bouton : les boutons restent alignés d'une carte à l'autre. */}
                  <div className="mt-auto pt-6">
                    {action.note && <p className="mb-3 text-center text-sm text-secondary">{action.note}</p>}
                    <button
                      type="button"
                      onClick={() => buy(id, "/api/billing/checkout", { plan: id, interval })}
                      disabled={action.disabled}
                      aria-disabled={!waiver || pending !== null}
                      className={`liquid-glass liquid-glass--interactive liquid-glass--accent min-h-12 w-full rounded-full px-4 py-3 font-semibold disabled:opacity-60 disabled:saturate-50 ${DISABLED_LOOK}`}
                    >
                      {pending === id ? "Redirection…" : action.label}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section aria-labelledby="shop-packs" className="min-w-0">
          <div className="liquid-glass rounded-[28px] px-5 pt-5 sm:pt-6">
          <h2 id="shop-packs" className="text-xl font-semibold">Achat unique</h2>
          <p className="mt-3 text-secondary">
            Des tokens sans abonnement, qui n&apos;expirent jamais et s&apos;ajoutent à ton solde.
          </p>

          <ul className="mt-2 divide-y divide-foreground/10">
            {(Object.keys(TOKEN_PACKS) as PackId[]).map((id) => {
              const pack = TOKEN_PACKS[id];
              return (
                <li key={id} className="py-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="min-w-0">
                      <span className="block whitespace-nowrap font-semibold">{formatTokens(pack.tokens)}</span>
                      <span className="block whitespace-nowrap text-secondary">{euros(pack.priceEur)}</span>
                    </p>
                    <button
                      type="button"
                      onClick={() => buy(id, "/api/billing/pack", { pack: id })}
                      aria-disabled={!waiver || pending !== null}
                      aria-label={`Acheter ${formatTokens(pack.tokens)}`}
                      className={`liquid-glass liquid-glass--interactive min-h-11 shrink-0 rounded-full px-5 font-semibold ${DISABLED_LOOK}`}
                    >
                      {pending === id ? "Redirection…" : "Acheter"}
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-secondary">{capacity(pack.tokens)}</p>
                  <p className="mt-1 text-sm text-secondary">
                    {euros(packMonthlySavingEur(id))} de moins chaque mois avec l&apos;abonnement {PLANS[pack.plan].label}
                  </p>
                </li>
              );
            })}
          </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

function IntervalSwitch({ interval, onChange }: { interval: BillingInterval; onChange: (value: BillingInterval) => void }) {
  const option = (value: BillingInterval, label: string, badge?: string) => {
    const selected = interval === value;
    return (
      <button
        type="button"
        role="radio"
        aria-checked={selected}
        onClick={() => onChange(value)}
        className={`flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 text-sm font-semibold max-xs:flex-1 max-xs:flex-col max-xs:gap-0.5 max-xs:rounded-[20px] max-xs:px-2 max-xs:py-1.5 ${
          selected ? "liquid-glass liquid-glass--accent" : "text-secondary"
        }`}
      >
        {label}
        {badge && (
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${selected ? "bg-white/20" : "bg-(--fresco-badge) text-foreground"}`}>
            {badge}
          </span>
        )}
      </button>
    );
  };
  return (
    <div role="radiogroup" aria-label="Durée de l'abonnement" className="liquid-glass glass-pill flex gap-1 p-1 max-xs:w-full max-xs:rounded-[24px] [--fresco-badge:rgb(var(--fresco-gold)/0.35)]">
      {option("month", "Mensuel")}
      {option("year", "Annuel", `${ANNUAL_FREE_MONTHS} mois offerts`)}
    </div>
  );
}
