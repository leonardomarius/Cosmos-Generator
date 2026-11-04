import { after } from "next/server";
import { presetBySlug, presetModelId } from "@/config/presets";
import { accountSuspendedMessage, UPLOAD_RULES } from "@/config/product";
import { advancePresetJob, canOrderPreset, createPresetJob, presetReady, removePhotos, signedPhotoUrls, storePhotos } from "@/lib/presets/jobs";
import { PROVIDERS } from "@/lib/presets/provider";
import { judge } from "@/lib/presets/vision";
import { currentUser } from "@/lib/supabase";
import { AccountBlockedError, InsufficientTokensError, reserveGeneration, settleGeneration } from "@/lib/tokens";

// Vérification des photos, puis envoi de la première étape.
export const maxDuration = 60;

type Invalid = { error: string };

// Photos envoyées : mêmes règles que dans le navigateur, on ne lui fait jamais confiance.
function readPhotos(form: FormData, max: number): File[] | Invalid {
  const photos = form.getAll("photos");
  if (photos.length === 0) return { error: "Photo manquante." };
  if (photos.length > max) return { error: `${max} photos maximum.` };
  const files: File[] = [];
  for (const photo of photos) {
    if (!(photo instanceof File)) return { error: "Photo invalide." };
    if (!(UPLOAD_RULES.acceptedTypes as readonly string[]).includes(photo.type)) return { error: "Format d'image refusé." };
    if (photo.size > UPLOAD_RULES.maxSizeBytes) return { error: "Image trop lourde." };
    files.push(photo);
  }
  return files;
}

// Commande d'un preset. Dans l'ordre, avant toute dépense : compte, accès,
// consentement, photos vérifiées par le modèle de vision. Ensuite seulement les
// tokens sont retirés, et rendus si la commande échoue. Le résultat est envoyé à
// l'email du compte.
export async function POST(request: Request, ctx: RouteContext<"/api/presets/[slug]">) {
  const user = await currentUser();
  if (!user?.email) return Response.json({ error: "Connecte-toi pour créer la vidéo." }, { status: 401 });
  const preset = presetBySlug((await ctx.params).slug);
  if (!preset) return Response.json({ error: "Preset inconnu." }, { status: 404 });
  if (!(await canOrderPreset(preset, user.email))) {
    return Response.json({ error: "Cette vidéo n'est pas disponible pour le moment." }, { status: 403 });
  }
  if (!presetReady(preset)) {
    console.error(`Preset ${preset.id} : fichiers fixes non envoyés au fournisseur`);
    return Response.json({ error: "Cette vidéo n'est pas disponible pour le moment." }, { status: 503 });
  }

  const form = await request.formData().catch(() => null);
  if (!form) return Response.json({ error: "Requête invalide." }, { status: 400 });
  const photos = readPhotos(form, preset.source_requirements.photos.max);
  if ("error" in photos) return Response.json(photos, { status: 400 });
  if (form.get("consent") !== "true") return Response.json({ error: "Le consentement est obligatoire." }, { status: 400 });

  let photoPaths: string[] = [];
  try {
    photoPaths = await storePhotos(photos);
    const urls = await signedPhotoUrls(photoPaths);
    const verdicts = await Promise.all(urls.map((url) => judge(PROVIDERS.fal, preset, preset.qa.photo_gate, [url])));
    const refusal = verdicts.flatMap((verdict) => verdict.refusals)[0];
    if (refusal) {
      await removePhotos(photoPaths).catch(console.error);
      return Response.json({ error: refusal }, { status: 422 });
    }
  } catch (err) {
    console.error(err);
    await removePhotos(photoPaths).catch(console.error);
    return Response.json({ error: "Impossible de vérifier la photo pour le moment. Réessaie dans un instant." }, { status: 502 });
  }

  let generationId: string;
  try {
    generationId = await reserveGeneration(user.id, presetModelId(preset), preset.economics.tokens);
  } catch (err) {
    await removePhotos(photoPaths).catch(console.error);
    if (err instanceof AccountBlockedError) return Response.json({ error: accountSuspendedMessage() }, { status: 403 });
    if (err instanceof InsufficientTokensError) return Response.json({ error: "Plus assez de tokens." }, { status: 402 });
    console.error(err);
    return Response.json({ error: "Impossible de lancer la génération." }, { status: 502 });
  }

  try {
    await createPresetJob(generationId, user.id, preset, photoPaths);
  } catch (err) {
    console.error(err);
    await removePhotos(photoPaths).catch(console.error);
    await settleGeneration({ id: generationId }, "failed").catch(console.error);
    return Response.json({ error: "Impossible de lancer la génération." }, { status: 502 });
  }

  // Après la réponse : le client n'attend pas l'envoi chez le fournisseur, et le
  // suivi du navigateur prend le relais si cette exécution est coupée.
  after(() => advancePresetJob(generationId));
  return Response.json({ jobId: generationId, emailNotification: Boolean(process.env.RESEND_API_KEY) });
}
