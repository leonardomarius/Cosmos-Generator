"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, use, useEffect, useLayoutEffect, useRef, useState } from "react";
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
import {
  clearChatDraft,
  forgetHandedOffDraft,
  peekHandedOffDraft,
  readStoredDraft,
  storeChatDraft,
  type ChatDraft,
  type DraftPhoto,
  type GenerationKind,
} from "@/lib/chat-draft";
import type { GenerationStatus } from "@/lib/fal";
import { checkPhoto, shrinkPhoto } from "@/lib/photo-upload";
import { SuspendedText } from "@/components/AccountNotices";
import { GenerationProgress } from "@/components/GenerationProgress";
import { MeasurementsFields, type MeasurementValues } from "@/components/MeasurementsFields";
import { ASPECT_LABELS, Picker } from "@/components/PromptStudio";
import { readBodyMeasurements } from "@/lib/body-measurements";
import { useGeneration } from "@/components/useGeneration";

// suspendedContact : compte bloqué, l'adresse de contact à afficher.
export type ChatAccount = { email: string; balance: number; suspendedContact?: string | null };

// État d'une réponse : celui de useGeneration, figé quand la demande suivante
// part (le hook ne suit qu'une génération à la fois).
type Outcome = { generation: GenerationStatus | null; error: string | null; notifiedEmail: string | null };

type Turn = {
  id: number;
  prompt: string;
  kind: GenerationKind;
  // « Vidéo · 5 s · Portrait · 75 tokens »
  details: string;
  photos: string[];
  // Absent pour la demande en cours : elle affiche le hook en direct.
  outcome?: Outcome;
};

// Chat de génération : chaque message envoyé lance une génération, avec la
// même requête que le générateur de l'accueil (POST /api/generations via
// useGeneration), et la réponse affiche son avancement puis le résultat.
// account : promesse du compte (null si non connecté), lue sans bloquer
// l'affichage, pour que le client continue d'écrire dès son arrivée.
export function CosmosChat({ account }: { account: Promise<ChatAccount | null> }) {
  // undefined tant que le compte n'est pas encore lu.
  const [session, setSession] = useState<ChatAccount | null | undefined>(undefined);
  // Brouillon passé par l'accueil : présent dès le premier rendu, le texte
  // est là avant la frappe suivante.
  const [handedOff] = useState(peekHandedOffDraft);
  // Sinon (chargement direct, retour de connexion), celui de l'onglet.
  const [restored, setRestored] = useState<Partial<ChatDraft> | null>(null);

  useEffect(() => forgetHandedOffDraft(), []);

  return (
    <>
      <Suspense fallback={null}>
        <AccountReader account={account} onRead={setSession} />
      </Suspense>
      {!handedOff && (
        <Suspense fallback={null}>
          <DraftReader onRead={setRestored} />
        </Suspense>
      )}
      {/* Remonté une fois le brouillon de l'onglet lu : il sert d'état initial. */}
      <ChatView key={restored ? "restored" : "initial"} account={session} draft={restored ?? handedOff ?? {}} />
    </>
  );
}

function AccountReader({
  account,
  onRead,
}: {
  account: Promise<ChatAccount | null>;
  onRead: (account: ChatAccount | null) => void;
}) {
  const value = use(account);
  useLayoutEffect(() => onRead(value), [value, onRead]);
  return null;
}

// Brouillon gardé dans l'onglet (texte et réglages), et mode demandé par
// l'adresse (/chat?type=image), qui l'emporte.
function DraftReader({ onRead }: { onRead: (draft: Partial<ChatDraft>) => void }) {
  const type = useSearchParams().get("type");
  const read = useRef(false);
  useLayoutEffect(() => {
    if (read.current) return;
    read.current = true;
    const draft = readStoredDraft() ?? {};
    if (type === "image" || type === "video" || type === "star") draft.kind = type;
    if (Object.keys(draft).length > 0) onRead(draft);
  }, [type, onRead]);
  return null;
}

function ChatView({ account, draft }: { account: ChatAccount | null | undefined; draft: Partial<ChatDraft> }) {
  const [kind, setKind] = useState<GenerationKind>(draft.kind ?? "video");
  const [prompt, setPrompt] = useState(draft.prompt ?? "");
  const [photos, setPhotos] = useState<DraftPhoto[]>(draft.photos ?? []);
  const [duration, setDuration] = useState<VideoDuration>(draft.duration ?? 5);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(draft.aspectRatio ?? "9:16");
  const [consent, setConsent] = useState(draft.consent ?? false);
  const [measurements, setMeasurements] = useState<MeasurementValues>({});
  const [inputError, setInputError] = useState<string | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const { start, error, notifiedEmail, starting, generation, busy } = useGeneration(account?.email ?? null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Le client continue d'écrire là où il s'était arrêté : curseur à la fin.
  useLayoutEffect(() => {
    // Lettres tapées sur l'accueil entre le rendu du chat et son affichage
    // (début de la transition) : le brouillon en mémoire est plus récent.
    // Le champ reçoit aussi le texte tout de suite : la mise à jour d'état
    // peut n'arriver qu'après la frappe suivante, qui doit s'y ajouter.
    const latest = peekHandedOffDraft()?.prompt;
    const textarea = textareaRef.current!;
    if (latest !== undefined && latest !== draft.prompt) {
      textarea.value = latest;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- rattrapage unique, avant l'affichage
      setPrompt(latest);
    }
    textarea.focus({ preventScroll: true });
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
  }, [draft.prompt]);

  // La conversation descend avec chaque nouveau message et chaque étape,
  // jusqu'au-dessus du champ de saisie collé en bas.
  useEffect(() => {
    const end = endRef.current;
    if (turns.length === 0 || !end) return;
    end.style.scrollMarginBottom = `${formRef.current?.offsetHeight ?? 0}px`;
    end.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [turns.length, starting, generation?.status]);

  const star = kind === "star";
  const model: ModelId = star ? "kling4" : kind === "image" ? "image" : photos.length > 0 ? "promptImages" : "prompt";
  const cost = tokensFor(model, duration);
  const enoughTokens = !account || account.balance >= cost;
  const needsConsent = photos.length > 0;
  // Vidéo de star : une photo de la personne (en pied, puis un gros plan facultatif), sans texte.
  const maxPhotos = star ? UPLOAD_RULES.maxPhotos : PROMPT_RULES.maxImages;
  const hasInput = star ? photos.length > 0 : prompt.trim().length > 0;
  const canGenerate = !!account && hasInput && (!needsConsent || consent) && enoughTokens && !busy;

  // Texte et réglages gardés dans l'onglet (retour de la page de connexion).
  function remember(patch: Partial<Pick<ChatDraft, "prompt" | "kind" | "duration" | "aspectRatio">>) {
    storeChatDraft({ prompt, kind, duration, aspectRatio, ...patch });
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const picked = Array.from(input.files ?? []);
    input.value = "";
    setInputError(null);

    if (picked.length > maxPhotos - photos.length) {
      setInputError(`${maxPhotos} images maximum.`);
      return;
    }
    const added: DraftPhoto[] = [];
    for (const file of picked) {
      const problem = await checkPhoto(file, PROMPT_RULES.minDimensionPx);
      if (problem) {
        added.forEach((p) => URL.revokeObjectURL(p.preview));
        setInputError(problem);
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

  // Envoi d'un message : la demande précédente est figée dans la
  // conversation, le champ est vidé, puis la génération part. Les aperçus des
  // images restent affichés dans le message envoyé.
  async function send(e?: React.FormEvent) {
    e?.preventDefault();
    if (!canGenerate) return;
    const sizes = star ? readBodyMeasurements((id) => measurements[id]) : {};
    if ("error" in sizes) {
      setInputError(sizes.error);
      return;
    }
    const text = prompt.trim() || (star ? "Vidéo de star" : "");
    const sent = photos;
    const details = (star ? ["Vidéo de star", formatTokens(cost)] : [
      kind === "video" ? "Vidéo" : "Image",
      kind === "video" && `${duration} s`,
      ASPECT_LABELS[aspectRatio],
      formatTokens(cost),
    ])
      .filter(Boolean)
      .join(" · ");
    setTurns((current) => [
      ...current.map((turn) => turn.outcome ? turn : { ...turn, outcome: { generation, error, notifiedEmail } }),
      { id: Date.now(), prompt: text, kind, details, photos: sent.map((p) => p.preview) },
    ]);
    setPrompt("");
    setPhotos([]);
    setConsent(false);
    setInputError(null);
    clearChatDraft();

    const body = new FormData();
    if (star) {
      for (const [id, value] of Object.entries(sizes)) body.append(id, String(value));
      // Réduites à 2048 px : assez pour garder les détails du visage sur une photo en pied.
      for (const [i, photo] of sent.entries()) {
        body.append("photos", new File([await shrinkPhoto(photo.file, 2048)], `photo-${i + 1}.jpg`, { type: "image/jpeg" }));
      }
      body.append("consent", String(consent));
      await start(model, body);
      return;
    }
    body.append("prompt", text);
    body.append("aspectRatio", aspectRatio);
    if (kind === "video") body.append("duration", String(duration));
    for (const [i, photo] of sent.entries()) {
      const shrunk = await shrinkPhoto(photo.file, PROMPT_RULES.maxImageSidePx);
      body.append("photos", new File([shrunk], `image-${i + 1}.jpg`, { type: "image/jpeg" }));
    }
    body.append("consent", String(consent));
    await start(model, body);
  }

  // Entrée envoie, Maj+Entrée va à la ligne. Au toucher, Entrée va à la
  // ligne : on envoie avec le bouton.
  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key !== "Enter" || e.shiftKey || e.nativeEvent.isComposing) return;
    if (!matchMedia("(pointer: fine)").matches) return;
    e.preventDefault();
    e.currentTarget.form?.requestSubmit();
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-8 pb-8 pt-6 sm:pt-10">
        {turns.length === 0 ? (
          <Welcome star={star} />
        ) : (
          <>
            <h1 className="sr-only">Chat Cosmos Generator</h1>
            {turns.map((turn) => (
              <div key={turn.id} className="space-y-4">
                <UserMessage turn={turn} />
                <Reply
                  kind={turn.kind}
                  outcome={turn.outcome ?? { generation, error, notifiedEmail }}
                  starting={!turn.outcome && starting}
                />
              </div>
            ))}
          </>
        )}
        <div ref={endRef} />
      </div>

      {star && (
        <div className="pb-4">
          <MeasurementsFields
            values={measurements}
            onChange={(id, value) => {
              setInputError(null);
              setMeasurements((current) => ({ ...current, [id]: value }));
            }}
            disabled={busy}
          />
        </div>
      )}

      {/* Champ de saisie collé en bas de l'écran ; la conversation défile
          derrière le verre. */}
      <form ref={formRef} onSubmit={send} className="sticky bottom-0 z-10 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2">
        <div className="liquid-glass space-y-2 rounded-[28px] p-2">
          {photos.length > 0 && (
            <div className="flex flex-wrap gap-3 px-2 pt-2">
              {photos.map((photo, i) => (
                <div key={photo.preview} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.preview} alt={`Image ${i + 1}`} className="h-14 w-14 rounded-2xl object-cover" />
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

          <label className="block">
            <span className="sr-only">Message</span>
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                remember({ prompt: e.target.value });
              }}
              onKeyDown={onKeyDown}
              maxLength={PROMPT_RULES.maxLength}
              rows={2}
              placeholder={
                star
                  ? "Ajoute une photo en pied de la personne : aucun texte nécessaire."
                  : kind === "video"
                    ? "Décris ta vidéo : un astronaute qui surfe sur les anneaux de Saturne…"
                    : "Décris ton image : un portrait de mon chat en général romain…"
              }
              className="block max-h-[40dvh] min-h-14 w-full resize-none bg-transparent px-3 pt-2 text-base leading-relaxed [field-sizing:content] placeholder:text-tertiary focus:outline-none"
            />
          </label>

          {needsConsent && (
            <label className="flex items-start gap-3 px-3 text-sm leading-relaxed text-secondary">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 accent-(--brand)"
                required
              />
              <span>
                Si une personne figure sur mes images, je certifie être cette
                personne ou avoir son accord explicite, et qu&apos;elle est majeure.
              </span>
            </label>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <Picker
              label="Type"
              options={(["video", "star", "image"] as const).map((k) => ({ value: k, label: KIND_LABELS[k] }))}
              value={kind}
              onChange={(value) => {
                setKind(value);
                remember({ kind: value });
                // La vidéo de star prend au plus 2 photos : les autres sont retirées.
                if (value === "star" && photos.length > UPLOAD_RULES.maxPhotos) {
                  photos.slice(UPLOAD_RULES.maxPhotos).forEach((p) => URL.revokeObjectURL(p.preview));
                  setPhotos(photos.slice(0, UPLOAD_RULES.maxPhotos));
                }
              }}
              disabled={busy}
            />
            {kind === "video" && (
              <Picker
                label="Durée"
                options={VIDEO_DURATIONS.map((d) => ({ value: d, label: `${d} s` }))}
                value={duration}
                onChange={(value) => {
                  setDuration(value);
                  remember({ duration: value });
                }}
                disabled={busy}
              />
            )}
            {!star && <Picker
              label="Format"
              options={ASPECT_RATIOS.map((r) => ({ value: r, label: ASPECT_LABELS[r] }))}
              value={aspectRatio}
              onChange={(value) => {
                setAspectRatio(value);
                remember({ aspectRatio: value });
              }}
              disabled={busy}
            />}
            {photos.length < maxPhotos && !busy && (
              <label
                title="Ajouter des images"
                className="liquid-glass liquid-glass--interactive flex size-9 cursor-pointer items-center justify-center rounded-full text-secondary has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-foreground/85 pointer-coarse:size-11"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-none stroke-current stroke-2">
                  <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-11ZM4 16l4.3-4.3a1.5 1.5 0 0 1 2.1 0L16 17.3M14 14l1.3-1.3a1.5 1.5 0 0 1 2.1 0L20 15.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="sr-only">Ajouter des images (facultatif)</span>
                <input
                  type="file"
                  multiple
                  accept={UPLOAD_RULES.acceptedTypes.join(",")}
                  onChange={onFileChange}
                  className="sr-only"
                />
              </label>
            )}

            <div className="ml-auto flex items-center gap-3 pl-1">
              <span className="whitespace-nowrap text-sm text-secondary max-xs:hidden">{formatTokens(cost)}</span>
              {account === null ? (
                <Link
                  href="/connexion?next=/chat"
                  aria-label="Se connecter pour générer"
                  className="liquid-glass liquid-glass--interactive liquid-glass--accent flex size-11 items-center justify-center rounded-full"
                >
                  <SendIcon />
                </Link>
              ) : (
                <button
                  type="submit"
                  disabled={!canGenerate}
                  aria-label={`Générer ${kind === "image" ? "l'image" : "la vidéo"} · ${formatTokens(cost)}`}
                  className="liquid-glass liquid-glass--interactive liquid-glass--accent flex size-11 items-center justify-center rounded-full disabled:opacity-50 disabled:saturate-50"
                >
                  <SendIcon />
                </button>
              )}
            </div>
          </div>

          {inputError && (
            <p className="rounded-2xl border border-red-600/20 bg-red-500/10 px-4 py-3 text-sm text-red-700">{inputError}</p>
          )}
          <ComposerNote account={account} cost={cost} enoughTokens={enoughTokens} />
        </div>
      </form>
    </div>
  );
}

const KIND_LABELS: Record<GenerationKind, string> = { video: "Vidéo", star: "Vidéo de star", image: "Image" };

// En haut, sur du verre : le centre de l'écran reste à la fresque (logo et
// mains), sur laquelle un texte ne se lirait pas.
function Welcome({ star }: { star: boolean }) {
  return (
    <div className="liquid-glass mx-auto flex w-full max-w-xl flex-col items-center rounded-[32px] px-6 py-7 text-center sm:py-8">
      <span className="glass-icon" aria-hidden="true">
        <SparkleIcon />
      </span>
      <h1 className="mt-5 text-title font-semibold">Que veux-tu créer ?</h1>
      <p className="mt-3 max-w-md text-lg leading-relaxed text-secondary">
        {star
          ? "Ajoute une photo de la personne : Cosmos la fait arriver en star, entre gardes du corps et fans. Le résultat s'affiche ici."
          : "Décris une vidéo ou une image : le résultat s'affiche ici, dans la conversation."}
      </p>
    </div>
  );
}

// Ligne d'aide sous les réglages : connexion, solde. Sous 375 px, le coût
// y passe aussi : à côté du bouton, il ferait passer celui-ci à la ligne.
function ComposerNote({
  account,
  cost,
  enoughTokens,
}: {
  account: ChatAccount | null | undefined;
  cost: number;
  enoughTokens: boolean;
}) {
  const costPrefix = <span className="xs:hidden">{formatTokens(cost)} · </span>;
  if (account === undefined) {
    return <p className="px-3 pb-1 text-sm text-secondary xs:hidden">{formatTokens(cost)}</p>;
  }
  if (account === null) {
    return (
      <p className="px-3 pb-1 text-sm text-secondary">
        {costPrefix}
        <Link href="/connexion?next=/chat" className="font-semibold text-foreground underline underline-offset-4">
          Connecte-toi
        </Link>{" "}
        pour générer : ton texte sera gardé.
      </p>
    );
  }
  if (account.suspendedContact) {
    return (
      <p className="px-3 pb-1 text-sm text-secondary">
        <SuspendedText contact={account.suspendedContact} />
      </p>
    );
  }
  return (
    <p className="px-3 pb-1 text-sm text-secondary">
      {costPrefix}
      Solde : <strong className="text-foreground">{formatTokens(account.balance)}</strong>
      {!enoughTokens && (
        <>
          {" "}· pas assez.{" "}
          <Link href="/abonnement" className="underline underline-offset-4">Recharger mes tokens</Link>
        </>
      )}
    </p>
  );
}

function UserMessage({ turn }: { turn: Turn }) {
  return (
    <div className="flex flex-col items-end gap-2 pl-10 sm:pl-24">
      {turn.photos.length > 0 && (
        <div className="flex flex-wrap justify-end gap-2">
          {turn.photos.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} src={src} alt={`Image ${i + 1} envoyée`} className="h-16 w-16 rounded-2xl object-cover" />
          ))}
        </div>
      )}
      {/* Réglages dans la bulle : posés sur la fresque, ils ne se liraient pas. */}
      <div className="liquid-glass liquid-glass--accent rounded-[24px] rounded-br-lg px-4 py-3">
        <p className="whitespace-pre-wrap text-base leading-relaxed">{turn.prompt}</p>
        <p className="mt-1.5 text-xs text-white/80">{turn.details}</p>
      </div>
    </div>
  );
}

function Reply({ kind, outcome, starting }: { kind: GenerationKind; outcome: Outcome; starting: boolean }) {
  const { generation, error, notifiedEmail } = outcome;
  const empty = !starting && !error && !generation;
  return (
    <div className="flex items-start gap-3 pr-6 sm:pr-24">
      <span className="glass-icon size-9 shrink-0 rounded-[32%]" aria-hidden="true">
        <SparkleIcon size={18} />
      </span>
      <div className="liquid-glass min-w-0 flex-1 space-y-3 rounded-[24px] rounded-tl-lg p-4">
        {starting && <p className="text-secondary">Envoi de ta demande…</p>}
        {error && (
          <p className="rounded-2xl border border-red-600/20 bg-red-500/10 px-4 py-3 text-sm text-red-700">{error}</p>
        )}
        {empty && <p className="text-secondary">Demande interrompue.</p>}
        <GenerationProgress kind={kind === "image" ? "image" : "video"} generation={generation} notifiedEmail={notifiedEmail} />
      </div>
    </div>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="h-5 w-5 fill-none stroke-current stroke-[2.2]">
      <path d="M10 16V4M5 9l5-5 5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SparkleIcon({ size = 22 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3.5 13.9 9l5.6 1.9-5.6 1.9L12 18.3l-1.9-5.5-5.6-1.9L10.1 9 12 3.5ZM18.5 16.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z" />
    </svg>
  );
}
