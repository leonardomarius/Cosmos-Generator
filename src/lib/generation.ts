// Types et outils communs aux générations, toutes rendues sur le PC (WanGP).
import type { AspectRatio, VideoDuration } from "@/config/product";
import type { BodyMeasurements } from "@/lib/body-measurements";

// Identifiant d'une génération (UUID de la table generations) : on refuse tout le reste.
export const GENERATION_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// "url" : la vidéo, ou l'image pour le service image.
export type GenerationStatus =
  | { status: "queued"; position: number | null }
  | { status: "running" }
  | { status: "done"; url: string }
  | { status: "failed"; error: string };

// Ce que le client demande, selon le service.
export type GenerationRequest =
  | { model: "kling4"; photos: Blob[]; measurements: BodyMeasurements }
  | { model: "statue"; photos: Blob[] }
  | { model: "image"; prompt: string; photos: Blob[]; aspectRatio: AspectRatio }
  | { model: "prompt"; prompt: string; duration: VideoDuration; aspectRatio: AspectRatio }
  | { model: "promptImages"; prompt: string; photos: Blob[]; duration: VideoDuration; aspectRatio: AspectRatio };

// URL publique du site (PUBLIC_BASE_URL), pour les liens des emails et le webhook Mollie.
export function publicBaseUrl(): string {
  const base = process.env.PUBLIC_BASE_URL?.replace(/\/+$/, "");
  if (!base?.startsWith("https://")) {
    throw new Error("PUBLIC_BASE_URL manquant dans .env.local (URL https publique, ex. un tunnel en local)");
  }
  return base;
}
