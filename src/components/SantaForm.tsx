"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ConfirmDialog, type Order } from "@/components/TokenShop";
import { SANTA_EFFECT, SANTA_RULES, checkChildName, checkGifts, cleanText } from "@/config/effects";
import { PROMPT_RULES, UPLOAD_RULES, formatTokens } from "@/config/product";
import { checkPhoto, shrinkPhoto } from "@/lib/photo-upload";

type Photo = { file: File; preview: string };
type Result = { url: string; emailed: boolean };

const GIFT_EXAMPLES = ["Un vélo rouge", "Une boîte de LEGO", "Un déguisement de pompier", "Un livre de dinosaures"];

const PRICE = SANTA_EFFECT.priceEur.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
// Le webhook de Mollie peut arriver après le retour du client : on relit le
// compte toutes les 3 s, pendant 30 s au plus. L'achat n'est pas reproposé
// pendant ce temps : un client ne doit pas payer deux fois par impatience.
const CONFIRM_POLL_MS = 3000;
const CONFIRM_POLL_MAX = 10;

const VIDEO_ORDER: Order = {
  id: "video",
  path: "/api/billing/video",
  body: {},
  title: SANTA_EFFECT.title,
  price: PRICE,
  detail: "Paiement en une fois, sans abonnement. Tu ajoutes ensuite la photo et la liste de cadeaux.",
  confirmLabel: "Continuer vers le paiement",
  hint: "Tu vas passer sur la page de paiement sécurisée de Mollie.",
  waiverText: "Je demande la création immédiate de ma vidéo et je renonce à mon droit de rétractation de 14 jours pour ce contenu numérique.",
};

// Formulaire de l'effet "Vidéo du Père Noël" : prénom, photo du visage de
// l'enfant et 1 à 4 cadeaux. La vidéo est assemblée tout de suite par le
// serveur (pas de file d'attente) puis affichée ici et envoyée par email.
// Elle se paie à l'unité, avant de remplir le formulaire, ou en tokens.
// email : celui du compte ; balance : solde de tokens ; purchases : vidéos
// achetées à l'unité et pas encore créées.
export function SantaForm({ email, balance, purchases }: { email: string; balance: number; purchases: number }) {
  const router = useRouter();
  const returnedFromPayment = useSearchParams().get("achat") === "ok";
  const cost = SANTA_EFFECT.tokens;
  const [buying, setBuying] = useState(false);
  const [polls, setPolls] = useState(0);
  const [childName, setChildName] = useState("");
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [gifts, setGifts] = useState<string[]>([""]);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const paid = purchases > 0;
  const waitingForPayment = returnedFromPayment && !paid && !result;

  useEffect(() => {
    if (!waitingForPayment || polls >= CONFIRM_POLL_MAX) return;
    const timer = setTimeout(() => {
      router.refresh();
      setPolls((count) => count + 1);
    }, CONFIRM_POLL_MS);
    return () => clearTimeout(timer);
  }, [waitingForPayment, polls, router]);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const file = input.files?.[0];
    input.value = "";
    setError(null);
    if (!file) return;
    const problem = await checkPhoto(file, UPLOAD_RULES.minDimensionPx);
    if (problem) {
      setError(`${problem} Choisis une photo nette du visage de ton enfant.`);
      return;
    }
    if (photo) URL.revokeObjectURL(photo.preview);
    setPhoto({ file, preview: URL.createObjectURL(file) });
  }

  function removePhoto() {
    if (photo) URL.revokeObjectURL(photo.preview);
    setPhoto(null);
  }

  function setGift(index: number, value: string) {
    setGifts((current) => current.map((g, i) => (i === index ? value : g)));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!photo) {
      setError("Ajoute une photo du visage de ton enfant.");
      return;
    }
    const name = cleanText(childName);
    const list = gifts.map(cleanText);
    const problem = checkChildName(name) ?? checkGifts(list);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setResult(null);
    setBusy(true);
    const body = new FormData();
    body.append("childName", name);
    for (const gift of list) body.append("gifts", gift);
    const shrunk = await shrinkPhoto(photo.file, PROMPT_RULES.maxImageSidePx);
    body.append("photos", new File([shrunk], "enfant.jpg", { type: "image/jpeg" }));
    body.append("consent", String(consent));
    const res = await fetch(`/api/effets/${SANTA_EFFECT.slug}`, { method: "POST", body }).catch(() => null);
    const data = await res?.json().catch(() => null);
    setBusy(false);
    // Tokens retirés (ou rendus après un échec) : on relit le solde.
    router.refresh();
    if (!res?.ok || !data?.url) {
      setError(data?.error ?? "La vidéo n'a pas pu être créée. Réessaie dans un instant.");
      return;
    }
    // L'achat est utilisé : un rechargement de la page ne doit pas annoncer
    // qu'un paiement est encore en attente.
    window.history.replaceState(null, "", window.location.pathname);
    setResult({ url: data.url, emailed: data.emailNotification === true });
  }

  const enoughTokens = balance >= cost;
  const giftsFilled = gifts.every((g) => g.trim().length > 0);
  const canGenerate = photo !== null && giftsFilled && consent && (paid || enoughTokens) && !busy;
  const field =
    "w-full rounded-[20px] border border-foreground/15 bg-white/80 px-4 py-3 text-base placeholder:text-tertiary focus:border-foreground/40 focus:outline-none";

  return (
    <>
      {buying && <ConfirmDialog order={VIDEO_ORDER} onClose={() => setBuying(false)} />}

      {waitingForPayment && (
        <p aria-live="polite" className="liquid-glass mt-10 rounded-[24px] p-5 text-center text-secondary">
          {polls < CONFIRM_POLL_MAX
            ? "Paiement en cours de confirmation…"
            : "Paiement pas encore confirmé. S'il a abouti, recharge cette page dans quelques minutes avant d'acheter à nouveau."}
        </p>
      )}
      {returnedFromPayment && paid && (
        <p aria-live="polite" className="liquid-glass mt-10 rounded-[24px] p-5 text-center font-semibold">
          Paiement confirmé : ajoute la photo et la liste de cadeaux.
        </p>
      )}

      {!paid && !result && !busy && !(waitingForPayment && polls < CONFIRM_POLL_MAX) && (
        <div className="liquid-glass mt-10 rounded-[28px] p-5 sm:p-6">
          <h2 className="text-xl font-semibold">Achat unique · {PRICE}</h2>
          <p className="mt-2 text-secondary">
            Une vidéo, sans abonnement ni tokens. Tu ajoutes la photo et la liste juste après le paiement.
          </p>
          <button
            type="button"
            onClick={() => setBuying(true)}
            className="liquid-glass liquid-glass--interactive liquid-glass--accent mt-4 min-h-12 w-full rounded-full px-4 py-3 font-semibold"
          >
            Acheter la vidéo
          </button>
          <p className="mt-3 text-center text-sm text-secondary">
            {enoughTokens ? (
              <>Ou paie avec tes tokens dans le formulaire ci-dessous : {formatTokens(cost)}.</>
            ) : (
              <>
                Ou en tokens : {formatTokens(cost)}, ton solde est de {formatTokens(balance)}.{" "}
                <Link href="/abonnement" className="underline underline-offset-4">Recharger mes tokens</Link>
              </>
            )}
          </p>
        </div>
      )}

      {(paid || enoughTokens || busy || result) && (
    <form className="mt-10 space-y-6" onSubmit={onSubmit}>
      <label className="block space-y-2">
        <span className="text-sm text-secondary">Prénom de l&apos;enfant (recommandé)</span>
        <input
          type="text"
          value={childName}
          onChange={(e) => setChildName(e.target.value)}
          maxLength={SANTA_RULES.maxNameLength}
          disabled={busy}
          autoComplete="off"
          placeholder="Léa"
          className={field}
        />
        <span className="block text-xs text-tertiary">
          Il apparaît en titre de la liste : « Liste de Noël de Léa ».
        </span>
      </label>

      <div className="space-y-2">
        <span className="text-sm text-secondary">Photo du visage de l&apos;enfant</span>
        {photo ? (
          <div className="liquid-glass relative mx-auto w-48 rounded-[28px] p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.preview} alt="Visage de l'enfant" className="aspect-square w-full rounded-[20px] object-cover" />
            {!busy && (
              <button
                type="button"
                onClick={removePhoto}
                aria-label="Retirer la photo"
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md before:absolute before:-inset-2"
              >
                ×
              </button>
            )}
          </div>
        ) : (
          <label className="liquid-glass liquid-glass--interactive flex min-h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-[28px] p-6 text-center focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-foreground/70">
            <span className="font-semibold">Ajouter une photo</span>
            <span className="text-base text-secondary sm:text-sm">
              Visage de face, net et bien éclairé, l&apos;enfant seul sur la photo.
              Elle apparaîtra telle quelle dans le cadre magique du Père Noël.
            </span>
            <input
              type="file"
              accept={UPLOAD_RULES.acceptedTypes.join(",")}
              onChange={onFileChange}
              disabled={busy}
              className="sr-only"
            />
          </label>
        )}
      </div>

      <fieldset className="space-y-3">
        <legend className="mb-2 text-sm text-secondary">
          Liste de cadeaux ({gifts.length}/{SANTA_RULES.maxGifts})
        </legend>
        {gifts.map((gift, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="text"
              value={gift}
              onChange={(e) => setGift(i, e.target.value)}
              maxLength={SANTA_RULES.maxGiftLength}
              disabled={busy}
              required
              autoComplete="off"
              aria-label={`Cadeau ${i + 1}`}
              placeholder={GIFT_EXAMPLES[i]}
              className={field}
            />
            {gifts.length > SANTA_RULES.minGifts && !busy && (
              <button
                type="button"
                onClick={() => setGifts((current) => current.filter((_, j) => j !== i))}
                aria-label={`Retirer le cadeau ${i + 1}`}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-foreground/8 text-foreground"
              >
                ×
              </button>
            )}
          </div>
        ))}
        {gifts.length < SANTA_RULES.maxGifts && !busy && (
          <button
            type="button"
            onClick={() => setGifts((current) => [...current, ""])}
            className="liquid-glass liquid-glass--interactive min-h-11 rounded-full px-5 text-sm font-medium text-secondary"
          >
            + Ajouter un cadeau
          </button>
        )}
        <p className="text-xs text-tertiary">
          {SANTA_RULES.maxGiftLength} caractères maximum par cadeau, pour que la liste reste bien lisible.
        </p>
      </fieldset>

      <p className="text-sm text-tertiary">
        Vidéo verticale de {SANTA_EFFECT.seconds} secondes, personnalisée avec la photo et la liste.
      </p>

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
          Je suis le parent ou le représentant légal de l&apos;enfant sur la
          photo, et j&apos;accepte qu&apos;elle serve uniquement à créer cette vidéo.
        </span>
      </label>

      <button
        type="submit"
        disabled={!canGenerate}
        className="liquid-glass liquid-glass--interactive liquid-glass--accent w-full rounded-full px-4 py-4 text-base font-semibold disabled:opacity-60 disabled:saturate-50 sm:text-lg"
      >
        {/* Sur mobile, le prix passe sous le libellé au lieu d'une coupure au hasard. */}
        Créer la vidéo du Père Noël<span className="max-sm:hidden"> · </span>
        <span className="max-sm:block max-sm:text-sm max-sm:font-medium max-sm:opacity-85">{paid ? "déjà payée" : formatTokens(cost)}</span>
      </button>
      {!paid && (
        <p className="text-center text-sm text-secondary">
          Solde : <strong className="text-foreground">{formatTokens(balance)}</strong>
          {!enoughTokens && (
            <>
              {" "}· pas assez pour cette vidéo.{" "}
              <Link href="/abonnement" className="underline underline-offset-4">Recharger mes tokens</Link>
            </>
          )}
        </p>
      )}

      {busy && (
        <p className="text-center text-base text-secondary sm:text-sm">
          Le Père Noël prépare ta vidéo… quelques secondes, ne ferme pas la page.
        </p>
      )}
      {result && (
        <div className="space-y-3">
          {result.emailed && (
            <p className="text-center text-base text-secondary sm:text-sm">
              Elle t&apos;a aussi été envoyée à <strong className="text-foreground">{email}</strong>.
            </p>
          )}
          <p className="text-center text-xs text-tertiary">Généré par Cosmos</p>
          <video
            src={result.url}
            controls
            autoPlay
            playsInline
            className="mx-auto max-h-[80dvh] w-auto max-w-full rounded-[28px] shadow-2xl shadow-black/20"
          />
        </div>
      )}
    </form>
      )}
    </>
  );
}
