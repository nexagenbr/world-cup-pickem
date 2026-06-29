import { getMatch } from "@/lib/data";
import { jsonError } from "@/lib/http";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const match = await getMatch(id);
    let picks: unknown[] = [];
    if (Date.now() >= new Date(match.kickoff).getTime()) {
      const result = await createAdminClient().from("picks").select("prediction,points,player:players(name)").eq("match_id", id);
      if (result.error) throw new Error(result.error.message);
      picks = result.data;
    }
    return Response.json({ match, picks });
  } catch (error) { return jsonError(error, 404); }
}
