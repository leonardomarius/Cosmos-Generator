// Statistiques de /admin : visites (src/lib/site-visits.ts) et ventes, lues
// chez Mollie, qui fait foi (achats sans compte compris). Jours à l'heure de
// Paris, sur les 30 derniers jours.
import { listPaidSales, type PaidSale } from "@/lib/mollie";
import { parisDay } from "@/lib/paris-time";
import { adminClient } from "@/lib/supabase";

const DAY_MS = 24 * 60 * 60 * 1000;
const HISTORY_DAYS = 30;

export type PeriodStats = {
  visitors: number;
  views: number;
  revenueEur: number;
  packs: number;
  packTokens: number;
  videos: number;
  guestVideos: number;
  subscriptions: number;
  renewals: number;
};

export type DayStats = { day: string; visitors: number; views: number; sales: number; revenueEur: number };

export type AdminStats = {
  periods: { label: string; stats: PeriodStats }[];
  days: DayStats[];
  topPages: { path: string; views: number }[];
  recentSales: (PaidSale & { day: string })[];
  errors: string[];
};

// Les n derniers jours de Paris, du plus récent au plus ancien.
function lastDays(n: number): string[] {
  const days = new Set<string>();
  for (let i = 0; days.size < n && i < n + 2; i++) days.add(parisDay(new Date(Date.now() - i * DAY_MS)));
  return [...days];
}

const empty = (): PeriodStats => ({
  visitors: 0,
  views: 0,
  revenueEur: 0,
  packs: 0,
  packTokens: 0,
  videos: 0,
  guestVideos: 0,
  subscriptions: 0,
  renewals: 0,
});

async function readVisits(since: string) {
  const db = adminClient();
  const [days, pages] = await Promise.all([
    db.rpc("site_visit_days", { p_since: since }),
    db.from("site_page_views").select("path, views").gte("day", since),
  ]);
  if (days.error) throw days.error;
  if (pages.error) throw pages.error;
  return { days: days.data, pages: pages.data };
}

export async function adminStats(): Promise<AdminStats> {
  const days = lastDays(HISTORY_DAYS);
  const since = days[days.length - 1];
  const errors: string[] = [];
  const [visits, sales] = await Promise.all([
    readVisits(since).catch((err) => {
      console.error(err);
      errors.push("Visites illisibles (migration 20261122000000_site_visits.sql appliquée ?).");
      return { days: [], pages: [] };
    }),
    listPaidSales(new Date(Date.now() - (HISTORY_DAYS + 1) * DAY_MS)).catch((err) => {
      console.error(err);
      errors.push("Ventes Mollie illisibles.");
      return [] as PaidSale[];
    }),
  ]);

  const byDay = new Map(days.map((day) => [day, { day, visitors: 0, views: 0, sales: 0, revenueEur: 0 }]));
  const periodDays = [
    { label: "Aujourd'hui", days: new Set(days.slice(0, 1)) },
    { label: "7 jours", days: new Set(days.slice(0, 7)) },
    { label: "30 jours", days: new Set(days) },
  ];
  const periods = periodDays.map(({ label }) => ({ label, stats: empty() }));
  const each = (day: string, apply: (stats: PeriodStats) => void) =>
    periodDays.forEach((period, i) => period.days.has(day) && apply(periods[i].stats));

  for (const row of visits.days) {
    const entry = byDay.get(row.day);
    if (entry) {
      entry.visitors = Number(row.visitors);
      entry.views = Number(row.views);
    }
    each(row.day, (stats) => {
      stats.visitors += Number(row.visitors);
      stats.views += Number(row.views);
    });
  }

  const dated = sales.map((sale) => ({ ...sale, day: parisDay(sale.paidAt) }));
  for (const sale of dated) {
    const entry = byDay.get(sale.day);
    if (entry) {
      entry.sales += 1;
      entry.revenueEur += sale.amountEur;
    }
    each(sale.day, (stats) => {
      stats.revenueEur += sale.amountEur;
      if (sale.kind === "pack") {
        stats.packs += 1;
        stats.packTokens += sale.tokens ?? 0;
      } else if (sale.kind === "video") {
        stats.videos += 1;
        if (sale.guest) stats.guestVideos += 1;
      } else if (sale.kind === "subscription") stats.subscriptions += 1;
      else if (sale.kind === "renewal") stats.renewals += 1;
    });
  }

  const pageViews = new Map<string, number>();
  for (const row of visits.pages) pageViews.set(row.path, (pageViews.get(row.path) ?? 0) + row.views);
  const topPages = [...pageViews]
    .map(([path, views]) => ({ path, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 8);

  return {
    periods,
    days: [...byDay.values()].slice(0, 14),
    topPages,
    recentSales: dated.slice(0, 10),
    errors,
  };
}
