import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AdminPromoControls } from "@/components/AdminPromoControls";
import { WELCOME_TOKENS } from "@/config/promo";
import { isAdminEmail } from "@/lib/admin";
import { adminStats, type AdminStats } from "@/lib/admin-stats";
import { envDailyBudget, promoDashboard } from "@/lib/promo";
import { currentUser } from "@/lib/supabase";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

// Tableau de bord réservé à ADMIN_EMAILS : visites et ventes, offre de
// bienvenue (interrupteur, plafond, chiffres du jour) et file du PC.
// Introuvable pour les autres.
export default function AdminPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 pb-20 pt-14">
      <h1 className="text-title font-semibold">Admin</h1>
      <Suspense fallback={<p className="mt-10 text-secondary">Chargement…</p>}>
        <AdminContent />
      </Suspense>
    </div>
  );
}

const PARIS_DATE = new Intl.DateTimeFormat("fr-FR", {
  timeZone: "Europe/Paris",
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});
const SHORT_DAY = new Intl.DateTimeFormat("fr-FR", { timeZone: "UTC", weekday: "short", day: "numeric", month: "short" });

async function AdminContent() {
  const user = await currentUser();
  if (!isAdminEmail(user?.email)) notFound();
  const [{ state, days, queue }, stats] = await Promise.all([promoDashboard(), adminStats()]);
  const status = !state.envEnabled
    ? "Coupée par FREE_PROMO_ENABLED"
    : !state.adminEnabled
      ? "Coupée depuis cette page"
      : !state.inWindow
        ? "Hors des dates"
        : "Active";

  return (
    <div className="mt-10 space-y-6">
      <StatsSections stats={stats} />

      <section className="liquid-glass space-y-5 rounded-[28px] p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-xl font-semibold">Offre de bienvenue</h2>
          <span className={`text-sm font-semibold ${state.active ? "text-emerald-700" : "text-red-700"}`}>{status}</span>
        </div>
        {state.window && (
          <p className="text-sm text-secondary">
            Du {PARIS_DATE.format(state.window.start)} au {PARIS_DATE.format(state.window.end)} (heure de Paris, fin exclue)
          </p>
        )}
        <dl className="grid grid-cols-2 gap-4">
          <Stat label="Cadeaux aujourd'hui" value={`${state.grantedToday} / ${state.dailyBudget}`} />
          <Stat label="Tokens offerts aujourd'hui" value={(state.grantedToday * WELCOME_TOKENS).toLocaleString("fr-FR")} />
        </dl>
        <AdminPromoControls
          enabled={state.adminEnabled}
          adminDailyBudget={state.adminDailyBudget}
          envDailyBudget={envDailyBudget()}
        />
      </section>

      <section className="liquid-glass space-y-4 rounded-[28px] p-6">
        <h2 className="text-xl font-semibold">File du PC</h2>
        <dl className="grid grid-cols-3 gap-4">
          <Stat label="En cours" value={String(queue.running)} />
          <Stat label="Clients en attente" value={String(queue.paid)} />
          <Stat label="Non-payants en attente" value={String(queue.free)} />
        </dl>
      </section>

      <section className="liquid-glass space-y-4 rounded-[28px] p-6">
        <h2 className="text-xl font-semibold">Cadeaux de bienvenue, 7 derniers jours</h2>
        {days.length === 0 ? (
          <p className="text-secondary">Aucune pour l&apos;instant.</p>
        ) : (
          <ul className="divide-y divide-foreground/10">
            {days.map((day) => (
              <li key={day.day} className="flex justify-between py-2.5 text-base">
                <span className="capitalize text-secondary">{SHORT_DAY.format(new Date(`${day.day}T00:00:00Z`))}</span>
                <span className="font-semibold tabular-nums">{day.granted}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-sm text-secondary">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

const EUR = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });
const INT = new Intl.NumberFormat("fr-FR");
const SALE_TIME = new Intl.DateTimeFormat("fr-FR", {
  timeZone: "Europe/Paris",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

function saleLabel(sale: AdminStats["recentSales"][number]): string {
  switch (sale.kind) {
    case "pack":
      return `${INT.format(sale.tokens ?? 0)} tokens`;
    case "video":
      return sale.guest ? "Vidéo unique, sans compte" : "Vidéo unique";
    case "subscription":
      return `Abonnement${sale.plan ? ` ${sale.plan}` : ""}`;
    case "renewal":
      return "Renouvellement d'abonnement";
    case "upgrade":
      return "Montée de plan";
    default:
      return "Autre paiement";
  }
}

// Visites (chargements de page, robots exclus) et ventes encaissées chez Mollie.
function StatsSections({ stats }: { stats: AdminStats }) {
  const maxVisitors = Math.max(1, ...stats.days.map((day) => day.visitors));
  return (
    <>
      {stats.errors.map((error) => (
        <p key={error} role="alert" className="rounded-2xl border border-red-600/20 bg-red-500/10 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ))}

      {stats.periods.map(({ label, stats: period }) => (
        <section key={label} className="liquid-glass space-y-4 rounded-[28px] p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-xl font-semibold">{label}</h2>
            <span className="text-xl font-semibold tabular-nums">{EUR.format(period.revenueEur)}</span>
          </div>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Stat label="Visiteurs uniques" value={INT.format(period.visitors)} />
            <Stat label="Pages vues" value={INT.format(period.views)} />
            <Stat label="Packs de tokens" value={INT.format(period.packs)} />
            <Stat label="Tokens vendus" value={INT.format(period.packTokens)} />
            <Stat label="Vidéos uniques" value={`${period.videos}${period.guestVideos ? ` (${period.guestVideos} sans compte)` : ""}`} />
            <Stat label="Abonnements" value={`${period.subscriptions} + ${period.renewals} renouv.`} />
          </dl>
        </section>
      ))}

      <section className="liquid-glass space-y-4 rounded-[28px] p-6">
        <h2 className="text-xl font-semibold">14 derniers jours</h2>
        <ul className="divide-y divide-foreground/10">
          {stats.days.map((day) => (
            <li key={day.day} className="grid grid-cols-[5.5rem_1fr_auto] items-center gap-3 py-2.5 text-sm sm:grid-cols-[7rem_1fr_auto]">
              <span className="capitalize text-secondary">{SHORT_DAY.format(new Date(`${day.day}T00:00:00Z`))}</span>
              <span className="flex min-w-0 items-center gap-2">
                <span className="h-2 shrink-0 rounded-full bg-(--brand)/70" style={{ width: `${(day.visitors / maxVisitors) * 70}%` }} />
                <span className="tabular-nums">{INT.format(day.visitors)}</span>
              </span>
              <span className="text-right tabular-nums">
                {day.sales > 0 ? (
                  <>
                    <strong>{EUR.format(day.revenueEur)}</strong> <span className="text-secondary">· {day.sales}</span>
                  </>
                ) : (
                  <span className="text-tertiary">—</span>
                )}
              </span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-tertiary">Barre : visiteurs uniques. À droite : ventes encaissées et leur nombre.</p>
      </section>

      <section className="liquid-glass space-y-4 rounded-[28px] p-6">
        <h2 className="text-xl font-semibold">Dernières ventes</h2>
        {stats.recentSales.length === 0 ? (
          <p className="text-secondary">Aucune sur les 30 derniers jours.</p>
        ) : (
          <ul className="divide-y divide-foreground/10">
            {stats.recentSales.map((sale) => (
              <li key={sale.id} className="flex items-baseline justify-between gap-3 py-2.5 text-sm">
                <span className="min-w-0">
                  <span className="block font-medium">{saleLabel(sale)}</span>
                  <span className="text-secondary">{SALE_TIME.format(sale.paidAt)}</span>
                </span>
                <span className="shrink-0 font-semibold tabular-nums">{EUR.format(sale.amountEur)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="liquid-glass space-y-4 rounded-[28px] p-6">
        <h2 className="text-xl font-semibold">Pages les plus vues, 30 jours</h2>
        {stats.topPages.length === 0 ? (
          <p className="text-secondary">Aucune visite comptée pour l&apos;instant.</p>
        ) : (
          <ul className="divide-y divide-foreground/10">
            {stats.topPages.map((page) => (
              <li key={page.path} className="flex justify-between gap-3 py-2.5 text-sm">
                <span className="min-w-0 truncate">{page.path}</span>
                <span className="shrink-0 font-semibold tabular-nums">{INT.format(page.views)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
