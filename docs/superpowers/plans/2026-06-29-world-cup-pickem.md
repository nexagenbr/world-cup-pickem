# World Cup Pick'em Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-quality private World Cup prediction app with automatic fixtures/results, locked picks, scoring, leaderboard statistics, and an admin surface.

**Architecture:** Next.js 15 App Router renders server-first pages while isolated client components manage local player identity and picks. Server route handlers use a secret Supabase client, PostgreSQL enforces locks and computes the leaderboard, and an API-Football adapter normalizes fixtures for cron synchronization.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS 4, customized shadcn/ui components, Supabase/PostgreSQL, Vitest, Vercel Cron, API-Football.

---

### Task 1: Foundation and domain rules

**Files:** project configuration, `src/lib/domain.ts`, `src/lib/scoring.ts`, `src/lib/*.test.ts`

- [ ] Scaffold Next.js 15, install dependencies, and configure Vitest.
- [ ] Write failing tests for allowed predictions, scoring, and streaks; run them and confirm expected failures.
- [ ] Implement the minimal domain functions and rerun the suite.

### Task 2: Football integration and database

**Files:** `src/lib/football/*`, `supabase/migrations/*`, `supabase/seed.sql`, `src/lib/supabase/*`, `src/lib/data.ts`, `src/lib/sync.ts`

- [ ] Write failing fixture-normalization tests covering scheduled, live, extra-time, and shootout states.
- [ ] Implement the native-fetch API-Football adapter and confirm tests pass.
- [ ] Add tables, constraints, RLS, atomic pick submission, grading, streak calculation, and the computed leaderboard view.
- [ ] Add typed server data and idempotent synchronization functions.

### Task 3: Routes

**Files:** `src/app/api/**/route.ts`, `src/lib/http.ts`, `src/lib/http.test.ts`

- [ ] Write failing authorization and payload-validation tests.
- [ ] Implement validation helpers and confirm tests pass.
- [ ] Add player, match, pick, leaderboard, cron, and admin route handlers.

### Task 4: Product UI

**Files:** `src/components/**`, `src/app/**/page.tsx`, loading and error boundaries

- [ ] Build customized shadcn primitives, local identity context, landing, player selection, and the responsive shell.
- [ ] Build today, upcoming, my picks, match details, leaderboard, and admin screens.
- [ ] Add loading, empty, error, locked, pending, and success states.

### Task 5: Operations and verification

**Files:** `.env.example`, `vercel.json`, `scripts/setup.mjs`, `README.md`

- [ ] Add secured hourly fixture and ten-minute result crons plus one-command setup.
- [ ] Document Supabase, API-Football, local, and Vercel setup without deploying.
- [ ] Run tests, ESLint, TypeScript, and a production build; require zero failures before completion.
