"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GenerationProgress } from "@/components/GenerationProgress";
import { GENERATION, UPLOAD_RULES, formatTokens } from "@/config/product";
import type { GenerationStatus } from "@/lib/fal";
import { checkPhoto, shrinkPhoto } from "@/lib/photo-upload";

type Photo = { file: File; preview: string };

// Formulaire d'un preset : 1 ou 2 photos, le consentement, le prix. La commande
// passe par plusieurs étapes côté serveur (POST /api/presets/<slug>) ; ici on
// suit son avancement jusqu'au résultat.
// email : celui du compte, où la vidéo est envoyée.
// balance : solde de tokens, relu côté serveur après chaque génération.
export function PresetForm({
  slug,
  name,
  tokens,
  maxPhotos,
  minPhotoSide,
  email,
  balance,
}: {
  slug: string;
  name: string;
  tokens: number;
  maxPhotos: number;
  minPhotoSide: number;
  email: string;
  balance: number;
}) {
  const router = useRouter();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [notifiedEmail, setNotifiedEmail] = useState<string | null>(null);
  const [generation, setGeneration] = useState<GenerationStatus | null>(null);

  const busy = starting || generation?.status === "queued" || generation?.status === "running";

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const picked = Array.from(input.files ?? []);
    input.value = "";
    setError(null);

    if (picked.length > maxPhotos - photos.length) {
      setError(`${maxPhotos} photos maximum.`);
      return;
    }
    const added: Photo[] = [];
    for (const file of picked) {
      const problem = await checkPhoto(file, minPhotoSide);
      if (problem) {
        added.forEach((p) => URL.revokeObjectURL(p.preview));
        setError(problem);
        return;
      }
      added.push({ file, preview: URL.createObjectURL(file) });
    }
    setPhotos((current) => [...current, ...added]);
  }

  function removePhoto(index: number) {
    URL.revokeObjectURL(photos[index].preview);
    setPhotos((current) => current.filter((_, i) => i !== index));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (photos.length === 0) return;
    setError(null);
    setGeneration(null);
    setNotifiedEmail(null);
    setStarting(true);
    // Réduites à 2048 px : assez pour garder les détails du visage sur une
    // photo en pied, et deux photos restent sous la limite de Vercel.
    const body = new FormData();
    for (const [i, photo] of photos.entries()) {
      body.append("photos", new File([await shrinkPhoto(photo.file, 2048)], `photo-${i + 1}.jpg`, { type: "image/jpeg" }));
    }
    body.append("consent", String(consent));
    const res = await fetch(`/api/presets/${slug}`, { method: "POST", body }).catch(() => null);
    const data = await res?.json().catch(() => null);
    setStarting(false);
    // Tokens retirés (ou rendus après un échec) : on relit le solde.
    router.refresh();
    if (!res?.ok || !data?.jobId) {
      setError(data?.error ?? "Impossible de lancer la génération.");
      return;
    }
    setNotifiedEmail(data.emailNotification ? email : null);
    setGeneration({ status: "running" });
    setJobId(data.jobId);
  }

  // Vérifie régulièrement l'avancement jusqu'à la fin de la commande.
  useEffect(() => {
    if (!jobId) return;
    const timer = setInterval(async () => {
      const res = await fetch(`/api/presets/jobs/${jobId}`).catch(() => null);
      if (!res?.ok) return;
      const data = (await res.json()) as GenerationStatus;
      setGeneration(data);
      if (data.status === "done" || data.status === "failed") {
        clearInterval(timer);
        setJobId(null);
        router.refresh();
      }
    }, GENERATION.pollIntervalMs);
    return () => clearInterval(timer);
  }, [jobId, router]);

  const enoughTokens = balance >= tokens;
  const canGenerate = photos.length > 0 && consent && enoughTokens && !busy;
  const canAdd = photos.length < maxPhotos && !busy;

  return (
    <form className="mt-10 space-y-6" onSubmit={onSubmit}>
      <div className="grid grid-cols-2 gap-4">
        {photos.map((photo, i) => (
          <div key={photo.preview} className="liquid-glass relative rounded-[28px] p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.preview} alt={i === 0 ? "Photo en pied de la personne" : "Gros plan du visage de la personne"} className="aspect-[3/4] w-full rounded-[20px] object-cover" />
            {!busy && (
              <button
                type="button"
                onClick={() => removePhoto(i)}
                aria-label={`Retirer la photo ${i + 1}`}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md before:absolute before:-inset-2"
              >
                ×
              </button>
            )}
          </div>
        ))}
        {canAdd && (
          <label
            className={`liquid-glass liquid-glass--interactive flex aspect-[3/4] cursor-pointer flex-col items-center justify-center gap-2 rounded-[28px] p-4 text-center sm:p-6 focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-foreground/70 ${photos.length === 0 ? "col-span-2 aspect-auto min-h-48" : ""}`}
          >
            <span className="font-semibold">{photos.length === 0 ? "Ajouter une photo" : "Ajouter un gros plan"}</span>
            <span className="text-base text-secondary sm:text-sm">
              {photos.length === 0
                ? "La personne en pied, de face, seule sur la photo"
                : "Facultatif : le visage de près, pour plus de ressemblance"}
            </span>
            <input
              type="file"
              accept={UPLOAD_RULES.acceptedTypes.join(",")}
              onChange={onFileChange}
              className="sr-only"
            />
          </label>
        )}
      </div>

      {error && (
        <p className="rounded-2xl border border-red-600/20 bg-red-500/10 px-4 py-3 text-base text-red-700 sm:text-sm">{error}</p>
      )}

      <label className="liquid-glass flex items-start gap-3 rounded-[24px] p-5 text-base leading-relaxed text-secondary sm:text-sm">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 accent-(--brand)"
          required
        />
        <span>
          Je certifie être la personne sur les photos, ou avoir son accord
          explicite, et qu&apos;elle est majeure. La vidéo reste marquée
          «&nbsp;Généré par IA&nbsp;»&nbsp;: je ne la ferai pas passer pour réelle.
        </span>
      </label>

      <button
        type="submit"
        disabled={!canGenerate}
        className="liquid-glass liquid-glass--interactive liquid-glass--accent w-full rounded-full px-4 py-4 text-base font-semibold disabled:opacity-60 disabled:saturate-50 sm:text-lg"
      >
        {/* Sur mobile, le prix passe sous le libellé au lieu d'une coupure au hasard. */}
        Créer ma vidéo<span className="max-sm:hidden"> · </span>
        <span className="max-sm:block max-sm:text-sm max-sm:font-medium max-sm:opacity-85">{formatTokens(tokens)}</span>
      </button>
      <p className="text-center text-sm text-secondary">
        Solde : <strong className="text-foreground">{formatTokens(balance)}</strong>
        {!enoughTokens && (
          <>
            {" "}· pas assez pour cette vidéo.{" "}
            <Link href="/abonnement" className="underline underline-offset-4">Recharger mes tokens</Link>
          </>
        )}
      </p>

      {starting && <p className="text-center text-base text-secondary sm:text-sm">Vérification des photos…</p>}
      <GenerationProgress kind="video" generation={generation} notifiedEmail={notifiedEmail} />
      {generation?.status === "done" && (
        <a
          href={generation.url}
          download={`${name}.mp4`}
          className="liquid-glass liquid-glass--interactive inline-flex min-h-11 w-full items-center justify-center rounded-full px-5 text-base font-semibold"
        >
          Télécharger la vidéo
        </a>
      )}
    </form>
  );
}
