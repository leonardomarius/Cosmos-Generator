// Benchmark à l'aveugle du Preset Lab, côté serveur : le navigateur des votants ne
// reçoit que des liens et les lettres a/b. Quelle vidéo vient de quel réglage reste
// ici, jusqu'au calcul des résultats (scripts/preset-lab.mjs score).
import { LAB_BUCKET, type VotePair } from "@/lib/presets/vote";
import { adminClient } from "@/lib/supabase";

// Le temps de voter, en une ou plusieurs fois.
const LAB_LINK_SECONDS = 6 * 3600;

type StoredPair = {
  photo: string;
  a: { path: string; role: "candidate" | "comparator" };
  b: { path: string; role: "candidate" | "comparator" };
};

// Campagne ouverte, avec des liens de lecture à jour, ou null.
export async function loadCampaignPairs(id: string): Promise<VotePair[] | null> {
  const db = adminClient();
  const { data, error } = await db.from("preset_lab_campaigns").select("pairs, closes_at").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data || Date.parse(data.closes_at) < Date.now()) return null;

  const pairs = data.pairs as unknown as StoredPair[];
  const paths = pairs.flatMap((pair) => [pair.photo, pair.a.path, pair.b.path]);
  const signed = await db.storage.from(LAB_BUCKET).createSignedUrls(paths, LAB_LINK_SECONDS);
  if (signed.error) throw signed.error;
  const urls = new Map(signed.data.map((item) => [item.path, item.signedUrl]));
  return pairs.map((pair) => ({
    photo: urls.get(pair.photo) ?? "",
    a: urls.get(pair.a.path) ?? "",
    b: urls.get(pair.b.path) ?? "",
  }));
}
