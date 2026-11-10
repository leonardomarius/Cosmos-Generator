import { existsSync } from "node:fs";
import path from "node:path";
import { PRODUCT } from "@/config/product";

// Copie légère de la vidéo et son affiche (scripts/prepare-web-video.mjs).
const WEB_VIDEO = "/exemple-web.mp4";
const WEB_POSTER = "/exemple-web.jpg";

// Vidéo d'exemple à afficher : sa copie légère quand elle est prête, sinon
// public/exemple.mp4 ; null si aucune des deux n'existe.
export function exampleVideoSources(): { src: string; poster?: string } | null {
  const inPublic = (file: string) => existsSync(path.join(process.cwd(), "public", file));
  if (!inPublic(PRODUCT.referenceVideoPath)) return null;
  if (!inPublic(WEB_VIDEO)) return { src: PRODUCT.referenceVideoPath };
  return { src: WEB_VIDEO, poster: inPublic(WEB_POSTER) ? WEB_POSTER : undefined };
}
