import { existsSync } from "node:fs";
import path from "node:path";
import { PRODUCT } from "@/config/product";

// Affiche la vidéo d'exemple si public/exemple.mp4 existe,
// sinon un emplacement réservé.
export function ExampleVideo() {
  const file = path.join(process.cwd(), "public", PRODUCT.referenceVideoPath);
  const hasVideo = existsSync(file);

  return (
    <div className="relative aspect-[9/16] w-full max-w-xs overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
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
        <div className="flex h-full items-center justify-center p-6 text-center text-sm text-zinc-500">
          Vidéo d&apos;exemple à venir
          <br />
          (dépose un fichier public/exemple.mp4)
        </div>
      )}
      <span className="absolute bottom-2 right-2 rounded bg-black/60 px-2 py-0.5 text-[10px] text-white/80">
        Généré par IA
      </span>
    </div>
  );
}
