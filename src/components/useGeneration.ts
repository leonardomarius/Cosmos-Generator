"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { GENERATION, type ModelId } from "@/config/product";
import type { GenerationStatus } from "@/lib/generation";

// Lancement d'une génération (POST /api/generations) puis suivi de son
// avancement jusqu'au résultat. Partagé par tous les formulaires.
export function useGeneration(email: string | null) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  // Adresse à laquelle le résultat sera envoyé, une fois la génération lancée.
  const [notifiedEmail, setNotifiedEmail] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  // Modèle de la génération en cours : c'est lui qu'on interroge pour le suivi.
  const [job, setJob] = useState<{ requestId: string; model: ModelId } | null>(null);
  const [generation, setGeneration] = useState<GenerationStatus | null>(null);
  // Clé de la demande en cours d'envoi : un double clic renvoie la même, et
  // le serveur ne crée qu'une génération.
  const pendingKey = useRef<string | null>(null);

  async function start(model: ModelId, body: FormData) {
    if (pendingKey.current) return;
    const key = crypto.randomUUID();
    pendingKey.current = key;
    setError(null);
    setGeneration(null);
    setNotifiedEmail(null);
    setStarting(true);
    body.append("model", model);
    body.append("idempotencyKey", key);
    const res = await fetch("/api/generations", { method: "POST", body }).catch(() => null);
    const data = res
      ? await res.json().catch(() => ({ error: "Impossible de lancer la génération." }))
      : { error: "Connexion perdue : vérifie ton réseau et réessaie." };
    pendingKey.current = null;
    setStarting(false);
    // Tokens retirés (ou rendus après un échec) : on relit le solde.
    router.refresh();
    if (!res?.ok) {
      setError(data.error);
      return;
    }
    // En local sans PUBLIC_BASE_URL, aucun email ne part : on ne le promet pas.
    setNotifiedEmail(data.emailNotification ? email : null);
    setGeneration({ status: "queued", position: null });
    setJob({ requestId: data.requestId, model });
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
  return { start, error, setError, notifiedEmail, starting, generation, busy };
}
