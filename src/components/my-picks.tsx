"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, Clock, XCircle } from "@phosphor-icons/react";
import { usePlayer } from "@/components/player-provider";
import { Card } from "@/components/ui/card";
import type { Pick, Prediction } from "@/lib/domain";
import { matchDate } from "@/lib/utils";

export function MyPicks() {
  const { player } = usePlayer();
  const [picks, setPicks] = useState<Pick[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!player) return;
    fetch(`/api/picks?playerId=${player.id}`, { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error("Could not load your picks");
        return r.json();
      })
      .then(setPicks)
      .catch((e: Error) => setError(e.message));
  }, [player]);

  if (error)
    return (
      <p className="rounded-2xl border border-danger/30 bg-danger/10 p-5 text-danger">
        {error}
      </p>
    );
  if (!picks)
    return <div className="h-56 animate-pulse rounded-[1.75rem] bg-white/[.04]" />;
  if (!picks.length)
    return (
      <div className="rounded-[1.75rem] border border-dashed border-line py-16 text-center">
        <p className="text-lg font-medium">No picks yet</p>
        <Link href="/upcoming" className="mt-3 inline-block text-sm text-accent">
          View upcoming matches
        </Link>
      </div>
    );

  return (
    <div className="space-y-3">
      {picks
        .sort(
          (a, b) =>
            new Date(a.match!.kickoff).getTime() -
            new Date(b.match!.kickoff).getTime()
        )
        .map((pick) => (
          <Link href={`/matches/${pick.match_id}`} key={pick.id}>
            <Card className="mb-3 flex items-center justify-between gap-4 p-5 transition hover:bg-surface-raised">
              <div>
                <p className="text-xs text-muted">
                  {matchDate(pick.match!.kickoff)}
                </p>
                <h2 className="mt-1 font-medium">
                  {pick.match!.home_team}{" "}
                  <span className="text-muted">vs</span>{" "}
                  {pick.match!.away_team}
                </h2>
                <p className="mt-1 text-sm">
                  <span className="text-muted">Your pick </span>
                  {predictionLabel(
                    pick.prediction,
                    pick.match!.home_team,
                    pick.match!.away_team
                  )}
                  {pick.home_score !== undefined && (
                    <span className="ml-2 font-mono text-xs text-accent">
                      {pick.home_score}–{pick.away_score}
                    </span>
                  )}
                </p>
                {pick.points === 4 && (
                  <p className="mt-1 text-xs text-accent">
                    ⭐ Exact score bonus!
                  </p>
                )}
              </div>
              <ResultIcon points={pick.points} />
            </Card>
          </Link>
        ))}
    </div>
  );
}

function ResultIcon({ points }: { points: number | null }) {
  if (points === 4) return <CheckCircle size={25} weight="fill" className="text-accent" />;
  if (points === 3) return <CheckCircle size={25} weight="fill" className="text-accent" />;
  if (points === 0) return <XCircle size={25} className="text-danger" />;
  return <Clock size={24} className="text-muted" />;
}

function predictionLabel(p: Prediction, home: string, away: string) {
  return p === "HOME" ? home : p === "AWAY" ? away : "Draw";
}
