import { AppShell } from "@/components/app-shell";
import { MatchList } from "@/components/match-list";
import { getMatches } from "@/lib/data";

export const dynamic = "force-dynamic";
export default async function UpcomingPage() {
  const matches = (await getMatches()).filter((match) => new Date(match.kickoff).getTime() > Date.now());
  return <AppShell eyebrow={`${matches.length} fixtures`} title="Upcoming"><MatchList matches={matches} groupByDate /></AppShell>;
}
