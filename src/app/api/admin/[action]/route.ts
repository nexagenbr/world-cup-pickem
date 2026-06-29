import { env } from "@/lib/env";
import { authorizeBearer, jsonError } from "@/lib/http";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncTournament } from "@/lib/sync";

const names = ["Gopal Baba", "Gopi", "Manvati", "Caru Krsna"];

export async function POST(request: Request, context: { params: Promise<{ action: string }> }) {
  if (!authorizeBearer(request.headers.get("authorization"), env.adminSecret())) return jsonError(new Error("Unauthorized"), 401);
  try {
    const { action } = await context.params;
    if (action === "sync-fixtures") return Response.json(await syncTournament("fixtures"));
    if (action === "sync-results") return Response.json(await syncTournament("results"));
    const supabase = createAdminClient();
    if (action === "recalculate") {
      const result = await supabase.rpc("grade_finished_matches");
      if (result.error) throw new Error(result.error.message);
      return Response.json({ graded: result.data });
    }
    if (action === "seed-players") {
      const result = await supabase.from("players").upsert(names.map((name) => ({ name })), { onConflict: "name" });
      if (result.error) throw new Error(result.error.message);
      return Response.json({ seeded: names.length });
    }
    if (action === "reset") {
      const picks = await supabase.from("picks").delete().not("id", "is", null);
      if (picks.error) throw new Error(picks.error.message);
      const matches = await supabase.from("matches").delete().not("id", "is", null);
      if (matches.error) throw new Error(matches.error.message);
      return Response.json({ reset: true });
    }
    return jsonError(new Error("Unknown admin action"), 404);
  } catch (error) { return jsonError(error); }
}
