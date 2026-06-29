"use client";

import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react";
import { PickControl } from "@/components/pick-control";
import { Card } from "@/components/ui/card";
import type { Match, Prediction } from "@/lib/domain";
import { isLive } from "@/lib/domain";
import { matchTime } from "@/lib/utils";

export function MatchCard({ match, pick, onPick, index = 0 }: { match: Match; pick?: Prediction; onPick: (pick: Prediction) => void; index?: number }) {
  const live = isLive(match.status);
  return <Card className="reveal overflow-hidden" style={{ animationDelay: `${Math.min(index, 6) * 55}ms` }}>
    <Link href={`/matches/${match.id}`} className="group flex items-center justify-between gap-4 p-5 md:p-6">
      <div><div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.14em] text-muted">{live && <span className="pulse size-1.5 rounded-full bg-danger" />}{live ? `${match.elapsed ?? 0}' · Live` : match.status === "NS" || match.status === "TBD" ? matchTime(match.kickoff) : match.status_detail ?? match.status}</div><div className="space-y-2 text-lg font-medium tracking-tight"><Team name={match.home_team} code={match.home_team_code} score={match.home_score} /><Team name={match.away_team} code={match.away_team_code} score={match.away_score} /></div></div>
      <CaretRight size={18} className="text-muted transition group-hover:translate-x-1 group-hover:text-foreground" />
    </Link>
    <div className="border-t border-line p-3 md:p-4"><PickControl match={match} selected={pick} onPick={onPick} /></div>
  </Card>;
}

function Team({ name, code, score }: { name: string; code: string | null; score: number | null }) { return <div className="flex min-w-0 items-center gap-3"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-white/[.06] font-mono text-[9px] text-muted">{code?.slice(0, 3) ?? name.slice(0, 2).toUpperCase()}</span><span className="truncate">{name}</span>{score !== null && <span className="ml-auto font-mono text-xl">{score}</span>}</div>; }
