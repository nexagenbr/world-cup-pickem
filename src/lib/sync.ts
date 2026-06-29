import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { shouldPollResults } from "@/lib/sync-policy";
import { fetchWorldCupGames } from "@/lib/football/worldcup-api";

export async function syncTournament(type: "fixtures" | "results") {
  const supabase = createAdminClient();

  if (type === "results") {
    const scheduled = await supabase.from("matches").select("kickoff,status");
    if (scheduled.error) throw new Error(scheduled.error.message);
    if (!shouldPollResults(scheduled.data)) return { processed: 0, skipped: true };
  }

  const started = await supabase.from("sync_logs").insert({ sync_type: type, status: "started" }).select("id").single();
  if (started.error) throw new Error(started.error.message);

  try {
    // Fetch live data from WorldCup API
    const fixtures = await fetchWorldCupGames();

    if (fixtures.length === 0) {
      throw new Error("No fixtures received from API");
    }

    const { error } = await supabase.from("matches").upsert(fixtures, { onConflict: "api_match_id" });
    if (error) throw new Error(error.message);

    if (type === "results") {
      const graded = await supabase.rpc("grade_finished_matches");
      if (graded.error) throw new Error(graded.error.message);
    }

    await supabase.from("sync_logs").update({
      status: "success",
      fixtures_processed: fixtures.length,
      finished_at: new Date().toISOString()
    }).eq("id", started.data.id);

    return { processed: fixtures.length };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown sync error";
    await supabase.from("sync_logs").update({
      status: "failed",
      message,
      finished_at: new Date().toISOString()
    }).eq("id", started.data.id);
    throw error;
  }
}
