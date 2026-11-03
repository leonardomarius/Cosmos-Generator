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

// Affiche la vidéo d'exemple, sinon un emplacement réservé.
export function ExampleVideo() {
  const video = exampleVideoSources();

  return (
    <div className="liquid-glass w-full max-w-[min(20rem,calc(85dvh*9/16))] rounded-[32px] p-2">
      <div className="relative aspect-[9/16] overflow-hidden rounded-[24px] bg-foreground/8">
        {video ? (
          <video
            src={video.src}
            poster={video.poster}
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center p-6 text-center text-sm text-tertiary">
            Vidéo d&apos;exemple à venir
            <br />
            (dépose un fichier public/exemple.mp4)
          </div>
        )}
        <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white/85 backdrop-blur-md">
          Généré par Cosmos
        </span>
      </div>
    </div>
  );
}
