import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AdminPromoControls } from "@/components/AdminPromoControls";
import { WELCOME_TOKENS } from "@/config/promo";
import { isAdminEmail } from "@/lib/admin";
import { envDailyBudget, promoDashboard } from "@/lib/promo";
import { currentUser } from "@/lib/supabase";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

// Tableau de bord réservé à ADMIN_EMAILS : offre de bienvenue (interrupteur,
// plafond, chiffres du jour) et file du PC. Introuvable pour les autres.
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
  const { state, days, queue } = await promoDashboard();
  const status = !state.envEnabled
    ? "Coupée par FREE_PROMO_ENABLED"
    : !state.adminEnabled
      ? "Coupée depuis cette page"
      : !state.inWindow
        ? "Hors des dates"
        : "Active";

  return (
    <div className="mt-10 space-y-6">
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
