import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Lus par chemin à l'exécution (src/lib/santa-video.ts) : Next ne peut pas
  // les deviner, on les ajoute au déploiement de la route.
  outputFileTracingIncludes: {
    "/api/effets/pere-noel": [
      "./node_modules/ffmpeg-static/ffmpeg*",
      "./src/assets/fonts/**/*",
      "./src/assets/effects/pere-noel/**/*",
    ],
    // Assemblage des vidéos de presets (src/lib/presets/assemble.ts), là où une
    // commande peut se terminer : webhook, suivi du navigateur, tâche quotidienne.
    "/api/webhooks/presets": ["./node_modules/ffmpeg-static/ffmpeg*", "./presets/*/assets/**/*"],
    "/api/presets/jobs/\\[id\\]": ["./node_modules/ffmpeg-static/ffmpeg*", "./presets/*/assets/**/*"],
    "/api/cron/presets": ["./node_modules/ffmpeg-static/ffmpeg*", "./presets/*/assets/**/*"],
  },
  experimental: {
    agentUpgrade: "security",
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
