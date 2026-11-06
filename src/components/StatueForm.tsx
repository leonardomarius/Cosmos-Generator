"use client";

import Link from "next/link";
import { useState } from "react";
import { UPLOAD_RULES, formatTokens, tokensFor } from "@/config/product";
import { checkPhoto, shrinkPhoto } from "@/lib/photo-upload";
import { GenerationProgress } from "@/components/GenerationProgress";
import { useGeneration } from "@/components/useGeneration";

type Photo = { file: File; preview: string };

// L'ordre compte : fal reçoit la vue de face puis la vue de profil.
const SLOTS = [
  { title: "Visage de face", hint: "Net, bien éclairé, regard vers l'objectif" },
  { title: "Visage de profil", hint: "La même personne, tournée sur le côté" },
] as const;

// Formulaire de la vidéo de la statue : deux photos du visage, rien d'autre.
export function StatueForm({ email, balance }: { email: string; balance: number }) {
  const cost = tokensFor("statue");
  const [photos, setPhotos] = useState<(Photo | null)[]>(SLOTS.map(() => null));
  const [consent, setConsent] = useState(false);
  const { start, error, setError, notifiedEmail, starting, generation, busy } = useGeneration(email);

  async function onFileChange(index: number, e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;
    setError(null);
    const problem = await checkPhoto(file, UPLOAD_RULES.minDimensionPx);
    if (problem) {
      setError(problem);
      return;
    }
    const photo = { file, preview: URL.createObjectURL(file) };
    setPhotos((current) => current.map((p, i) => (i === index ? photo : p)));
  }

  function removePhoto(index: number) {
    URL.revokeObjectURL(photos[index]!.preview);
    setPhotos((current) => current.map((p, i) => (i === index ? null : p)));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const [front, profile] = photos;
    if (!front || !profile) return;
    // Réduites à 2048 px : le détail du visage reste, et deux photos passent
    // sous la limite de requête de Vercel.
    const body = new FormData();
    for (const [i, photo] of [front, profile].entries()) {
      body.append("photos", new File([await shrinkPhoto(photo.file, 2048)], `visage-${i + 1}.jpg`, { type: "image/jpeg" }));
    }
    body.append("consent", String(consent));
    await start("statue", body);
  }

  const enoughTokens = balance >= cost;
  const canGenerate = photos.every(Boolean) && consent && enoughTokens && !busy;

  return (
    <form className="mt-10 space-y-6" onSubmit={onSubmit}>
      <div className="grid grid-cols-2 gap-4">
        {SLOTS.map((slot, i) => {
          const photo = photos[i];
          return photo ? (
            <div key={slot.title} className="liquid-glass relative rounded-[28px] p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.preview} alt={slot.title} className="aspect-[3/4] w-full rounded-[20px] object-cover" />
              {!busy && (
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  aria-label={`Retirer la photo : ${slot.title.toLowerCase()}`}
                  className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md before:absolute before:-inset-2"
                >
                  ×
                </button>
              )}
            </div>
          ) : (
            <label
              key={slot.title}
              className="liquid-glass liquid-glass--interactive flex aspect-[3/4] cursor-pointer flex-col items-center justify-center gap-2 rounded-[28px] p-4 text-center focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-foreground/70 sm:p-6"
            >
              <span className="font-semibold">{slot.title}</span>
              <span className="text-sm leading-snug text-secondary">{slot.hint}</span>
              <input
                type="file"
                accept={UPLOAD_RULES.acceptedTypes.join(",")}
                onChange={(e) => onFileChange(i, e)}
                disabled={busy}
                className="sr-only"
              />
            </label>
          );
        })}
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
            <Link href="/abonnement" className="underline underline-offset-4">Recharger mes tokens</Link>
          </>
        )}
      </p>

      {starting && <p className="text-center text-base text-secondary sm:text-sm">Envoi des photos…</p>}
      <GenerationProgress kind="video" generation={generation} notifiedEmail={notifiedEmail} />
    </form>
  );
}
