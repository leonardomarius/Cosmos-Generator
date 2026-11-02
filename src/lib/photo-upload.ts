// Images choisies par le client, préparées dans le navigateur avant l'envoi.
import { UPLOAD_RULES } from "@/config/product";

// Vérifications côté navigateur (confort de l'utilisateur).
// Elles seront refaites côté serveur : on ne fait jamais confiance au navigateur.
export async function checkPhoto(file: File, minDimensionPx: number): Promise<string | null> {
  if (!(UPLOAD_RULES.acceptedTypes as readonly string[]).includes(file.type)) {
    return "Format refusé : utilise une image JPG, PNG ou WebP.";
  }
  if (file.size > UPLOAD_RULES.maxSizeBytes) {
    return "Image trop lourde : 10 Mo maximum.";
  }
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return "Impossible de lire cette image.";
  const tooSmall = Math.min(bitmap.width, bitmap.height) < minDimensionPx;
  bitmap.close();
  if (tooSmall) {
    return `Image trop petite : au moins ${minDimensionPx} px de côté.`;
  }
  return null;
}

// Réduit l'image (maxSidePx de côté au plus, JPEG) avant l'envoi, pour rester
// sous la limite de taille des requêtes des hébergeurs (4,5 Mo sur Vercel).
export async function shrinkPhoto(file: File, maxSidePx: number): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSidePx / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob"))), "image/jpeg", 0.9),
  );
}
