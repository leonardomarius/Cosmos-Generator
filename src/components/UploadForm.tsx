"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GENERATION, UPLOAD_RULES, VIDEO_MODELS, type VideoModelId } from "@/config/product";
import type { GenerationStatus } from "@/lib/fal";

type Photo = { file: File; preview: string };

// Modèle unique de génération.
const MODEL: VideoModelId = "kling4";

// Vérifications côté navigateur (confort de l'utilisateur).
// Elles seront refaites côté serveur : on ne fait jamais confiance au navigateur.
async function checkFile(file: File): Promise<string | null> {
  if (!(UPLOAD_RULES.acceptedTypes as readonly string[]).includes(file.type)) {
    return "Format refusé : utilise une photo JPG, PNG ou WebP.";
  }
  if (file.size > UPLOAD_RULES.maxSizeBytes) {
    return "Photo trop lourde : 10 Mo maximum.";
  }
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return "Impossible de lire cette image.";
  const tooSmall =
    Math.min(bitmap.width, bitmap.height) < UPLOAD_RULES.minDimensionPx;
  bitmap.close();
  if (tooSmall) {
    return `Photo trop petite : au moins ${UPLOAD_RULES.minDimensionPx} px de côté.`;
  }
  return null;
}

// Réduit la photo (2048 px max, JPEG) avant l'envoi : assez pour garder les
// détails du visage sur une photo en pied, et ça reste sous la limite de
// taille des requêtes des hébergeurs (4,5 Mo sur Vercel), même avec deux photos.
async function shrinkPhoto(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 2048 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob"))), "image/jpeg", 0.9),
  );
}

// email : celui du compte, où la vidéo est envoyée.
// balance : solde de tokens, relu côté serveur après chaque génération.
export function UploadForm({ email, balance }: { email: string; balance: number }) {
  const router = useRouter();
  const cost = VIDEO_MODELS[MODEL].tokens;
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  // Adresse à laquelle la vidéo sera envoyée, une fois la génération lancée.
  const [notifiedEmail, setNotifiedEmail] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  // Modèle de la génération en cours : c'est lui qu'on interroge pour le suivi.
  const [job, setJob] = useState<{ requestId: string; model: VideoModelId } | null>(null);
  const [generation, setGeneration] = useState<GenerationStatus | null>(null);

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
      const problem = await checkFile(file);
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

    const body = new FormData();
    for (const [i, photo] of photos.entries()) {
      body.append("photos", new File([await shrinkPhoto(photo.file)], `photo-${i + 1}.jpg`, { type: "image/jpeg" }));
    }
    body.append("consent", String(consent));
    body.append("model", MODEL);
    const res = await fetch("/api/generations", { method: "POST", body });
    const data = await res.json();
    setStarting(false);
    // Tokens retirés (ou rendus après un échec) : on relit le solde.
    router.refresh();
    if (!res.ok) {
      setError(data.error);
      return;
    }
    // En local sans PUBLIC_BASE_URL, aucun email ne part : on ne le promet pas.
    setNotifiedEmail(data.emailNotification ? email : null);
    setGeneration({ status: "queued", position: null });
    setJob({ requestId: data.requestId, model: MODEL });
  }

  // Vérifie régulièrement l'avancement jusqu'à la fin de la génération.
  useEffect(() => {
    if (!job) return;
    const timer = setInterval(async () => {
      const res = await fetch(`/api/generations/${job.requestId}?model=${job.model}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      setGeneration(data);
      if (data.status === "done" || data.status === "failed") {
        clearInterval(timer);
        setJob(null);
        router.refresh();
      }
    }, GENERATION.pollIntervalMs);
    return () => clearInterval(timer);
  }, [job, router]);

  const busy = starting || generation?.status === "queued" || generation?.status === "running";
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
                className="absolute right-4 top-4 flex h-8 w-8 items-center pointer-coarse:right-3 pointer-coarse:top-3 pointer-coarse:h-11 pointer-coarse:w-11 justify-center rounded-full bg-black/60 text-white backdrop-blur-md"
              >
                ×
              </button>
            )}
          </div>
        ))}
        {canAdd && (
          <label
            className={`liquid-glass liquid-glass--interactive flex aspect-[3/4] flex-col items-center justify-center gap-2 rounded-[28px] p-6 text-center focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-white/70 ${photos.length === 0 ? "col-span-2 aspect-auto min-h-48" : ""}`}
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
        <p className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>
      )}


      <label className="liquid-glass flex items-start gap-3 rounded-[24px] p-5 text-sm leading-relaxed text-secondary">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1 h-4 w-4 accent-orange-500"
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
        className="liquid-glass liquid-glass--interactive liquid-glass--accent w-full rounded-full py-4 text-lg font-semibold disabled:opacity-60 disabled:saturate-50"
      >
        Générer la vidéo · {cost} tokens
      </button>
      <p className="text-center text-sm text-secondary">
        Solde : <strong className="text-white">{balance} tokens</strong>
        {!enoughTokens && (
          <>
            {" "}· pas assez pour une vidéo.{" "}
            <Link href="/abonnement" className="underline underline-offset-4">Voir les abonnements</Link>
          </>
        )}
      </p>

      {starting && (
        <p className="text-center text-sm text-secondary">
          Envoi des photos…
        </p>
      )}
      {notifiedEmail && (generation?.status === "queued" || generation?.status === "running") && (
        <p className="liquid-glass rounded-[24px] px-5 py-4 text-center text-sm leading-relaxed text-secondary">
          C&apos;est lancé ! Tu peux fermer cette page : la vidéo sera envoyée à{" "}
          <strong className="text-white">{notifiedEmail}</strong> dès qu&apos;elle sera prête.
        </p>
      )}
      {generation?.status === "queued" && (
        <p className="text-center text-sm text-secondary">
          Vidéo en file d&apos;attente
          {generation.position !== null && ` (position ${generation.position + 1})`}…
        </p>
      )}
      {generation?.status === "running" && (
        <p className="text-center text-sm text-secondary">
          Génération de la vidéo en cours, compte quelques minutes…
        </p>
      )}
      {generation?.status === "failed" && (
        <p className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          La génération a échoué : {generation.error}
        </p>
      )}
      {generation?.status === "done" && (
        <video src={generation.videoUrl} controls autoPlay loop className="mx-auto max-h-[80dvh] w-auto max-w-full rounded-[28px] shadow-2xl shadow-black/50" />
      )}
    </form>
  );
}
