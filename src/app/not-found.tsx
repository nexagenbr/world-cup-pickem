import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
export default function NotFound() { return <main className="grid min-h-[100dvh] place-items-center px-5 text-center"><div><p className="font-mono text-sm text-accent">404</p><h1 className="mt-3 text-4xl font-semibold tracking-tight">Match not found</h1><Link className={`${buttonVariants()} mt-7`} href="/today">Back to matches</Link></div></main>; }
