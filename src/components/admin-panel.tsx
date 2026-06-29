"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const actions = [
  ["sync-fixtures", "Sync fixtures", "Refresh the full tournament schedule."],
  ["sync-results", "Sync results", "Check active games and calculate points."],
  ["recalculate", "Recalculate leaderboard", "Grade all completed matches again."],
  ["seed-players", "Seed players", "Restore the four initial players."],
] as const;

export function AdminPanel() {
  const [secret, setSecret] = useState(""); const [pending, setPending] = useState(""); const [message, setMessage] = useState("");
  async function run(action: string) { if (!secret) return setMessage("Enter the admin secret first."); if (action === "reset" && !confirm("Delete all tournament matches and picks?")) return; setPending(action); setMessage(""); const response = await fetch(`/api/admin/${action}`, { method: "POST", headers: { authorization: `Bearer ${secret}` } }); const body = await response.json().catch(() => ({})); setMessage(response.ok ? `${action.replaceAll("-", " ")} completed.` : body.error ?? "Action failed"); setPending(""); }
  return <div className="mt-10 space-y-4"><label className="block"><span className="mb-2 block text-xs font-semibold uppercase tracking-[.13em] text-muted">Admin secret</span><input value={secret} onChange={(event) => setSecret(event.target.value)} type="password" autoComplete="current-password" className="h-12 w-full rounded-xl border border-line bg-surface px-4 text-sm" /></label><Card className="divide-y divide-line">{actions.map(([id, title, description]) => <div key={id} className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center"><div><h2 className="font-medium">{title}</h2><p className="mt-1 text-sm text-muted">{description}</p></div><Button variant="secondary" size="sm" disabled={!!pending} onClick={() => run(id)}>{pending === id ? "Working" : "Run"}</Button></div>)}</Card><Button variant="danger" onClick={() => run("reset")} disabled={!!pending}>Reset tournament</Button>{message && <p role="status" className="rounded-xl border border-line bg-white/[.03] p-4 text-sm text-muted">{message}</p>}</div>;
}
