import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { LeaderboardRow, Match, Pick, Player } from "@/lib/domain";

function unwrap<T>(data: T | null, error: { message: string } | null): T {
  if (error) throw new Error(error.message);
  if (data === null) throw new Error("No data returned");
  return data;
}

export async function getPlayers() {
  const result = await createAdminClient().from("players").select("id,name").order("created_at");
  return unwrap(result.data, result.error) as Player[];
}

export async function getMatches() {
  const result = await createAdminClient().from("matches").select("*").order("kickoff");
  return unwrap(result.data, result.error) as Match[];
}

export async function getMatch(id: string) {
  const result = await createAdminClient().from("matches").select("*").eq("id", id).single();
  return unwrap(result.data, result.error) as Match;
}

export async function getPicks(playerId?: string, matchId?: string) {
  let query = createAdminClient().from("picks").select("*,match:matches(*)");
  if (playerId) query = query.eq("player_id", playerId);
  if (matchId) query = query.eq("match_id", matchId);
  const result = await query.order("created_at");
  return unwrap(result.data, result.error) as Pick[];
}

export async function getLeaderboard() {
  const result = await createAdminClient().from("leaderboard").select("*").order("points", { ascending: false }).order("correct_picks", { ascending: false });
  return unwrap(result.data, result.error) as LeaderboardRow[];
}
