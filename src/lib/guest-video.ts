// Vidéo du Père Noël achetée sans compte (ni connexion ni inscription). Rien
// en base : le paiement Mollie fait foi, et le bucket des vidéos sert de
// registre, dans le dossier de l'effet (purgé après PRODUCT.retentionDays) :
// - "invite-<paiement>.lock" : le paiement est en cours d'utilisation. L'envoi
//   sans écrasement est atomique : deux commandes simultanées ne passent pas.
// - "invite-<paiement>.mp4" : la vidéo de ce paiement, déjà créée.
// Un paiement donne une seule vidéo ; il reste valable après un rendu échoué
// ou interrompu, et n'est plus accepté une fois sa vidéo purgée.
import { PRODUCT } from "@/config/product";
import { guestVideoPayment } from "@/lib/mollie";
import { signedVideoUrl, videosBucket } from "@/lib/video-storage";

// Au-delà de la limite de la route (maxDuration), un rendu encore verrouillé a
// été interrompu par la plateforme.
const INTERRUPTED_AFTER_MS = 10 * 60 * 1000;
const VALID_FOR_MS = PRODUCT.retentionDays * 24 * 60 * 60 * 1000;

const files = (folder: string, paymentId: string) => ({
  name: `invite-${paymentId}`,
  video: `${folder}/invite-${paymentId}.mp4`,
  lock: `${folder}/invite-${paymentId}.lock`,
});

// Fichiers de ce paiement présents dans le bucket, avec leur date d'envoi.
async function existing(folder: string, paymentId: string) {
  const { name } = files(folder, paymentId);
  const listed = await (await videosBucket()).list(folder, { search: name, limit: 10 });
  if (listed.error) throw listed.error;
  const find = (ext: string) => listed.data.find((f) => f.name === `${name}.${ext}`);
  return { video: find("mp4"), lock: find("lock") };
}

export type GuestPurchase =
  | { state: "available" }
  | { state: "used"; url: string }
  | { state: "pending" }
  | { state: "invalid" };

// Où en est l'achat : à créer, déjà créé (lien de la vidéo), paiement pas
// encore confirmé, ou inutilisable.
export async function guestPurchase(effect: { id: string; slug: string }, paymentId: string): Promise<GuestPurchase> {
  const payment = await guestVideoPayment(paymentId, effect.id);
  if (payment.status !== "paid") return { state: payment.status };
  const { video } = await existing(effect.slug, paymentId);
  if (video) return { state: "used", url: await signedVideoUrl(files(effect.slug, paymentId).video) };
  if (Date.now() - payment.paidAt! > VALID_FOR_MS) return { state: "invalid" };
  return { state: "available" };
}

// Réserve l'achat pour un rendu. false si un autre rendu est déjà en cours.
export async function lockGuestPurchase(folder: string, paymentId: string): Promise<boolean> {
  const bucket = await videosBucket();
  const { lock } = files(folder, paymentId);
  const body = new Blob([new Date().toISOString()], { type: "text/plain" });
  for (let attempt = 0; attempt < 2; attempt++) {
    const uploaded = await bucket.upload(lock, body, { upsert: false, contentType: "text/plain" });
    if (!uploaded.error) return true;
    const current = (await existing(folder, paymentId)).lock;
    const startedAt = Date.parse(current?.created_at ?? "");
    // Verrou d'un rendu interrompu : libéré, puis on réessaie une fois.
    if (current && Date.now() - startedAt < INTERRUPTED_AFTER_MS) return false;
    const removed = await bucket.remove([lock]);
    if (removed.error) throw removed.error;
  }
  return false;
}

// Rendu échoué : l'achat redevient disponible.
export async function releaseGuestPurchase(folder: string, paymentId: string): Promise<void> {
  const removed = await (await videosBucket()).remove([files(folder, paymentId).lock]);
  if (removed.error) throw removed.error;
}

// Nom de la vidéo d'un achat sans compte dans le bucket.
export function guestVideoFile(folder: string, paymentId: string): string {
  return files(folder, paymentId).video;
}
