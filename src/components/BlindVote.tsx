"use client";

import { useState, useSyncExternalStore } from "react";
import { VOTE_CRITERIA, type PairScores, type VideoScores, type VotePair } from "@/lib/presets/vote";

type Side = "a" | "b";
type Draft = Record<Side, Partial<VideoScores>>;
const EMPTY_DRAFT: Draft = { a: {}, b: {} };
const SIDES: readonly Side[] = ["a", "b"];

// Identifiant du votant et paires déjà notées, gardés dans son navigateur : il
// peut revenir plus tard. Stockage indisponible (navigation privée…) : le vote
// marche quand même, en une seule fois.
function storageKey(campaignId: string) {
  return `preset-vote:${campaignId}`;
}

function readProgress(campaignId: string): { raterId: string; done: number } | null {
  try {
    const saved = localStorage.getItem(storageKey(campaignId));
    return saved ? (JSON.parse(saved) as { raterId: string; done: number }) : null;
  } catch {
    return null;
  }
}

function writeProgress(campaignId: string, progress: { raterId: string; done: number }) {
  try {
    localStorage.setItem(storageKey(campaignId), JSON.stringify(progress));
  } catch {}
}

// Une lecture stable pour React : sur le serveur, pas de progression.
const subscribeToNothing = () => () => {};

// Le côté où chaque vidéo s'affiche dépend du votant : chacun voit les paires
// dans un ordre gauche/droite différent.
function flipped(raterId: string, pairIndex: number): boolean {
  const seed = parseInt(raterId.replace(/-/g, "").slice(pairIndex % 24, (pairIndex % 24) + 8), 16);
  return seed % 2 === 1;
}

export function BlindVote({ campaignId, pairs }: { campaignId: string; pairs: VotePair[] }) {
  const stored = useSyncExternalStore(
    subscribeToNothing,
    () => localStorage.getItem(storageKey(campaignId)),
    () => null,
  );
  const [started, setStarted] = useState<{ raterId: string; done: number } | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const progress = started ?? (stored ? readProgress(campaignId) : null);
  const raterId = progress?.raterId ?? null;
  const index = progress?.done ?? 0;

  function start() {
    const fresh = { raterId: crypto.randomUUID(), done: 0 };
    writeProgress(campaignId, fresh);
    setStarted(fresh);
  }

  if (!raterId) {
    return (
      <div className="liquid-glass mt-10 space-y-5 rounded-[28px] p-6 text-center">
        <p className="text-secondary">
          {pairs.length} paires de vidéos, environ {Math.max(1, Math.round(pairs.length * 1.5))} minutes. Tu peux t&apos;arrêter et revenir plus tard.
        </p>
        <button
          type="button"
          onClick={start}
          className="liquid-glass liquid-glass--interactive liquid-glass--accent inline-flex min-h-11 items-center rounded-full px-6 font-semibold"
        >
          Commencer
        </button>
      </div>
    );
  }

  if (index >= pairs.length) {
    return <p className="liquid-glass mt-10 rounded-[28px] p-6 text-center text-secondary">C&apos;est terminé, merci pour ton aide !</p>;
  }

  const pair = pairs[index];
  const order: readonly Side[] = flipped(raterId, index) ? ["b", "a"] : SIDES;
  const complete = SIDES.every((side) => VOTE_CRITERIA.every(({ id }) => draft[side][id] !== undefined));

  async function next() {
    if (!complete || !raterId) return;
    setSaving(true);
    setError(null);
    const res = await fetch("/api/lab/votes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaignId, raterId, pairIndex: index, scores: draft as PairScores }),
    }).catch(() => null);
    setSaving(false);
    if (!res?.ok) {
      setError("Ta note n'a pas été enregistrée. Réessaie dans un instant.");
      return;
    }
    const advanced = { raterId, done: index + 1 };
    writeProgress(campaignId, advanced);
    setStarted(advanced);
    setDraft(EMPTY_DRAFT);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="mt-10 space-y-6">
      <p className="text-sm font-medium text-secondary">
        Paire {index + 1} sur {pairs.length}
      </p>

      <div className="liquid-glass flex items-center gap-4 rounded-[24px] p-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={pair.photo} alt="Photo de la personne à retrouver" className="h-24 w-20 shrink-0 rounded-2xl object-cover" />
        <p className="text-base text-secondary sm:text-sm">La vraie personne&nbsp;: c&apos;est elle qu&apos;on doit reconnaître dans les vidéos.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {order.map((side, position) => (
          <section key={side} className="liquid-glass rounded-[28px] p-2">
            <video
              key={pair[side]}
              src={pair[side]}
              controls
              playsInline
              preload="metadata"
              className="aspect-[9/16] w-full rounded-[20px] bg-black object-contain"
            />
            <div className="space-y-4 px-2 pb-3 pt-4">
              <h2 className="font-semibold">Vidéo {position === 0 ? "1" : "2"}</h2>
              {VOTE_CRITERIA.map(({ id, label, hint }) => (
                <fieldset key={id}>
                  <legend className="text-base font-medium sm:text-sm">{label}</legend>
                  <p className="text-sm text-secondary sm:text-xs">{hint}</p>
                  <div className="mt-2 grid grid-cols-5 gap-1.5">
                    {[1, 2, 3, 4, 5].map((note) => {
                      const selected = draft[side][id] === note;
                      return (
                        <button
                          key={note}
                          type="button"
                          aria-pressed={selected}
                          aria-label={`${label} : ${note} sur 5`}
                          onClick={() => setDraft((current) => ({ ...current, [side]: { ...current[side], [id]: note } }))}
                          className={`min-h-11 rounded-2xl text-base font-semibold transition-colors ${selected ? "bg-(--brand) text-white" : "bg-foreground/8 text-foreground hover:bg-foreground/15"}`}
                        >
                          {note}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              ))}
            </div>
          </section>
        ))}
      </div>

      {error && <p className="rounded-2xl border border-red-600/20 bg-red-500/10 px-4 py-3 text-base text-red-700 sm:text-sm">{error}</p>}

      <button
        type="button"
        onClick={next}
        disabled={!complete || saving}
        className="liquid-glass liquid-glass--interactive liquid-glass--accent w-full rounded-full px-4 py-4 text-base font-semibold disabled:opacity-60 disabled:saturate-50 sm:text-lg"
      >
        {saving ? "Enregistrement…" : index + 1 === pairs.length ? "Terminer" : "Paire suivante"}
      </button>
    </div>
  );
}
