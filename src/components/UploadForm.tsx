"use client";

import { useEffect, useState } from "react";
import { GENERATION, UPLOAD_RULES, formatPrice } from "@/config/product";
import type { GenerationStatus } from "@/lib/fal";

// Tant que le paiement n'est pas branché, le bouton lance directement
// la génération, mais uniquement en développement.
const IS_DEV = process.env.NODE_ENV !== "production";

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

// Réduit la photo (1280 px max, JPEG) avant l'envoi : largement suffisant
// pour une vidéo 720p, et ça reste sous la limite de taille des requêtes
// des hébergeurs (4,5 Mo sur Vercel).
async function shrinkPhoto(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1280 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob"))), "image/jpeg", 0.9),
  );
}

export function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [generation, setGeneration] = useState<GenerationStatus | null>(null);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const picked = input.files?.[0];
    setError(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setFile(null);
    if (!picked) return;

    const problem = await checkFile(picked);
    if (problem) {
      setError(problem);
      input.value = "";
      return;
    }
    setFile(picked);
    setPreview(URL.createObjectURL(picked));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!IS_DEV || !file) return;
    setError(null);
    setGeneration({ status: "queued", position: null });

    const body = new FormData();
    body.append("photo", new File([await shrinkPhoto(file)], "photo.jpg", { type: "image/jpeg" }));
    body.append("consent", String(consent));
    const res = await fetch("/api/generations", { method: "POST", body });
    const data = await res.json();
    if (!res.ok) {
      setGeneration(null);
      setError(data.error);
      return;
    }
    setRequestId(data.requestId);
  }

  // Vérifie régulièrement l'avancement jusqu'à la fin de la génération.
  useEffect(() => {
    if (!requestId) return;
    const timer = setInterval(async () => {
      const res = await fetch(`/api/generations/${requestId}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      setGeneration(data);
      if (data.status === "done" || data.status === "failed") {
        clearInterval(timer);
        setRequestId(null);
      }
    }, GENERATION.pollIntervalMs);
    return () => clearInterval(timer);
  }, [requestId]);

  const busy = generation?.status === "queued" || generation?.status === "running";
  const canPay = preview !== null && consent && !busy;

  return (
    <form className="mt-10 space-y-6" onSubmit={onSubmit}>
      <label className="liquid-glass liquid-glass--interactive flex min-h-48 flex-col items-center justify-center gap-3 rounded-[28px] p-8 text-center focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-white/70">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Aperçu de ta photo" className="max-h-64 rounded-[20px]" />
        ) : (
          <span className="text-secondary">Clique pour choisir ta photo</span>
        )}
        <input
          type="file"
          accept={UPLOAD_RULES.acceptedTypes.join(",")}
          onChange={onFileChange}
          className="sr-only"
        />
      </label>

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
          Je certifie être la personne sur la photo, ou avoir son accord
          explicite, et qu&apos;elle est majeure.
        </span>
      </label>

      <button
        type="submit"
        disabled={!canPay}
        className="liquid-glass liquid-glass--interactive liquid-glass--accent w-full rounded-full py-4 text-lg font-semibold disabled:opacity-60 disabled:saturate-50"
      >
        {IS_DEV ? "Générer (test sans paiement)" : `Payer ${formatPrice()}`}
      </button>
      {!IS_DEV && (
        <p className="text-center text-xs text-tertiary">
          Le paiement sera branché à une prochaine étape.
        </p>
      )}

      {generation?.status === "queued" && (
        <p className="text-center text-sm text-secondary">
          En file d&apos;attente
          {generation.position !== null && ` (position ${generation.position + 1})`}…
        </p>
      )}
      {generation?.status === "running" && (
        <p className="text-center text-sm text-secondary">
          Génération en cours, compte quelques minutes…
        </p>
      )}
      {generation?.status === "failed" && (
        <p className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          La génération a échoué : {generation.error}
        </p>
      )}
      {generation?.status === "done" && (
        <video src={generation.videoUrl} controls autoPlay loop className="w-full rounded-[28px] shadow-2xl shadow-black/50" />
      )}
    </form>
  );
}
