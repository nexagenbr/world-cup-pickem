import { AppShell } from "@/components/app-shell";
import { MatchDetails } from "@/components/match-details";
import { getMatch } from "@/lib/data";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const match = await getMatch(id); let picks: { prediction: string; player: { name: string } | { name: string }[] | null }[] = [];
  if (Date.now() >= new Date(match.kickoff).getTime()) {
    const result = await createAdminClient().from("picks").select("prediction,player:players(name)").eq("match_id", id);
    if (result.error) throw new Error(result.error.message); picks = result.data;
  }
  return <AppShell eyebrow={match.stage} title="Match details"><MatchDetails match={match} publicPicks={picks} /></AppShell>;
}
