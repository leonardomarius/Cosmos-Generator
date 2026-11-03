import type { GenerationStatus } from "@/lib/fal";

// Avancement d'une génération lancée avec useGeneration, puis son résultat.
// kind : ce qui est généré, pour les textes et l'affichage du résultat.
export function GenerationProgress({
  kind,
  generation,
  notifiedEmail,
}: {
  kind: "image" | "video";
  generation: GenerationStatus | null;
  notifiedEmail: string | null;
}) {
  const what = kind === "image" ? "L'image" : "La vidéo";
  return (
    <>
      {notifiedEmail && (generation?.status === "queued" || generation?.status === "running") && (
        <p className="liquid-glass rounded-[24px] px-5 py-4 text-center text-sm leading-relaxed text-secondary">
          C&apos;est lancé ! Tu peux fermer cette page : {what.toLowerCase()} sera envoyée à{" "}
          <strong className="text-foreground">{notifiedEmail}</strong> dès qu&apos;elle sera prête.
        </p>
      )}
      {generation?.status === "queued" && (
        <p className="text-center text-sm text-secondary">
          {what} est en file d&apos;attente
          {generation.position !== null && ` (position ${generation.position + 1})`}…
        </p>
      )}
      {generation?.status === "running" && (
        <p className="text-center text-sm text-secondary">
          {kind === "image"
            ? "Création de l'image en cours…"
            : "Génération de la vidéo en cours, compte quelques minutes…"}
        </p>
      )}
      {generation?.status === "failed" && (
        <p className="rounded-2xl border border-red-600/20 bg-red-500/10 px-4 py-3 text-sm text-red-700">
          La génération a échoué : {generation.error}
        </p>
      )}
      {generation?.status === "done" && <p className="text-center text-xs text-tertiary">Généré par IA</p>}
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
            className="mx-auto max-h-[80dvh] w-auto max-w-full rounded-[28px] shadow-2xl shadow-black/20"
          />
        ))}
    </>
  );
}
