import type { LeaderboardRow } from "@/lib/domain";
import { Card } from "@/components/ui/card";

export function Leaderboard({ rows }: { rows: LeaderboardRow[] }) {
  if (!rows.length) return <p className="text-muted">Seed players to start the tournament.</p>;
  return <div className="grid gap-3 lg:grid-cols-[1.15fr_.85fr]">
    <Card className="overflow-hidden">{rows.map((row, index) => <div key={row.player_id} className="flex items-center gap-4 border-b border-line p-5 last:border-0 md:p-6"><span className={`grid size-10 shrink-0 place-items-center rounded-full font-mono text-sm ${index === 0 ? "bg-accent text-[#17150f]" : "bg-white/[.05] text-muted"}`}>{index + 1}</span><div className="min-w-0 flex-1"><h2 className="truncate text-lg font-medium">{row.name}</h2><p className="mt-1 text-xs text-muted">{row.correct_picks} correct · {row.incorrect_picks} incorrect</p></div><div className="text-right"><strong className="font-mono text-2xl font-medium">{row.points}</strong><p className="text-[10px] uppercase tracking-[.12em] text-muted">points</p></div></div>)}</Card>
    <div className="grid grid-cols-2 gap-3">{rows.map((row) => <Card key={row.player_id} className="p-5"><p className="truncate text-sm font-medium">{row.name}</p><div className="mt-5 grid grid-cols-2 gap-y-4"><Metric label="Accuracy" value={`${row.accuracy}%`} /><Metric label="Correct" value={row.correct_picks} /><Metric label="Current" value={row.current_streak} /><Metric label="Best" value={row.longest_streak} /></div></Card>)}</div>
  </div>;
}
function Metric({ label, value }: { label: string; value: string | number }) { return <div><strong className="font-mono text-lg font-medium">{value}</strong><p className="text-[10px] uppercase tracking-[.11em] text-muted">{label}</p></div>; }
