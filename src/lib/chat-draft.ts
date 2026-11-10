// Brouillon passé de l'accueil au chat (/chat), pour que le client continue
// d'écrire sans rien perdre.
// - En mémoire : tout, images comprises. Lu dès le premier rendu du chat
//   (navigation côté client), sans attendre le serveur.
// - sessionStorage : le texte et les réglages seulement, pour les retrouver
//   après un rechargement ou un aller-retour par la page de connexion.
import {
  isAspectRatio,
  isVideoDuration,
  type AspectRatio,
  type VideoDuration,
} from "@/config/product";

// "star" : preset de la vidéo de star (une photo, mensurations facultatives).
export type GenerationKind = "image" | "video" | "star";
export type DraftPhoto = { file: File; preview: string };

export type ChatDraft = {
  prompt: string;
  kind: GenerationKind;
  duration: VideoDuration;
  aspectRatio: AspectRatio;
  consent: boolean;
  photos: DraftPhoto[];
};

// Au-delà de ce nombre de caractères tapés dans le générateur de l'accueil,
// le client part sur le chat.
export const CHAT_HANDOFF_CHARS = 13;

const STORAGE_KEY = "cosmos-chat-draft";

let handedOff: Partial<ChatDraft> | null = null;

// Appelé par le générateur de l'accueil à chaque frappe, jusqu'à l'affichage
// du chat : les dernières lettres tapées pendant la transition suivent.
export function handOffToChat(draft: ChatDraft) {
  handedOff = draft;
  storeChatDraft(draft);
}

// Carte du hero : le chat s'ouvre dans ce mode, champ vide.
export function chooseChatKind(kind: GenerationKind) {
  handedOff = { kind };
}

// Lu au premier rendu du chat (sans effet de bord : React peut l'appeler
// deux fois), puis oublié une fois le chat affiché.
export function peekHandedOffDraft(): Partial<ChatDraft> | null {
  return handedOff;
}

export function forgetHandedOffDraft() {
  handedOff = null;
}

export function storeChatDraft({ prompt, kind, duration, aspectRatio }: Omit<ChatDraft, "photos" | "consent">) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ prompt, kind, duration, aspectRatio }));
  } catch {}
}

export function clearChatDraft() {
  handedOff = null;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {}
}

// Contenu de sessionStorage vérifié champ par champ : il a pu être modifié.
export function readStoredDraft(): Partial<ChatDraft> | null {
  try {
    const raw = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "null");
    if (!raw || typeof raw !== "object") return null;
    const draft: Partial<ChatDraft> = {};
    if (typeof raw.prompt === "string") draft.prompt = raw.prompt;
    if (raw.kind === "image" || raw.kind === "video" || raw.kind === "star") draft.kind = raw.kind;
    if (isVideoDuration(raw.duration)) draft.duration = raw.duration;
    if (isAspectRatio(raw.aspectRatio)) draft.aspectRatio = raw.aspectRatio;
    return draft;
  } catch {
    return null;
  }
}
