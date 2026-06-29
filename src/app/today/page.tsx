import { AppShell } from "@/components/app-shell";
import { MatchList } from "@/components/match-list";
import { getMatches } from "@/lib/data";

export const dynamic = "force-dynamic";
export default async function TodayPage() {
  const today = new Date();
  const matches = await getMatches();
  return <AppShell eyebrow={today.toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" })} title="Today's matches"><MatchList matches={matches} todayOnly /></AppShell>;
}
