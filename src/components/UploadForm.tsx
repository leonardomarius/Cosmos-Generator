"use client";

import Link from "next/link";
import { useState } from "react";
import { UPLOAD_RULES, formatTokens, tokensFor } from "@/config/product";
import { checkPhoto, shrinkPhoto } from "@/lib/photo-upload";
import { GenerationProgress } from "@/components/GenerationProgress";
import { useGeneration } from "@/components/useGeneration";

type Photo = { file: File; preview: string };

// Formulaire de la vidéo de référence : la personne des photos remplace la star.
// email : celui du compte, où la vidéo est envoyée.
// balance : solde de tokens, relu côté serveur après chaque génération.
export function UploadForm({ email, balance }: { email: string; balance: number }) {
  const cost = tokensFor("kling4");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [consent, setConsent] = useState(false);
  const { start, error, setError, notifiedEmail, starting, generation, busy } = useGeneration(email);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const picked = Array.from(input.files ?? []);
    input.value = "";
    setError(null);

    const room = UPLOAD_RULES.maxPhotos - photos.length;
    if (picked.length > room) {
      setError(`${UPLOAD_RULES.maxPhotos} photos maximum.`);
      return;
    }
    const added: Photo[] = [];
    for (const file of picked) {
      const problem = await checkPhoto(file, UPLOAD_RULES.minDimensionPx);
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
    // Réduites à 2048 px : assez pour garder les détails du visage sur une
    // photo en pied, et deux photos restent sous la limite de Vercel.
    const body = new FormData();
    for (const [i, photo] of photos.entries()) {
      body.append("photos", new File([await shrinkPhoto(photo.file, 2048)], `photo-${i + 1}.jpg`, { type: "image/jpeg" }));
    }
    body.append("consent", String(consent));
    await start("kling4", body);
  }

  const enoughTokens = balance >= cost;
  const canGenerate = photos.length > 0 && consent && enoughTokens && !busy;
  const canAdd = photos.length < UPLOAD_RULES.maxPhotos && !busy;

  return (
    <form className="mt-10 space-y-6" onSubmit={onSubmit}>
      <div className="grid grid-cols-2 gap-4">
        {photos.map((photo, i) => (
          <div key={photo.preview} className="liquid-glass relative rounded-[28px] p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.preview} alt={i === 0 ? "Photo en pied du proche" : "Gros plan du visage du proche"} className="aspect-[3/4] w-full rounded-[20px] object-cover" />
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
            className={`liquid-glass liquid-glass--interactive flex aspect-[3/4] flex-col items-center justify-center gap-2 rounded-[28px] p-4 text-center sm:p-6 focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-foreground/70 ${photos.length === 0 ? "col-span-2 aspect-auto min-h-48" : ""}`}
          >
            <span className="text-secondary">
              {photos.length === 0
                ? "Photo 1 : la personne en pied, de face"
                : "Photo 2 (facultatif) : gros plan du visage"}
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
          className="mt-1 h-4 w-4 accent-(--brand)"
          required
        />
        <span>
          Je certifie être la personne sur les photos, ou avoir son accord
          explicite, et qu&apos;elle est majeure.
        </span>
      </label>

      <button
        type="submit"
        disabled={!canGenerate}
        className="liquid-glass liquid-glass--interactive liquid-glass--accent w-full rounded-full py-4 text-base font-semibold disabled:opacity-60 disabled:saturate-50 sm:text-lg"
      >
        Générer la vidéo · {formatTokens(cost)}
      </button>
      <p className="text-center text-sm text-secondary">
        Solde : <strong className="text-foreground">{formatTokens(balance)}</strong>
        {!enoughTokens && (
          <>
            {" "}· pas assez pour une vidéo.{" "}
            <Link href="/abonnement" className="underline underline-offset-4">Voir les abonnements</Link>
          </>
        )}
      </p>

      {starting && <p className="text-center text-base text-secondary sm:text-sm">Envoi des photos…</p>}
      <GenerationProgress kind="video" generation={generation} notifiedEmail={notifiedEmail} />
    </form>
  );
}
