import { PaidOfferCta } from "@/components/Welcome";
import { MODEL_NAME } from "@/config/product";
import type { GenerationStatus } from "@/lib/generation";

// Avancement d'une génération lancée avec useGeneration, puis son résultat.
// kind : ce qui est généré, pour les textes et l'affichage du résultat.
// upsell : compte qui n'a jamais payé, l'offre payante s'affiche sous le résultat.
export function GenerationProgress({
  kind,
  generation,
  notifiedEmail,
  upsell = false,
}: {
  kind: "image" | "video";
  generation: GenerationStatus | null;
  notifiedEmail: string | null;
  upsell?: boolean;
}) {
  const what = kind === "image" ? "L'image" : "La vidéo";
  return (
    <>
      {notifiedEmail && (generation?.status === "queued" || generation?.status === "running") && (
        <p className="liquid-glass rounded-[24px] px-5 py-4 text-center text-base leading-relaxed text-secondary sm:text-sm">
          C&apos;est lancé ! Tu peux fermer cette page : {what.toLowerCase()} sera envoyée à{" "}
          <strong className="text-foreground">{notifiedEmail}</strong> dès qu&apos;elle sera prête.
        </p>
      )}
      {generation?.status === "queued" && (
        <p className="text-center text-base text-secondary sm:text-sm">
          {what} est en file d&apos;attente
          {generation.position !== null && ` (position ${generation.position + 1})`}…
        </p>
      )}
      {generation?.status === "running" && (
        <p className="text-center text-base text-secondary sm:text-sm">
          {kind === "image"
            ? "Création de l'image en cours…"
            : "Génération de la vidéo en cours, compte quelques minutes…"}
        </p>
      )}
      {generation?.status === "failed" && (
        <p className="rounded-2xl border border-red-600/20 bg-red-500/10 px-4 py-3 text-base text-red-700 sm:text-sm">
          La génération a échoué : {generation.error}
        </p>
      )}
      {generation && generation.status !== "failed" && (
        <p className="text-center text-xs text-tertiary">
          Modèle : {MODEL_NAME}
          {generation.status === "done" && " · Généré par Cosmos"}
        </p>
      )}
      {generation?.status === "done" &&
        (kind === "image" ? (
          <a href={generation.url} target="_blank" rel="noopener noreferrer" className="block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={generation.url}
              alt="Image générée"
              className="mx-auto max-h-[80dvh] w-auto max-w-full rounded-[28px] shadow-2xl shadow-black/20"
            />
          </a>
        ) : (
          <video
            src={generation.url}
            controls
            autoPlay
            loop
            playsInline
            className="mx-auto max-h-[80dvh] w-auto max-w-full rounded-[28px] shadow-2xl shadow-black/20"
          />
        ))}
      {generation?.status === "done" && upsell && <PaidOfferCta />}
    </>
  );
}
