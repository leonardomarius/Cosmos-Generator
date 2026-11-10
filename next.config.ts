import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Lus par chemin à l'exécution (src/lib/santa-video.ts, santa-text.ts) : Next
  // ne peut pas les deviner, on les ajoute au déploiement de la route.
  // ffmpeg-static calcule le chemin de son binaire avec __dirname. Embarqué
  // par Turbopack, ce chemin devient « /ROOT/node_modules/… », absent sur
  // Vercel : le paquet doit être chargé tel quel par Node.
  serverExternalPackages: ["ffmpeg-static"],
  outputFileTracingIncludes: {
    "/api/effets/pere-noel": [
      // Sur Vercel, le binaire Linux qui a drawtext (src/lib/santa-video.ts).
      "./node_modules/@ffmpeg-installer/linux-x64/ffmpeg",
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
