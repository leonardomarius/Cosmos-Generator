"use client";

import { useState } from "react";
import { UPLOAD_RULES, formatPrice } from "@/config/product";

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

export function UploadForm() {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const file = input.files?.[0];
    setError(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (!file) return;

    const problem = await checkFile(file);
    if (problem) {
      setError(problem);
      input.value = "";
      return;
    }
    setPreview(URL.createObjectURL(file));
  }

  const canPay = preview !== null && consent;

  return (
    <form className="mt-8 space-y-6" onSubmit={(e) => e.preventDefault()}>
      <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-white/20 p-8 text-center hover:border-orange-500">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Aperçu de ta photo" className="max-h-64 rounded-lg" />
        ) : (
          <span className="text-zinc-400">Clique pour choisir ta photo</span>
        )}
        <input
          type="file"
          accept={UPLOAD_RULES.acceptedTypes.join(",")}
          onChange={onFileChange}
          className="sr-only"
        />
      </label>

      {error && (
        <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">{error}</p>
      )}

      <label className="flex items-start gap-3 text-sm">
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
        className="w-full rounded-full bg-orange-500 py-4 font-bold text-black hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Payer {formatPrice()}
      </button>
      <p className="text-center text-xs text-zinc-500">
        Le paiement sera branché à une prochaine étape.
      </p>
    </form>
  );
}
