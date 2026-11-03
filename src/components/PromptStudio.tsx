"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ASPECT_RATIOS,
  PROMPT_RULES,
  UPLOAD_RULES,
  VIDEO_DURATIONS,
  formatTokens,
  tokensFor,
  type AspectRatio,
  type ModelId,
  type VideoDuration,
} from "@/config/product";
import { checkPhoto, shrinkPhoto } from "@/lib/photo-upload";
import { GenerationProgress } from "@/components/GenerationProgress";
import { useGeneration } from "@/components/useGeneration";

type Photo = { file: File; preview: string };
type Kind = "image" | "video";

const ASPECT_LABELS: Record<AspectRatio, string> = { "9:16": "Portrait", "16:9": "Paysage", "1:1": "Carré" };

// Générateur de l'accueil : une image ou une vidéo à partir d'un prompt,
// avec ou sans images. Le service fal dépend du choix :
// image → "image" ; vidéo sans image → "prompt" ; vidéo avec images → "promptImages".
// email : celui du compte (null si non connecté) ; balance : solde de tokens.
export function PromptStudio({ email, balance }: { email: string | null; balance: number }) {
  const [kind, setKind] = useState<Kind>("video");
  const [prompt, setPrompt] = useState("");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [duration, setDuration] = useState<VideoDuration>(5);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("9:16");
  const [consent, setConsent] = useState(false);
  const { start, error, setError, notifiedEmail, starting, generation, busy } = useGeneration(email);

  const model: ModelId = kind === "image" ? "image" : photos.length > 0 ? "promptImages" : "prompt";
  const cost = tokensFor(model, duration);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const picked = Array.from(input.files ?? []);
    input.value = "";
    setError(null);

    if (picked.length > PROMPT_RULES.maxImages - photos.length) {
      setError(`${PROMPT_RULES.maxImages} images maximum.`);
      return;
    }
    const added: Photo[] = [];
    for (const file of picked) {
      const problem = await checkPhoto(file, PROMPT_RULES.minDimensionPx);
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
    const body = new FormData();
    body.append("prompt", prompt.trim());
    body.append("aspectRatio", aspectRatio);
    if (kind === "video") body.append("duration", String(duration));
    for (const [i, photo] of photos.entries()) {
      const shrunk = await shrinkPhoto(photo.file, PROMPT_RULES.maxImageSidePx);
      body.append("photos", new File([shrunk], `image-${i + 1}.jpg`, { type: "image/jpeg" }));
    }
    body.append("consent", String(consent));
    await start(model, body);
  }

  const enoughTokens = balance >= cost;
  const needsConsent = photos.length > 0;
  const canGenerate = prompt.trim().length > 0 && (!needsConsent || consent) && enoughTokens && !busy;

  return (
    <form className="liquid-glass glass-card--clear space-y-5 rounded-[32px] p-4 sm:p-6" onSubmit={onSubmit}>
      {/* Mobile : le coût s'aligne sur le libellé « Type », au-dessus des boutons. */}
      <div className="relative sm:flex sm:flex-wrap sm:items-center sm:justify-between sm:gap-3">
        <Choices
          label="Type"
          options={(["video", "image"] as const).map((k) => ({ value: k, label: k === "video" ? "Vidéo" : "Image" }))}
          value={kind}
          onChange={setKind}
          disabled={busy}
        />
        <span className="absolute right-0 top-0 text-sm text-secondary sm:static">{formatTokens(cost)}</span>
      </div>

      <label className="block">
        <span className="sr-only">Description</span>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          maxLength={PROMPT_RULES.maxLength}
          rows={4}
          disabled={busy}
          placeholder={
            kind === "video"
              ? "Décris ta vidéo : un astronaute qui surfe sur les anneaux de Saturne, caméra qui tourne autour de lui…"
              : "Décris ton image : un portrait de mon chat en général romain, peinture à l'huile…"
          }
          className="w-full resize-y rounded-[20px] border border-foreground/15 bg-white/80 px-4 py-3 text-base leading-relaxed placeholder:text-tertiary focus:border-foreground/40 focus:outline-none"
        />
      </label>

      <div className="flex flex-wrap gap-3">
        {photos.map((photo, i) => (
          <div key={photo.preview} className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.preview} alt={`Image ${i + 1}`} className="h-20 w-20 rounded-2xl object-cover" />
            {!busy && (
              <button
                type="button"
                onClick={() => removePhoto(i)}
                aria-label={`Retirer l'image ${i + 1}`}
                className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-md before:absolute before:-inset-2"
              >
                ×
              </button>
            )}
          </div>
        ))}
        {photos.length < PROMPT_RULES.maxImages && !busy && (
          // Sans image, pleine largeur sur mobile ; ensuite, une tuile comme les vignettes.
          <label className={`liquid-glass liquid-glass--interactive flex h-20 min-w-20 cursor-pointer items-center justify-center rounded-2xl px-4 text-center text-sm text-secondary focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-foreground/70 ${photos.length === 0 ? "flex-1 sm:flex-none" : ""}`}>
            {photos.length === 0 ? "+ Ajouter des images (facultatif)" : "+ Image"}
            <input
              type="file"
              multiple
              accept={UPLOAD_RULES.acceptedTypes.join(",")}
              onChange={onFileChange}
              className="sr-only"
            />
          </label>
        )}
      </div>

      <div className="grid gap-4 sm:flex sm:flex-wrap sm:gap-x-6 sm:gap-y-3">
        {kind === "video" && (
          <Choices
            label="Durée"
            options={VIDEO_DURATIONS.map((d) => ({ value: d, label: `${d} s` }))}
            value={duration}
            onChange={setDuration}
            disabled={busy}
          />
        )}
        <Choices
          label="Format"
          options={ASPECT_RATIOS.map((r) => ({ value: r, label: ASPECT_LABELS[r] }))}
          value={aspectRatio}
          onChange={setAspectRatio}
          disabled={busy}
        />
      </div>

      {needsConsent && (
        <label className="flex items-start gap-3 text-base leading-relaxed text-secondary sm:text-sm">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1 h-4 w-4 accent-(--brand)"
            required
          />
          <span>
            Si une personne figure sur mes images, je certifie être cette
            personne ou avoir son accord explicite, et qu&apos;elle est majeure.
          </span>
        </label>
      )}

      {error && (
        <p className="rounded-2xl border border-red-600/20 bg-red-500/10 px-4 py-3 text-base text-red-700 sm:text-sm">{error}</p>
      )}

      {email === null ? (
        <Link
          href="/connexion?next=/"
          className="liquid-glass liquid-glass--interactive liquid-glass--accent block w-full rounded-full py-4 text-center text-base font-semibold sm:text-lg"
        >
          Se connecter pour générer
        </Link>
      ) : (
        <>
          <button
            type="submit"
            disabled={!canGenerate}
            className="liquid-glass liquid-glass--interactive liquid-glass--accent w-full rounded-full py-4 text-base font-semibold disabled:opacity-60 disabled:saturate-50 sm:text-lg"
          >
            Générer {kind === "video" ? "la vidéo" : "l'image"} · {formatTokens(cost)}
          </button>
          <p className="text-center text-sm text-secondary">
            Solde : <strong className="text-foreground">{formatTokens(balance)}</strong>
            {!enoughTokens && (
              <>
                {" "}· pas assez.{" "}
                <Link href="/abonnement" className="underline underline-offset-4">Voir les abonnements</Link>
              </>
            )}
          </p>
        </>
      )}

      {starting && <p className="text-center text-base text-secondary sm:text-sm">Envoi…</p>}
      <GenerationProgress kind={kind} generation={generation} notifiedEmail={notifiedEmail} />
    </form>
  );
}

// Groupe de boutons à choix unique (type, durée, format). Mobile : libellé
// au-dessus, boutons qui se partagent la rangée ; dès 640 px, sur une ligne.
function Choices<T extends string | number>({
  label,
  options,
  value,
  onChange,
  disabled,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  disabled: boolean;
}) {
  return (
    <div role="group" aria-label={label} className="grid gap-2 sm:flex sm:items-center">
      <span className="text-sm text-tertiary">{label}</span>
      <div className="flex gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={option.value === value}
            onClick={() => onChange(option.value)}
            disabled={disabled}
            className={`liquid-glass liquid-glass--interactive min-h-9 flex-1 rounded-full px-2 text-sm font-medium sm:flex-none sm:px-4 pointer-coarse:min-h-11 ${option.value === value ? "liquid-glass--accent" : "text-secondary"}`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
