import { AppShell } from "@/components/app-shell";
import { Leaderboard } from "@/components/leaderboard";
import { getLeaderboard } from "@/lib/data";

export const dynamic = "force-dynamic";
export default async function LeaderboardPage() { const rows = await getLeaderboard(); return <AppShell eyebrow="Live ranking" title="Leaderboard"><Leaderboard rows={rows} /></AppShell>; }
