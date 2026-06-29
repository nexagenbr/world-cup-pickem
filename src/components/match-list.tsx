"use client";

import { useEffect, useMemo, useState } from "react";
import { usePlayer } from "@/components/player-provider";
import { MatchCard } from "@/components/match-card";
import type { Match, Pick, Prediction } from "@/lib/domain";
import { matchDate } from "@/lib/utils";

type PickWithScore = Pick & { home_score?: number; away_score?: number };

export function MatchList({
  matches,
  groupByDate = false,
  todayOnly = false,
}: {
  matches: Match[];
  groupByDate?: boolean;
  todayOnly?: boolean;
}) {
  const { player } = usePlayer();
  const [picks, setPicks] = useState<
    Record<string, { prediction: Prediction; score?: { home: number; away: number } }>
  >({});

  useEffect(() => {
    if (!player) return;
    fetch(`/api/picks?playerId=${player.id}`, { cache: "no-store" })
      .then((response) =>
        response.ok ? response.json() : Promise.reject(new Error("Could not load picks"))
      )
      .then((items: PickWithScore[]) =>
        setPicks(
          Object.fromEntries(
            items.map((pick) => [
              pick.match_id,
              {
                prediction: pick.prediction,
                score:
                  pick.home_score !== undefined
                    ? { home: pick.home_score, away: pick.away_score ?? 0 }
                    : undefined,
              },
            ])
          )
        )
      )
      .catch(() => undefined);
  }, [player]);

  const visibleMatches = useMemo(
    () =>
      todayOnly
        ? matches.filter(
            (match) =>
              new Date(match.kickoff).toDateString() === new Date().toDateString()
          )
        : matches,
    [matches, todayOnly]
  );

  const groups = useMemo(() => {
    if (!groupByDate) return [["", visibleMatches]] as [string, Match[]][];
    return Object.entries(
      Object.groupBy(visibleMatches, (match) => matchDate(match.kickoff))
    ) as [string, Match[]][];
  }, [groupByDate, visibleMatches]);

  if (!visibleMatches.length) return <EmptyMatches />;

  return (
    <div className="space-y-10">
      {groups.map(([date, items]) => (
        <section key={date || "matches"}>
          {date && (
            <h2 className="mb-4 text-sm font-medium text-muted">{date}</h2>
          )}
          <div className="space-y-3">
            {items.map((match, index) => {
              const pick = picks[match.id];
              return (
                <MatchCard
                  key={match.id}
                  match={match}
                  pick={pick?.prediction}
                  pickScore={pick?.score}
                  onPick={(prediction, homeScore, awayScore) =>
                    setPicks((current) => ({
                      ...current,
                      [match.id]: {
                        prediction,
                        score:
                          homeScore !== undefined
                            ? { home: homeScore, away: awayScore ?? 0 }
                            : undefined,
                      },
                    }))
                  }
                  index={index}
                />
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

export function EmptyMatches() {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-line px-6 py-16 text-center">
      <p className="text-lg font-medium">No matches here yet</p>
      <p className="mt-2 text-sm text-muted">
        Fixtures will appear after the next sync.
      </p>
    </div>
  );
}
