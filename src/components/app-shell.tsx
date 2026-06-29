"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { CalendarDots, ChartBar, House, ListChecks, Trophy } from "@phosphor-icons/react";
import { usePlayer } from "@/components/player-provider";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/today", label: "Today", icon: House },
  { href: "/upcoming", label: "Upcoming", icon: CalendarDots },
  { href: "/picks", label: "My Picks", icon: ListChecks },
  { href: "/leaderboard", label: "Standings", icon: Trophy },
];

export function AppShell({ children, eyebrow, title }: { children: React.ReactNode; eyebrow?: string; title: string }) {
  const path = usePathname();
  const router = useRouter();
  const { player, ready } = usePlayer();
  useEffect(() => { if (ready && !player) router.replace("/select-player"); }, [ready, player, router]);

  if (!ready || !player) return <PageSkeleton />;
  return (
    <div className="min-h-[100dvh] pb-28 md:pb-10">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6 md:px-8">
        <Link href="/today" className="flex items-center gap-3 text-sm font-semibold tracking-tight"><span className="grid size-9 place-items-center rounded-full border border-accent/30 text-accent"><ChartBar size={18} weight="bold" /></span>Pick&apos;em</Link>
        <Link href="/select-player" className="rounded-full border border-line px-4 py-2 text-xs text-muted transition hover:text-foreground">{player.name}</Link>
      </header>
      <main className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="mb-8 max-w-2xl reveal">
          {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-[.18em] text-accent">{eyebrow}</p>}
          <h1 className="text-4xl font-semibold tracking-[-.045em] md:text-5xl">{title}</h1>
        </div>
        {children}
      </main>
      <nav className="glass safe-bottom fixed inset-x-3 bottom-3 z-20 mx-auto flex max-w-md items-center justify-around rounded-[1.4rem] px-2 pt-2 md:static md:mt-10 md:max-w-2xl md:bg-transparent md:shadow-none md:backdrop-blur-none">
        {nav.map((item) => { const active = path.startsWith(item.href); const Icon = item.icon; return <Link key={item.href} href={item.href} className={cn("flex min-w-16 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-medium transition", active ? "text-accent" : "text-muted hover:text-foreground")}><Icon size={21} weight={active ? "fill" : "regular"} /><span>{item.label}</span></Link>; })}
      </nav>
    </div>
  );
}

export function PageSkeleton() { return <div className="mx-auto min-h-[100dvh] max-w-7xl animate-pulse px-5 py-8"><div className="h-10 w-28 rounded-full bg-white/[.05]" /><div className="mt-20 h-12 w-64 rounded-xl bg-white/[.06]" /><div className="mt-10 h-64 rounded-[1.75rem] bg-white/[.04]" /></div>; }
