import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Tests : npm test. Ceux de tests/db démarrent un vrai Postgres local
// (embedded-postgres) et y appliquent toutes les migrations de supabase/.
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // Démarrage de Postgres et migrations : quelques secondes.
    hookTimeout: 120_000,
    testTimeout: 60_000,
  },
});
