# World Cup Pick'em

A private, mobile-first FIFA World Cup 2026 prediction game built with Next.js 15, TypeScript, Tailwind CSS, shadcn/ui conventions, Supabase/PostgreSQL, API-Football, and Vercel Cron.

## Features

- Four seeded players with local device selection—no MVP login.
- Group-stage home/draw/away picks and knockout “who advances” picks.
- Database-enforced kickoff locks and private picks until kickoff.
- Automatic fixture, live-score, result, penalty, and winner synchronization.
- Idempotent three-point scoring and a computed leaderboard with accuracy and streaks.
- Responsive Today, Upcoming, My Picks, Match Details, Leaderboard, and protected Admin screens.

## Requirements

- Node.js 20+
- A Supabase project
- An [API-Football](https://www.api-football.com/) key with FIFA World Cup access
- Supabase CLI for migration management

## One-command local installation

```bash
npm run setup
```

This installs dependencies and creates `.env.local` from `.env.example` without overwriting an existing file. Fill in the five environment values before starting the app.

## Database setup

Create a Supabase project, then link this directory:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

For sample players and three rolling demo fixtures:

```bash
npx supabase db reset --linked
```

`db reset --linked` is destructive. Use it only on a new/development project. For production, run the migration and seed players from `/admin` instead of applying demo fixtures.

Supabase's current secret keys start with `sb_secret_`. Keep `SUPABASE_SECRET_KEY` server-only. The migration explicitly grants access only to `service_role`, enables RLS on every public table, and exposes browser data solely through Next.js route handlers.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SECRET_KEY` | Server-only Supabase secret key |
| `API_FOOTBALL_KEY` | API-Football server key |
| `CRON_SECRET` | Vercel cron bearer secret, 32+ random characters |
| `ADMIN_SECRET` | Separate `/admin` action secret |

Generate secrets with your password manager. Never use the same value for cron and admin access.

## Run locally

```bash
npm run dev
```

Open `http://localhost:3000`. Seed players first, then use `/admin` to run **Sync fixtures**. API-Football's World Cup identifiers are `league=1` and `season=2026`.

Cron endpoints require an `Authorization: Bearer <CRON_SECRET>` header. To exercise one locally:

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" http://localhost:3000/api/cron/fixtures
```

## Quality checks

```bash
npm test -- --run
npm run lint
npm run typecheck
npm run build
```

## Vercel

1. Import the repository into Vercel.
2. Add all five environment variables for Production and Preview.
3. Ensure the Supabase migration has been applied.
4. Review the app locally and obtain explicit approval before deploying.
5. Deploy on Vercel Hobby.
6. Open `supabase/cron.example.sql`, replace its app URL and cron secret, and run it in the Supabase SQL Editor. Supabase Cron then calls fixture sync hourly and result sync every ten minutes.

Vercel Hobby only permits daily native cron schedules, so recurring synchronization is deliberately scheduled by Supabase Cron. The result route checks the stored kickoff window before calling API-Football, preserving the free API quota when no match is active.

## Scoring and privacy

- Group stage: home win, draw, or away win; correct = 3 points.
- Group stage: exact score prediction; correct = **bonus +1 point** (total 4 pts).
- Knockout stage: select the team that advances; correct = 3 points.
- Picks can be changed until database time reaches kickoff.
- Other players' picks are returned only after kickoff.
- Finished statuses `FT`, `AET`, and `PEN` trigger grading.

## Future expansion

The match model already carries competition and season fields, and the football provider is isolated in `src/lib/football`. Authentication, groups, more competitions, exact scores, notifications, weekly rankings, and tournament history can be added without replacing the current pick/scoring boundary.
