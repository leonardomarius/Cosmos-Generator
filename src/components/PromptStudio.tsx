"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
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
import { CHAT_HANDOFF_CHARS, handOffToChat } from "@/lib/chat-draft";
import { checkPhoto, shrinkPhoto } from "@/lib/photo-upload";
import { SuspendedText } from "@/components/AccountNotices";
import { GenerationProgress } from "@/components/GenerationProgress";
import { useGeneration } from "@/components/useGeneration";

type Photo = { file: File; preview: string };
type Kind = "image" | "video";

export const ASPECT_LABELS: Record<AspectRatio, string> = { "9:16": "Portrait", "16:9": "Paysage", "1:1": "Carré" };

// Générateur de l'accueil : une image ou une vidéo à partir d'un prompt,
// avec ou sans images. Le service fal dépend du choix :
// image → "image" ; vidéo sans image → "prompt" ; vidéo avec images → "promptImages".
// email : celui du compte (null si non connecté) ; balance : solde de tokens.
export function PromptStudio({
  email,
  balance,
  suspendedContact = null,
}: {
  email: string | null;
  balance: number;
  // Compte bloqué : l'adresse de contact à afficher à la place du solde.
  suspendedContact?: string | null;
}) {
  const [kind, setKind] = useState<Kind>("video");
  const [prompt, setPrompt] = useState("");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [duration, setDuration] = useState<VideoDuration>(5);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("9:16");
  const [consent, setConsent] = useState(false);
  const { start, error, setError, notifiedEmail, starting, generation, busy } = useGeneration(email);
  const router = useRouter();
  // Passage au chat en cours (écoute du champ, arrêtée une fois le chat affiché).
  const handOff = useRef<AbortController | null>(null);

  // Le chat est préchargé : la redirection n'attend pas le réseau.
  useEffect(() => router.prefetch("/chat"), [router]);

  // Page quittée (ou masquée) : fin de l'écoute, une nouvelle visite repart
  // de zéro.
  useEffect(
    () => () => {
      handOff.current?.abort();
      handOff.current = null;
    },
    [],
  );

  // Au-delà de CHAT_HANDOFF_CHARS caractères, la suite s'écrit dans le chat :
  // le brouillon (texte, type, réglages, images) y est repris tel quel.
  function onPromptChange(textarea: HTMLTextAreaElement) {
    const value = textarea.value;
    setPrompt(value);
    if (value.length <= CHAT_HANDOFF_CHARS || handOff.current) return;
    const draft = { kind, duration, aspectRatio, consent, photos };
    handOffToChat({ ...draft, prompt: value });
    // Les lettres tapées jusqu'à l'affichage du chat sont lues sur le champ
    // lui-même : pendant la transition, React ne traite plus ses événements.
    handOff.current = new AbortController();
    textarea.addEventListener("input", () => handOffToChat({ ...draft, prompt: textarea.value }), {
      signal: handOff.current.signal,
    });
    router.push("/chat", { transitionTypes: ["to-chat"] });
  }

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
    <form className="liquid-glass glass-card--clear space-y-4 rounded-[32px] p-4 sm:p-6" onSubmit={onSubmit}>
      <label className="block">
        <span className="sr-only">Description</span>
        <textarea
          value={prompt}
          onChange={(e) => onPromptChange(e.target)}
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

      {photos.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {photos.map((photo, i) => (
            <div key={photo.preview} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.preview} alt={`Image ${i + 1}`} className="h-16 w-16 rounded-2xl object-cover" />
              {!busy && (
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  aria-label={`Retirer l'image ${i + 1}`}
                  className="absolute -right-2 -top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-md before:absolute before:-inset-2"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Réglages repliés en menus déroulants natifs (roue de sélection sur
          iPhone). Mobile : grille de 2 colonnes, la dernière pilule seule
          prend toute la largeur, coût en dessous ; dès 640 px, une ligne. */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-3">
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto [&>:last-child:nth-child(odd)]:col-span-2">
          <Picker
            label="Type"
            options={(["video", "image"] as const).map((k) => ({ value: k, label: k === "video" ? "Vidéo" : "Image" }))}
            value={kind}
            onChange={setKind}
            disabled={busy}
          />
          {kind === "video" && (
            <Picker
              label="Durée"
              options={VIDEO_DURATIONS.map((d) => ({ value: d, label: `${d} s` }))}
              value={duration}
              onChange={setDuration}
              disabled={busy}
            />
          )}
          <Picker
            label="Format"
            options={ASPECT_RATIOS.map((r) => ({ value: r, label: ASPECT_LABELS[r] }))}
            value={aspectRatio}
            onChange={setAspectRatio}
            disabled={busy}
          />
          {photos.length < PROMPT_RULES.maxImages && !busy && (
            <label className="liquid-glass liquid-glass--interactive flex min-h-9 cursor-pointer items-center justify-center rounded-full px-4 text-sm font-medium text-secondary has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-foreground/85 pointer-coarse:min-h-11">
              + Images
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
        <span className="ml-auto whitespace-nowrap pl-1 text-sm text-secondary">{formatTokens(cost)}</span>
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
            {suspendedContact ? (
              <SuspendedText contact={suspendedContact} />
            ) : (
              <>
                Solde : <strong className="text-foreground">{formatTokens(balance)}</strong>
                {!enoughTokens && (
                  <>
                    {" "}· pas assez.{" "}
                    <Link href="/abonnement" className="underline underline-offset-4">Recharger mes tokens</Link>
                  </>
                )}
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

// Menu déroulant en pilule de verre (type, durée, format). La liste s'ouvre
// en popover, dans la couche supérieure : elle échappe au overflow:hidden de
// la carte. Placée sous le bouton, ou au-dessus faute de place en bas.
// Repris par le chat (CosmosChat).
export function Picker<T extends string | number>({
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
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value)!;

  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current!;
    const menu = menuRef.current!;
    const place = () => {
      const r = trigger.getBoundingClientRect();
      const viewport = document.documentElement;
      menu.style.minWidth = `${r.width}px`;
      const below = r.bottom + 6 + menu.offsetHeight <= viewport.clientHeight - 8 || r.top < menu.offsetHeight + 14;
      menu.style.top = `${below ? r.bottom + 6 : r.top - 6 - menu.offsetHeight}px`;
      menu.style.left = `${Math.max(8, Math.min(r.left, viewport.clientWidth - menu.offsetWidth - 8))}px`;
      menu.style.transformOrigin = below ? "top" : "bottom";
    };
    place();
    menu.dataset.placed = "";
    menu.querySelector<HTMLElement>('[aria-selected="true"]')?.focus();
    addEventListener("scroll", place, true);
    addEventListener("resize", place);
    return () => {
      delete menu.dataset.placed;
      removeEventListener("scroll", place, true);
      removeEventListener("resize", place);
    };
  }, [open]);

  function choose(option: T) {
    onChange(option);
    menuRef.current!.hidePopover();
  }

  // Flèches, Début, Fin : on parcourt la liste ; Tab la referme.
  function onMenuKeyDown(e: React.KeyboardEvent) {
    const items = Array.from(menuRef.current!.querySelectorAll<HTMLElement>('[role="option"]'));
    const i = items.indexOf(document.activeElement as HTMLElement);
    const next = ({ ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: items.length - 1 } as Record<string, number>)[e.key];
    if (next !== undefined) {
      e.preventDefault();
      items[(next + items.length) % items.length].focus();
    } else if (e.key === "Tab") {
      e.preventDefault();
      menuRef.current!.hidePopover();
    }
  }

  return (
    <div>
      <button
        ref={triggerRef}
        type="button"
        popoverTarget={menuId}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${label} : ${current.label}`}
        disabled={disabled}
        className="liquid-glass liquid-glass--interactive flex min-h-9 w-full items-center justify-between gap-2.5 rounded-full pl-4 pr-3.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60 pointer-coarse:min-h-11"
      >
        {/* Largeur du plus long choix réservée : la pilule ne bouge pas. */}
        <span className="grid justify-items-start">
          {options.map((option) => (
            <span key={option.value} aria-hidden="true" className="invisible col-start-1 row-start-1">
              {option.label}
            </span>
          ))}
          <span className="col-start-1 row-start-1">{current.label}</span>
        </span>
        <svg
          viewBox="0 0 12 12"
          aria-hidden="true"
          className={`h-3 w-3 fill-none stroke-current stroke-[1.6] text-secondary transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path d="m3 4.5 3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div
        ref={menuRef}
        id={menuId}
        popover="auto"
        role="listbox"
        aria-label={label}
        // Fermé alors que le focus est dans la liste (choix, Échap, Tab) : il
        // revient au bouton. Un clic ailleurs le déplace ensuite normalement.
        onBeforeToggle={(e) => {
          if (e.newState === "closed" && e.currentTarget.contains(document.activeElement)) triggerRef.current!.focus();
        }}
        onToggle={(e) => setOpen(e.newState === "open")}
        onKeyDown={onMenuKeyDown}
        className="glass-menu space-y-0.5"
      >
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={selected}
              tabIndex={-1}
              onClick={() => choose(option.value)}
              className={`flex min-h-9 w-full items-center whitespace-nowrap rounded-[16px] px-3.5 text-left text-sm font-medium outline-none pointer-coarse:min-h-11 ${selected ? "liquid-glass--accent focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white/80" : "hover:bg-white/60 focus-visible:bg-white/60"}`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
