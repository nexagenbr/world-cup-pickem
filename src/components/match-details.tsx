"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { PickControl } from "@/components/pick-control";
import { usePlayer } from "@/components/player-provider";
import type { Match, Pick, Prediction } from "@/lib/domain";
import { isLive } from "@/lib/domain";
import { matchDate, matchTime } from "@/lib/utils";

type PublicPick = {
  prediction: string;
  home_score?: number;
  away_score?: number;
  player: { name: string } | { name: string }[] | null;
};

export function MatchDetails({
  match,
  publicPicks,
}: {
  match: Match;
  publicPicks: PublicPick[];
}) {
  const { player } = usePlayer();
  const [selected, setSelected] = useState<Prediction>();
  const [pickedScore, setPickedScore] = useState<{ home: number; away: number }>();

  useEffect(() => {
    if (!player) return;
    fetch(`/api/picks?playerId=${player.id}&matchId=${match.id}`, {
      cache: "no-store",
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((picks: Pick[]) => {
        if (picks[0]) {
          setSelected(picks[0].prediction);
          if (picks[0].home_score !== undefined) {
            setPickedScore({
              home: picks[0].home_score!,
              away: picks[0].away_score!,
            });
          }
        }
      })
      .catch(() => undefined);
  }, [match.id, player]);

  const started = Date.now() >= new Date(match.kickoff).getTime();

  function handlePick(prediction: Prediction, homeScore?: number, awayScore?: number) {
    setSelected(prediction);
    if (homeScore !== undefined && awayScore !== undefined) {
      setPickedScore({ home: homeScore, away: awayScore });
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
      {/* Main card */}
      <Card className="p-6 md:p-9">
        <div className="flex items-center justify-between text-xs uppercase tracking-[.14em] text-muted">
          <span>
            {matchDate(match.kickoff)} · {matchTime(match.kickoff)}
          </span>
          <span className={isLive(match.status) ? "text-danger" : ""}>
            {isLive(match.status) ? "Live" : match.status_detail ?? match.status}
          </span>
        </div>

        {/* Score display */}
        <div className="my-10 grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-center">
          <Team name={match.home_team} code={match.home_team_code} />
          <div className="font-mono text-3xl tracking-tight">
            {match.home_score ?? "–"}
            <span className="mx-2 text-muted">:</span>
            {match.away_score ?? "–"}
            {match.home_penalty_score !== null && (
              <p className="mt-2 text-xs text-muted">
                Pens {match.home_penalty_score}–{match.away_penalty_score}
              </p>
            )}
          </div>
          <Team name={match.away_team} code={match.away_team_code} />
        </div>

        {/* Pick control */}
        {!started && (
          <>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[.14em] text-muted">
              {match.is_knockout ? "Who advances?" : "Your prediction"}
            </p>
            <PickControl
              match={match}
              selected={selected}
              pickedScore={pickedScore}
              onPick={handlePick}
            />
          </>
        )}

        {/* Match info */}
        <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 border-t border-line pt-5 text-sm text-muted">
          <span>{match.stage}</span>
          {match.venue && <span>{match.venue}</span>}
        </div>
      </Card>

      {/* Everyone's picks */}
      <Card className="p-6">
        <h2 className="text-lg font-medium">Everyone&apos;s picks</h2>
        {!started ? (
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Predictions stay private until kickoff.
          </p>
        ) : publicPicks.length ? (
          <div className="mt-5 divide-y divide-line">
            {publicPicks.map((pick, index) => {
              const value = Array.isArray(pick.player)
                ? pick.player[0]?.name
                : pick.player?.name;
              return (
                <div key={`${value}-${index}`} className="flex justify-between py-4 text-sm">
                  <span>{value}</span>
                  <div className="text-right">
                    <strong>
                      {label(pick.prediction as Prediction, match)}
                    </strong>
                    {pick.home_score !== undefined && (
                      <span className="ml-2 font-mono text-xs text-accent">
                        {pick.home_score}–{pick.away_score}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted">No picks were submitted.</p>
        )}
      </Card>
    </div>
  );
}

function Team({ name, code }: { name: string; code: string | null }) {
  return (
    <div>
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-white/[.06] font-mono text-xs text-muted">
        {code ?? name.slice(0, 3).toUpperCase()}
      </span>
      <h2 className="mt-3 text-lg font-medium tracking-tight">{name}</h2>
    </div>
  );
}

function label(prediction: Prediction, match: Match) {
  return prediction === "HOME"
    ? match.home_team
    : prediction === "AWAY"
      ? match.away_team
      : "Draw";
}
