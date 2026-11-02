// Vidéos assemblées par le site (effets saisonniers), dans Supabase Storage.
// Le bucket est privé : une vidéo ne se lit que par un lien signé, valable
// le temps de la conservation promise (PRODUCT.retentionDays), puis elle est
// supprimée chaque jour par /api/cron/purge-videos.
import { PRODUCT } from "@/config/product";
import { adminClient } from "@/lib/supabase";

const BUCKET = "videos";
const RETENTION_SECONDS = PRODUCT.retentionDays * 24 * 60 * 60;

// Le bucket est créé au premier envoi : rien à configurer chez Supabase.
let bucketReady = false;
async function ensureBucket() {
  if (bucketReady) return;
  const storage = adminClient().storage;
  if ((await storage.getBucket(BUCKET)).error) {
    const created = await storage.createBucket(BUCKET, { public: false });
    if (created.error && !/already exists/i.test(created.error.message)) throw created.error;
  }
  bucketReady = true;
}

// Enregistre la vidéo et renvoie son lien de lecture (valable 7 jours).
export async function storeVideo(file: string, video: Buffer): Promise<string> {
  await ensureBucket();
  const bucket = adminClient().storage.from(BUCKET);
  const uploaded = await bucket.upload(file, video, { contentType: "video/mp4", upsert: true });
  if (uploaded.error) throw uploaded.error;
  const signed = await bucket.createSignedUrl(file, RETENTION_SECONDS);
  if (signed.error) throw signed.error;
  return signed.data.signedUrl;
}

// Supprime les vidéos plus anciennes que la durée de conservation, dans
// chaque dossier (un par effet). Renvoie le nombre de vidéos supprimées.
export async function purgeOldVideos(folders: readonly string[]): Promise<number> {
  await ensureBucket();
  const bucket = adminClient().storage.from(BUCKET);
  const cutoff = Date.now() - RETENTION_SECONDS * 1000;
  let removed = 0;
  for (const folder of folders) {
    // Les plus anciennes d'abord : on s'arrête à la première trop récente.
    // Limite de tours : jamais de boucle sans fin si une suppression échoue.
    for (let round = 0; round < 100; round++) {
      const listed = await bucket.list(folder, { limit: 100, sortBy: { column: "created_at", order: "asc" } });
      if (listed.error) throw listed.error;
      const old = listed.data.filter((f) => f.created_at && Date.parse(f.created_at) < cutoff);
      if (old.length === 0) break;
      const deleted = await bucket.remove(old.map((f) => `${folder}/${f.name}`));
      if (deleted.error) throw deleted.error;
      removed += old.length;
      if (old.length < listed.data.length) break;
    }
  }
  return removed;
}
