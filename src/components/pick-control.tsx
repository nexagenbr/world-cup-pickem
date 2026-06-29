"use client";

import { useState, useEffect } from "react";
import { Check } from "@phosphor-icons/react";
import { usePlayer } from "@/components/player-provider";
import { allowedPredictions, type Match, type Prediction, type Pick } from "@/lib/domain";
import { cn } from "@/lib/utils";

interface PickControlProps {
  match: Match;
  selected?: Prediction;
  pickedScore?: { home: number; away: number };
  onPick: (prediction: Prediction, homeScore?: number, awayScore?: number) => void;
}

export function PickControl({ match, selected, pickedScore, onPick }: PickControlProps) {
  const { player } = usePlayer();
  const [pending, setPending] = useState<Prediction | null>(null);
  const [error, setError] = useState("");
  const [homeScore, setHomeScore] = useState(pickedScore?.home ?? 0);
  const [awayScore, setAwayScore] = useState(pickedScore?.away ?? 0);

  const locked = Date.now() >= new Date(match.kickoff).getTime();
  const isGroup = !match.is_knockout;

  // Sync external score changes
  useEffect(() => {
    if (pickedScore) {
      setHomeScore(pickedScore.home);
      setAwayScore(pickedScore.away);
    }
  }, [pickedScore]);

  const labels: Record<Prediction, string> = {
    HOME: match.home_team,
    DRAW: "Draw",
    AWAY: match.away_team,
  };

  async function submit(prediction: Prediction) {
    if (!player || locked || pending) return;
    setPending(prediction);
    setError("");
    const body: Record<string, unknown> = {
      playerId: player.id,
      matchId: match.id,
      prediction,
    };
    // Group stage: include score
    if (isGroup) {
      body.homeScore = homeScore;
      body.awayScore = awayScore;
    }
    const response = await fetch("/api/picks", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (response.ok) {
      onPick(prediction, isGroup ? homeScore : undefined, isGroup ? awayScore : undefined);
    } else {
      const body = await response.json().catch(() => null);
      setError(body?.error ?? "Pick could not be saved");
    }
    setPending(null);
  }

  // Score input component
  const ScoreInputs = () => (
    <div className="mt-2 flex items-center justify-center gap-1.5">
      <input
        type="number"
        min={0}
        max={20}
        value={homeScore}
        onChange={(e) => setHomeScore(Math.max(0, Math.min(20, parseInt(e.target.value) || 0)))}
        disabled={locked || !!pending}
        className="w-12 rounded-lg border border-line bg-white/[.04] px-2 py-1.5 text-center font-mono text-sm text-foreground focus:border-accent/50 focus:outline-none disabled:opacity-50"
        placeholder="0"
      />
      <span className="text-muted">–</span>
      <input
        type="number"
        min={0}
        max={20}
        value={awayScore}
        onChange={(e) => setAwayScore(Math.max(0, Math.min(20, parseInt(e.target.value) || 0)))}
        disabled={locked || !!pending}
        className="w-12 rounded-lg border border-line bg-white/[.04] px-2 py-1.5 text-center font-mono text-sm text-foreground focus:border-accent/50 focus:outline-none disabled:opacity-50"
        placeholder="0"
      />
      <span className="ml-1 text-[10px] uppercase tracking-wider text-muted">Score</span>
    </div>
  );

  return (
    <div>
      {/* Score inputs for group stage */}
      {isGroup && <ScoreInputs />}

      {/* Prediction buttons */}
      <div className={cn("grid gap-2", isGroup ? "grid-cols-3" : "grid-cols-2")}>
        {allowedPredictions(match.is_knockout).map((prediction) => {
          const active = selected === prediction;
          return (
            <button
              key={prediction}
              disabled={locked || !!pending}
              onClick={() => submit(prediction)}
              className={cn(
                "flex min-h-11 min-w-0 items-center justify-center gap-1.5 rounded-xl border px-2 text-xs font-semibold transition duration-200 active:scale-[.98]",
                active
                  ? "border-accent/50 bg-accent text-[#17150f]"
                  : "border-line bg-white/[.025] text-muted hover:bg-white/[.06] hover:text-foreground",
                locked && !active && "opacity-45"
              )}
            >
              <span className="truncate">
                {pending === prediction ? "Saving" : labels[prediction]}
              </span>
              {active && <Check size={13} weight="bold" />}
            </button>
          );
        })}
      </div>

      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
      {locked && (
        <p className="mt-2 text-center text-[10px] uppercase tracking-[.14em] text-muted">
          Locked at kickoff
        </p>
      )}
    </div>
  );
}
