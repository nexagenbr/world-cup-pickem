import { getPicks } from "@/lib/data";
import { jsonError, parsePickBody } from "@/lib/http";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    return Response.json(await getPicks(searchParams.get("playerId") ?? undefined, searchParams.get("matchId") ?? undefined));
  } catch (error) { return jsonError(error); }
}

export async function POST(request: Request) {
  try {
    const pick = parsePickBody(await request.json());
    const result = await createAdminClient().rpc("submit_pick", {
      p_player_id: pick.playerId,
      p_match_id: pick.matchId,
      p_prediction: pick.prediction,
    });
    if (result.error) throw new Error(result.error.message);
    return Response.json(result.data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid pick";
    return jsonError(error, /locked|invalid|knockout/i.test(message) ? 409 : 400);
  }
}
