import { SANTA_EFFECT, SANTA_RULES, SANTA_TEMPLATE, checkChildName, checkGifts, cleanText } from "@/config/effects";
import { UPLOAD_RULES, accountSuspendedMessage } from "@/config/product";
import { sendSantaVideoEmail } from "@/lib/email";
import { renderSantaVideo, unsupportedCharacters } from "@/lib/santa-video";
import { currentUser } from "@/lib/supabase";
import { AccountBlockedError, InsufficientTokensError, reserveGeneration, settleGeneration } from "@/lib/tokens";
import { storeVideo } from "@/lib/video-storage";

// L'assemblage prend quelques secondes ; marge pour un serveur plus lent.
export const maxDuration = 60;

type Invalid = { error: string };
type SantaOrder = { childName: string | null; gifts: string[]; photo: File };

// Commande du client : mêmes règles que dans le navigateur, on ne lui fait
// jamais confiance.
async function readOrder(form: FormData): Promise<SantaOrder | Invalid> {
  const childName = cleanText(String(form.get("childName") ?? ""));
  const nameError = checkChildName(childName);
  if (nameError) return { error: nameError };
  const gifts = form.getAll("gifts").map((gift) => cleanText(String(gift)));
  const giftsError = checkGifts(gifts);
  if (giftsError) return { error: giftsError };
  const missing = await unsupportedCharacters(childName || null, gifts);
  if (missing.length > 0) return { error: `Caractère non pris en charge : ${missing.join(" ")}` };

  const photos = form.getAll("photos");
  if (photos.length === 0) return { error: "Ajoute une photo du visage de ton enfant." };
  if (photos.length > SANTA_RULES.maxChildren) return { error: "Une seule photo." };
  const [photo] = photos;
  if (!(photo instanceof File)) return { error: "Photo invalide." };
  if (!(UPLOAD_RULES.acceptedTypes as readonly string[]).includes(photo.type)) return { error: "Format d'image refusé." };
  if (photo.size > UPLOAD_RULES.maxSizeBytes) return { error: "Image trop lourde." };
  // La photo est celle d'un enfant : réservé à son parent ou représentant légal.
  if (form.get("consent") !== "true") return { error: "Le consentement est obligatoire." };
  return { childName: childName || null, gifts, photo };
}

// Vidéo du Père Noël : aucune IA ici, la photo et la liste sont collées sur
// la vidéo de référence (src/lib/santa-video.ts). Le prix en tokens est
// retiré avant l'assemblage et rendu s'il échoue. La photo n'est gardée que
// le temps de l'assemblage ; la vidéo, PRODUCT.retentionDays jours.
export async function POST(request: Request) {
  const user = await currentUser();
  if (!user?.email) {
    return Response.json({ error: "Connecte-toi pour créer la vidéo." }, { status: 401 });
  }
  const form = await request.formData().catch(() => null);
  if (!form) return Response.json({ error: "Requête invalide." }, { status: 400 });
  const order = await readOrder(form);
  if ("error" in order) return Response.json(order, { status: 400 });

  let generationId: string;
  try {
    generationId = await reserveGeneration(user.id, SANTA_EFFECT.id, SANTA_EFFECT.tokens);
  } catch (err) {
    if (err instanceof AccountBlockedError) {
      return Response.json({ error: accountSuspendedMessage() }, { status: 403 });
    }
    if (err instanceof InsufficientTokensError) {
      return Response.json({ error: "Plus assez de tokens." }, { status: 402 });
    }
    console.error(err);
    return Response.json({ error: "Impossible de créer la vidéo." }, { status: 502 });
  }

  let url: string;
  try {
    const video = await renderSantaVideo(SANTA_TEMPLATE, {
      photo: Buffer.from(await order.photo.arrayBuffer()),
      childName: order.childName,
      gifts: order.gifts,
    });
    url = await storeVideo(`${SANTA_EFFECT.slug}/${generationId}.mp4`, video);
  } catch (err) {
    console.error(err);
    await settleGeneration({ id: generationId }, "failed").catch(console.error);
    return Response.json(
      { error: "La vidéo n'a pas pu être créée. Tes tokens t'ont été rendus : réessaie dans un instant." },
      { status: 502 },
    );
  }

  // La vidéo est prête : un incident d'enregistrement ou d'email ne doit pas
  // l'annuler (elle s'affiche sur la page de toute façon).
  await settleGeneration({ id: generationId }, "done").catch(console.error);
  const emailNotification = await sendSantaVideoEmail(user.email, url, generationId).then(
    () => true,
    (err) => {
      console.error(err);
      return false;
    },
  );
  return Response.json({ url, emailNotification });
}
