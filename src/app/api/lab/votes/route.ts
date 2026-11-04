import type { Json } from "@/lib/database.types";
import { loadCampaignPairs } from "@/lib/presets/lab";
import { CAMPAIGN_ID, isPairScores } from "@/lib/presets/vote";
import { adminClient } from "@/lib/supabase";

// Note d'un votant sur une paire de vidéos. Pas de compte : le lien secret de la
// campagne suffit, et revoter sur la même paire remplace la note.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const { campaignId, raterId, pairIndex, scores } = (body ?? {}) as Record<string, unknown>;
  if (
    typeof campaignId !== "string" ||
    !CAMPAIGN_ID.test(campaignId) ||
    typeof raterId !== "string" ||
    !CAMPAIGN_ID.test(raterId) ||
    !Number.isInteger(pairIndex) ||
    !isPairScores(scores)
  ) {
    return Response.json({ error: "Note invalide." }, { status: 400 });
  }
  try {
    const pairs = await loadCampaignPairs(campaignId);
    if (!pairs || (pairIndex as number) < 0 || (pairIndex as number) >= pairs.length) {
      return Response.json({ error: "Ce vote est fermé." }, { status: 404 });
    }
    const { error } = await adminClient().from("preset_lab_votes").upsert({
      campaign_id: campaignId,
      rater_id: raterId,
      pair_index: pairIndex as number,
      scores: scores as unknown as Json,
    });
    if (error) throw error;
    return Response.json({ saved: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Note non enregistrée, réessaie." }, { status: 502 });
  }
}
