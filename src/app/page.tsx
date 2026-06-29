import Link from "next/link";
import { ArrowRight, SoccerBall } from "@phosphor-icons/react/dist/ssr";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Home() {
  return <main className="relative grid min-h-[100dvh] overflow-hidden px-6 py-8 md:grid-cols-[1.2fr_.8fr] md:px-12 lg:px-20">
    <div className="relative z-10 flex max-w-2xl flex-col justify-between">
      <div className="flex items-center gap-3 text-sm font-semibold"><span className="grid size-10 place-items-center rounded-full border border-accent/35 text-accent"><SoccerBall size={20} weight="duotone" /></span>Private tournament</div>
      <div className="py-24 reveal md:py-12">
        <p className="mb-5 text-xs font-semibold uppercase tracking-[.22em] text-accent">FIFA World Cup 2026</p>
        <h1 className="max-w-xl text-5xl font-semibold leading-[.94] tracking-[-.065em] sm:text-6xl lg:text-7xl">World Cup<br />Pick&apos;em</h1>
        <p className="mt-7 max-w-md text-lg leading-relaxed text-muted">Predict every World Cup match.<br />May the best devotee win.</p>
        <Link href="/select-player" className={cn(buttonVariants({ size: "lg" }), "mt-10 w-fit")}>Enter <ArrowRight size={18} weight="bold" /></Link>
      </div>
      <p className="text-xs text-muted">104 matches · One champion</p>
    </div>
    <div aria-hidden="true" className="absolute -right-40 top-1/2 aspect-square w-[36rem] -translate-y-1/2 rounded-full border border-accent/20 md:relative md:right-auto md:top-auto md:m-auto md:w-full md:max-w-[34rem] md:translate-y-0"><div className="absolute inset-[10%] rounded-full border border-white/[.08]" /><div className="absolute left-1/2 top-0 h-full w-px bg-white/[.07]" /><div className="absolute left-1/2 top-1/2 size-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/20" /><div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_42%_38%,rgba(199,168,91,.14),transparent_45%)]" /></div>
  </main>;
}
