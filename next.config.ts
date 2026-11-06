import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Lus par chemin à l'exécution (src/lib/santa-video.ts, santa-text.ts) : Next
  // ne peut pas les deviner, on les ajoute au déploiement de la route.
  outputFileTracingIncludes: {
    "/api/effets/pere-noel": [
      "./node_modules/ffmpeg-static/ffmpeg*",
      "./src/assets/fonts/**/*",
      "./src/assets/effects/pere-noel/**/*",
    ],
    "/api/billing/video": ["./src/assets/fonts/**/*"],
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
