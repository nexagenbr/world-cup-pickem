"use client";

import { useState } from "react";
import { Check } from "@phosphor-icons/react";
import { usePlayer } from "@/components/player-provider";
import { allowedPredictions, type Match, type Prediction } from "@/lib/domain";
import { cn } from "@/lib/utils";

export function PickControl({ match, selected, onPick }: { match: Match; selected?: Prediction; onPick: (pick: Prediction) => void }) {
  const { player } = usePlayer(); const [pending, setPending] = useState<Prediction | null>(null); const [error, setError] = useState("");
  const locked = Date.now() >= new Date(match.kickoff).getTime();
  const labels: Record<Prediction, string> = { HOME: match.home_team, DRAW: "Draw", AWAY: match.away_team };

  async function submit(prediction: Prediction) {
    if (!player || locked || pending) return;
    setPending(prediction); setError("");
    const response = await fetch("/api/picks", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ playerId: player.id, matchId: match.id, prediction }) });
    if (response.ok) onPick(prediction); else { const body = await response.json().catch(() => null); setError(body?.error ?? "Pick could not be saved"); }
    setPending(null);
  }

  return <div><div className={cn("grid gap-2", match.is_knockout ? "grid-cols-2" : "grid-cols-3")}>{allowedPredictions(match.is_knockout).map((prediction) => { const active = selected === prediction; return <button key={prediction} disabled={locked || !!pending} onClick={() => submit(prediction)} className={cn("flex min-h-11 min-w-0 items-center justify-center gap-1.5 rounded-xl border px-2 text-xs font-semibold transition duration-200 active:scale-[.98]", active ? "border-accent/50 bg-accent text-[#17150f]" : "border-line bg-white/[.025] text-muted hover:bg-white/[.06] hover:text-foreground", locked && !active && "opacity-45")}><span className="truncate">{pending === prediction ? "Saving" : labels[prediction]}</span>{active && <Check size={13} weight="bold" />}</button>; })}</div>{error && <p className="mt-2 text-xs text-danger">{error}</p>}{locked && <p className="mt-2 text-center text-[10px] uppercase tracking-[.14em] text-muted">Locked at kickoff</p>}</div>;
}
