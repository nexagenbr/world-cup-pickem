"use client";

import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePlayer } from "@/components/player-provider";
import { Card } from "@/components/ui/card";
import type { Player } from "@/lib/domain";

export function PlayerSelection({ players }: { players: Player[] }) {
  const router = useRouter(); const { selectPlayer } = usePlayer();
  return <main className="mx-auto min-h-[100dvh] max-w-5xl px-5 py-8 md:px-8 md:py-12">
    <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-foreground"><ArrowLeft size={16} /> Back</Link>
    <div className="mt-20 md:mt-28"><p className="text-xs font-semibold uppercase tracking-[.2em] text-accent">Choose your profile</p><h1 className="mt-3 text-4xl font-semibold tracking-[-.05em] md:text-6xl">Who are you?</h1></div>
    <div className="mt-12 grid gap-3 md:grid-cols-2">{players.map((player, index) => <button key={player.id} onClick={() => { selectPlayer(player); router.push("/today"); }} className="reveal text-left" style={{ animationDelay: `${index * 70}ms` }}><Card className="group flex items-center justify-between p-6 transition duration-300 hover:-translate-y-1 hover:border-accent/30 hover:bg-surface-raised active:translate-y-0"><span className="text-xl font-medium tracking-tight">{player.name}</span><span className="grid size-10 place-items-center rounded-full border border-line text-muted transition group-hover:border-accent/30 group-hover:text-accent"><ArrowRight size={18} /></span></Card></button>)}</div>
  </main>;
}
