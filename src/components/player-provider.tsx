"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Player } from "@/lib/domain";

type PlayerState = { player: Player | null; ready: boolean; selectPlayer: (player: Player) => void; clearPlayer: () => void };
const PlayerContext = createContext<PlayerState | null>(null);
const key = "world-cup-pickem-player";

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [player, setPlayer] = useState<Player | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(key);
    if (saved) { try { setPlayer(JSON.parse(saved) as Player); } catch { localStorage.removeItem(key); } }
    setReady(true);
  }, []);

  const value = useMemo(() => ({
    player, ready,
    selectPlayer: (next: Player) => { localStorage.setItem(key, JSON.stringify(next)); setPlayer(next); },
    clearPlayer: () => { localStorage.removeItem(key); setPlayer(null); },
  }), [player, ready]);

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const value = useContext(PlayerContext);
  if (!value) throw new Error("usePlayer must be used inside PlayerProvider");
  return value;
}
