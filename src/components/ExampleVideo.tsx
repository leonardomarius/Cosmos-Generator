import { existsSync } from "node:fs";
import path from "node:path";
import { PRODUCT } from "@/config/product";

// Affiche la vidéo d'exemple si public/exemple.mp4 existe,
// sinon un emplacement réservé.
export function ExampleVideo() {
  const file = path.join(process.cwd(), "public", PRODUCT.referenceVideoPath);
  const hasVideo = existsSync(file);

  return (
    <div className="liquid-glass w-full max-w-xs rounded-[32px] p-2">
      <div className="relative aspect-[3/4] overflow-hidden rounded-[24px] bg-black/40">
        {hasVideo ? (
          <video
            src={PRODUCT.referenceVideoPath}
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
        <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-medium text-white/85 backdrop-blur-md">
          Généré par IA
        </span>
      </div>
    </div>
  );
}
