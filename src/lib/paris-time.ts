// Dates au fuseau Europe/Paris, heure d'été comprise, sans dépendance.
const PARIS = "Europe/Paris";

const PARTS = new Intl.DateTimeFormat("en-US", {
  timeZone: PARIS,
  hourCycle: "h23",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

function parisParts(at: Date) {
  const parts = Object.fromEntries(PARTS.formatToParts(at).map((part) => [part.type, part.value]));
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
}

// Jour calendaire à Paris, au format AAAA-MM-JJ (colonne "date" de Postgres).
export function parisDay(at: Date = new Date()): string {
  const { year, month, day } = parisParts(at);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// Décalage de Paris par rapport à UTC à cet instant, en millisecondes.
function parisOffsetMs(timestamp: number): number {
  const p = parisParts(new Date(timestamp));
  const wall = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return wall - Math.floor(timestamp / 1000) * 1000;
}

// Instant UTC d'une heure de Paris. Les débordements (jour 32, heure 24)
// passent au jour suivant, comme avec Date.UTC.
export function parisToUtc(year: number, month: number, day: number, hour = 0, minute = 0, second = 0): Date {
  const wall = Date.UTC(year, month - 1, day, hour, minute, second);
  // Deux passes : le décalage peut changer entre l'estimation et le résultat
  // (passage à l'heure d'été ou d'hiver).
  const first = wall - parisOffsetMs(wall);
  return new Date(wall - parisOffsetMs(first));
}

const LOCAL_DATE = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?$/;

// "2026-11-11" ou "2026-11-11T09:30" (heure de Paris).
// endOfDay : une date seule désigne la fin du jour (minuit du lendemain).
// null si la valeur est invalide.
export function parseParisDate(value: string, endOfDay = false): Date | null {
  const match = LOCAL_DATE.exec(value.trim());
  if (!match) return null;
  const [, y, mo, d, h, mi, s] = match;
  const year = Number(y);
  const month = Number(mo);
  const day = Number(d);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  if (h === undefined) return parisToUtc(year, month, endOfDay ? day + 1 : day);
  const hour = Number(h);
  const minute = Number(mi);
  if (hour > 23 || minute > 59) return null;
  return parisToUtc(year, month, day, hour, minute, Number(s ?? 0));
}
