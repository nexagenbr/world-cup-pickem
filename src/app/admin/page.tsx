import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { AdminPanel } from "@/components/admin-panel";

export default function AdminPage() { return <main className="mx-auto min-h-[100dvh] max-w-3xl px-5 py-10"><Link href="/" className="inline-flex items-center gap-2 text-sm text-muted"><ArrowLeft size={16} /> Home</Link><p className="mt-20 text-xs font-semibold uppercase tracking-[.2em] text-accent">Restricted</p><h1 className="mt-3 text-4xl font-semibold tracking-[-.05em]">Tournament control</h1><p className="mt-3 text-muted">Operational actions are authenticated and logged.</p><AdminPanel /></main>; }
