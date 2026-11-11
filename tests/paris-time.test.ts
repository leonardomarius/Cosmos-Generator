import { describe, expect, it } from "vitest";
import { parisDay, parseParisDate, parisToUtc } from "@/lib/paris-time";

describe("jour calendaire à Paris", () => {
  it("change à minuit heure de Paris, pas à minuit UTC", () => {
    // 23 h 30 UTC le 10 novembre = 0 h 30 le 11 à Paris (UTC+1 en hiver).
    expect(parisDay(new Date("2026-11-10T23:30:00Z"))).toBe("2026-11-11");
    expect(parisDay(new Date("2026-11-10T22:59:59Z"))).toBe("2026-11-10");
  });

  it("suit l'heure d'été (UTC+2)", () => {
    expect(parisDay(new Date("2026-07-14T22:30:00Z"))).toBe("2026-07-15");
    expect(parisDay(new Date("2026-07-14T21:59:59Z"))).toBe("2026-07-14");
  });
});

describe("heure de Paris vers UTC", () => {
  it("hiver et été", () => {
    expect(parisToUtc(2026, 11, 11).toISOString()).toBe("2026-11-10T23:00:00.000Z");
    expect(parisToUtc(2026, 7, 15, 12).toISOString()).toBe("2026-07-15T10:00:00.000Z");
  });

  it("jours de changement d'heure", () => {
    // Passage à l'heure d'été le 29 mars 2026 à 2 h : minuit est encore en UTC+1.
    expect(parisToUtc(2026, 3, 29).toISOString()).toBe("2026-03-28T23:00:00.000Z");
    expect(parisToUtc(2026, 3, 30).toISOString()).toBe("2026-03-29T22:00:00.000Z");
    // Retour à l'heure d'hiver le 25 octobre 2026.
    expect(parisToUtc(2026, 10, 26).toISOString()).toBe("2026-10-25T23:00:00.000Z");
  });
});

describe("dates de PROMO_START et PROMO_END", () => {
  it("une date seule : début du jour, ou fin du jour pour PROMO_END", () => {
    expect(parseParisDate("2026-11-11")?.toISOString()).toBe("2026-11-10T23:00:00.000Z");
    expect(parseParisDate("2026-11-17", true)?.toISOString()).toBe("2026-11-17T23:00:00.000Z");
  });

  it("fin de mois : le lendemain du 30 novembre est le 1er décembre", () => {
    expect(parseParisDate("2026-11-30", true)?.toISOString()).toBe("2026-11-30T23:00:00.000Z");
  });

  it("une heure précise", () => {
    expect(parseParisDate("2026-11-11T09:30")?.toISOString()).toBe("2026-11-11T08:30:00.000Z");
    expect(parseParisDate("2026-11-11 18:00:15")?.toISOString()).toBe("2026-11-11T17:00:15.000Z");
  });

  it("refuse les valeurs invalides", () => {
    for (const value of ["", "11/11/2026", "2026-13-01", "2026-11-11T25:00", "demain"]) {
      expect(parseParisDate(value)).toBeNull();
    }
  });
});
