import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Base simulée : seules les deux lectures de readPromoState sont servies.
const db = vi.hoisted(() => ({
  settings: null as { enabled: boolean; daily_budget: number | null } | null,
  granted: 0,
}));

vi.mock("@/lib/supabase", () => ({
  adminClient: () => ({
    from: (table: string) => {
      const query = {
        select: () => query,
        eq: () => query,
        maybeSingle: async () => ({
          data: table === "promo_settings" ? db.settings : { granted: db.granted },
          error: null,
        }),
      };
      return query;
    },
  }),
}));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));

const { promoWindow, readPromoState } = await import("@/lib/promo");

const ENV = ["PROMO_START", "PROMO_END", "FREE_PROMO_ENABLED", "FREE_DAILY_BUDGET"] as const;

beforeEach(() => {
  for (const name of ENV) vi.stubEnv(name, "");
  db.settings = { enabled: true, daily_budget: null };
  db.granted = 0;
});
afterEach(() => vi.unstubAllEnvs());

describe("fenêtre de l'offre (fuseau Europe/Paris)", () => {
  it("par défaut : du 11/11 à 0 h au 17/11 à minuit, heure de Paris", () => {
    const window = promoWindow()!;
    expect(window.start.toISOString()).toBe("2026-11-10T23:00:00.000Z");
    expect(window.end.toISOString()).toBe("2026-11-17T23:00:00.000Z");
  });

  it("PROMO_START et PROMO_END remplacent les dates par défaut", () => {
    vi.stubEnv("PROMO_START", "2026-12-01T10:00");
    vi.stubEnv("PROMO_END", "2026-12-03");
    const window = promoWindow()!;
    expect(window.start.toISOString()).toBe("2026-12-01T09:00:00.000Z");
    expect(window.end.toISOString()).toBe("2026-12-03T23:00:00.000Z");
  });

  it("dates invalides ou inversées : offre fermée", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubEnv("PROMO_START", "2026-11-20");
    vi.stubEnv("PROMO_END", "2026-11-17");
    expect(promoWindow()).toBeNull();
    vi.stubEnv("PROMO_START", "bientôt");
    expect(promoWindow()).toBeNull();
  });

  it("active seulement entre le début (inclus) et la fin (exclue)", async () => {
    const at = async (iso: string) => (await readPromoState(new Date(iso))).active;
    expect(await at("2026-11-10T22:59:59Z")).toBe(false); // 10/11, 23 h 59 à Paris
    expect(await at("2026-11-10T23:00:00Z")).toBe(true); // 11/11, 0 h à Paris
    expect(await at("2026-11-17T22:59:59Z")).toBe(true); // 17/11, 23 h 59 à Paris
    expect(await at("2026-11-17T23:00:00Z")).toBe(false); // 18/11, 0 h à Paris
  });

  it("le jour compté est celui de Paris", async () => {
    expect((await readPromoState(new Date("2026-11-11T23:30:00Z"))).day).toBe("2026-11-12");
  });
});

describe("interrupteurs et plafond", () => {
  const during = new Date("2026-11-12T12:00:00Z");

  it("FREE_PROMO_ENABLED=false coupe l'offre", async () => {
    vi.stubEnv("FREE_PROMO_ENABLED", "false");
    const state = await readPromoState(during);
    expect(state.inWindow).toBe(true);
    expect(state.active).toBe(false);
  });

  it("le bouton de /admin coupe l'offre sans redéploiement", async () => {
    db.settings = { enabled: false, daily_budget: null };
    expect((await readPromoState(during)).active).toBe(false);
  });

  it("plafond : FREE_DAILY_BUDGET, remplacé par celui de /admin", async () => {
    expect((await readPromoState(during)).dailyBudget).toBe(60);
    vi.stubEnv("FREE_DAILY_BUDGET", "25");
    expect((await readPromoState(during)).dailyBudget).toBe(25);
    db.settings = { enabled: true, daily_budget: 0 };
    expect((await readPromoState(during)).dailyBudget).toBe(0);
  });
});
