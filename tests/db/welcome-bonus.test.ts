// Garanties en base de l'offre de bienvenue, sur un vrai Postgres local où
// toutes les migrations de supabase/migrations sont appliquées dans l'ordre.
// Les requêtes « simultanées » partent chacune sur sa propre connexion.
import { randomUUID } from "node:crypto";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import EmbeddedPostgres from "embedded-postgres";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const PORT = 54329;
const DAY = "2026-11-12";
const TOKENS = 1300;
let server: EmbeddedPostgres;
let pool: pg.Pool;
let dataDir: string;

// Ce que Supabase fournit et que les migrations supposent.
const SUPABASE_STUBS = `
  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin;
  create schema auth;
  create table auth.users (id uuid primary key, email text, created_at timestamptz not null default now());
  create function auth.uid() returns uuid language sql stable as $$ select null::uuid $$;
`;

beforeAll(async () => {
  dataDir = mkdtempSync(join(tmpdir(), "cosmos-pg-"));
  server = new EmbeddedPostgres({
    databaseDir: dataDir,
    user: "postgres",
    password: "test",
    port: PORT,
    persistent: false,
    // UTF-8 comme Supabase (sous Windows, initdb prendrait WIN1252).
    initdbFlags: ["--encoding=UTF8", "--locale=C"],
    onLog: () => {},
  });
  await server.initialise();
  await server.start();
  await server.createDatabase("cosmos");
  pool = new pg.Pool({ host: "localhost", port: PORT, user: "postgres", password: "test", database: "cosmos", max: 30 });
  await pool.query(SUPABASE_STUBS);
  const folder = join(__dirname, "..", "..", "supabase", "migrations");
  for (const file of readdirSync(folder).filter((name) => name.endsWith(".sql")).sort()) {
    // "notify pgrst" ne sert qu'à l'API de Supabase.
    const sql = readFileSync(join(folder, file), "utf8").replace(/notify pgrst[^;]*;/g, "");
    try {
      await pool.query(sql);
    } catch (err) {
      throw new Error(`Migration ${file} : ${(err as Error).message}`);
    }
  }
});

afterAll(async () => {
  await pool?.end();
  await server?.stop();
  rmSync(dataDir, { recursive: true, force: true });
});

async function newUser(): Promise<string> {
  const id = randomUUID();
  await pool.query("insert into auth.users (id, email) values ($1, $2)", [id, `${id}@exemple.fr`]);
  return id;
}

function claim(user: string, budget = 1000, day = DAY) {
  return pool.query("select public.claim_welcome_bonus($1, $2, $3, $4) as balance", [user, TOKENS, day, budget]);
}

async function purchasedBalance(user: string): Promise<number> {
  const { rows } = await pool.query("select purchased_balance from public.token_balances where user_id = $1", [user]);
  return rows[0]?.purchased_balance ?? 0;
}

function errorsOf(results: PromiseSettledResult<unknown>[]): string[] {
  return results.filter((r): r is PromiseRejectedResult => r.status === "rejected").map((r) => (r.reason as Error).message);
}

describe("cadeau de bienvenue", () => {
  it("crédite les tokens en tokens achetés, avec une référence welcome:", async () => {
    const user = await newUser();
    const { rows } = await claim(user);
    expect(rows[0].balance).toBe(TOKENS);
    expect(await purchasedBalance(user)).toBe(TOKENS);
    const ledger = await pool.query("select reason, ref, delta from public.token_ledger where user_id = $1", [user]);
    expect(ledger.rows).toEqual([{ reason: "purchase", ref: `welcome:${user}`, delta: TOKENS }]);
  });

  it("20 demandes simultanées du même compte : un seul cadeau", async () => {
    const user = await newUser();
    const results = await Promise.allSettled(Array.from({ length: 20 }, () => claim(user)));
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect(new Set(errorsOf(results))).toEqual(new Set(["welcome_already_claimed"]));
    expect(await purchasedBalance(user)).toBe(TOKENS);
  });

  it("plusieurs comptes d'un même foyer : chacun reçoit son cadeau", async () => {
    const users = await Promise.all(Array.from({ length: 5 }, newUser));
    const results = await Promise.allSettled(users.map((user) => claim(user)));
    expect(results.every((r) => r.status === "fulfilled")).toBe(true);
    expect(await Promise.all(users.map(purchasedBalance))).toEqual(users.map(() => TOKENS));
  });

  it("plafond du jour respecté même sous une rafale simultanée", async () => {
    const day = "2026-11-13";
    const users = await Promise.all(Array.from({ length: 15 }, newUser));
    const results = await Promise.allSettled(users.map((user) => claim(user, 5, day)));
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(5);
    expect(new Set(errorsOf(results))).toEqual(new Set(["welcome_budget_reached"]));
    const { rows } = await pool.query("select granted from public.welcome_daily_usage where day = $1", [day]);
    expect(rows[0].granted).toBe(5);
  });

  it("le lendemain, le plafond repart de zéro", async () => {
    const user = await newUser();
    await expect(claim(user, 5, "2026-11-14")).resolves.toBeTruthy();
  });

  it("compte bloqué : rien n'est accordé, tout est annulé", async () => {
    const user = await newUser();
    await pool.query("insert into public.token_balances (user_id, blocked_at) values ($1, now())", [user]);
    await expect(claim(user)).rejects.toThrow("account_blocked");
    const bonus = await pool.query("select 1 from public.welcome_bonuses where user_id = $1", [user]);
    expect(bonus.rowCount).toBe(0);
    expect(await purchasedBalance(user)).toBe(0);
  });
});

describe("compte payant ou non (priorité dans la file)", () => {
  it("les tokens de bienvenue ne font pas un client, un achat si", async () => {
    const user = await newUser();
    await claim(user);
    const paid = async () => (await pool.query("select public.user_has_paid($1) as paid", [user])).rows[0].paid;
    expect(await paid()).toBe(false);
    await pool.query("select public.credit_purchased_tokens($1, 1000, $2)", [user, `pack:${user}`]);
    expect(await paid()).toBe(true);
  });

  it("un abonnement payé fait un client", async () => {
    const user = await newUser();
    await pool.query("select public.reset_tokens($1, 2750, 'monthly_reset', $2)", [user, `facture:${user}`]);
    expect((await pool.query("select public.user_has_paid($1) as paid", [user])).rows[0].paid).toBe(true);
  });
});

describe("idempotence des générations", () => {
  it("une même clé ne crée qu'une génération, même en simultané", async () => {
    const user = await newUser();
    const key = randomUUID();
    const insert = () =>
      pool.query("insert into public.generations (user_id, model, tokens, idempotency_key) values ($1, 'image', 60, $2)", [user, key]);
    const results = await Promise.allSettled(Array.from({ length: 10 }, insert));
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    const { rows } = await pool.query("select count(*)::int as n from public.generations where idempotency_key = $1", [key]);
    expect(rows[0].n).toBe(1);
  });

  it("sans clé, aucune contrainte (anciennes générations)", async () => {
    const user = await newUser();
    const insert = () => pool.query("insert into public.generations (user_id, model, tokens) values ($1, 'image', 60)", [user]);
    await insert();
    await expect(insert()).resolves.toBeTruthy();
  });
});

describe("file du PC : les clients passent avant les comptes non payants", () => {
  it("ordre de prise par priorité puis par ancienneté", async () => {
    const user = await newUser();
    const job = async (priority: number, minutesAgo: number) => {
      const { rows } = await pool.query(
        "insert into public.generations (user_id, model, tokens) values ($1, 'image', 60) returning id",
        [user],
      );
      await pool.query(
        "insert into public.wangp_jobs (id, model, email, priority, created_at) values ($1, 'image', 'x@y.fr', $2, now() - make_interval(mins => $3))",
        [rows[0].id, priority, minutesAgo],
      );
      return rows[0].id as string;
    };
    const oldFree = await job(1, 30);
    const newPaid = await job(0, 1);
    const oldPaid = await job(0, 10);
    // Même tri que claimNextJob (src/lib/wangp.ts).
    const { rows } = await pool.query(
      "select id from public.wangp_jobs where status = 'queued' and id = any($1) order by priority, created_at",
      [[oldFree, newPaid, oldPaid]],
    );
    expect(rows.map((r) => r.id)).toEqual([oldPaid, newPaid, oldFree]);
  });
});

describe("limites de fréquence", () => {
  it("compte exactement, même en simultané", async () => {
    const results = await Promise.all(
      Array.from({ length: 12 }, () => pool.query("select public.hit_rate_limit('test:ip', 3600, 10) as ok")),
    );
    expect(results.filter((r) => r.rows[0].ok)).toHaveLength(10);
  });
});
