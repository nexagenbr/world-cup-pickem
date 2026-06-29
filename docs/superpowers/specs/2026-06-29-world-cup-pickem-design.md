# World Cup Pick'em Design

## Product

A private, mobile-first FIFA World Cup prediction game for four friends. A player chooses their name once, predicts each match, and follows the shared leaderboard. The MVP deliberately has no account system; the selected player ID is stored locally. Picks become immutable at kickoff and other players' choices remain private until kickoff.

## Architecture

Next.js 15 App Router renders read-heavy screens on the server. Small client leaves handle local identity and pick interactions. Route handlers are the only browser-to-database boundary and use a server-only Supabase secret key.

PostgreSQL owns the invariants: one pick per player per match, valid prediction values, and an atomic pick function that rejects writes at or after kickoff. The leaderboard is a security-invoker SQL view computed from players and picks. API-Football is isolated behind a normalizing adapter.

## Data and scoring

- `players`: seeded participants.
- `matches`: API identity, competition, stage, teams, kickoff, status, scores, penalty scores, winner, and advancing team.
- `picks`: player, match, prediction, awarded points, timestamps, and lock state.
- `leaderboard`: computed points, correct/incorrect/pending counts, accuracy, current streak, and longest streak.
- `sync_logs`: auditable synchronization runs.

Group matches permit home, draw, or away. Knockout matches permit home or away and mean “who advances.” Correct picks earn three points. Result grading is idempotent.

## UI

The visual system uses off-black charcoal, warm ivory type, and one muted-gold accent. Geist provides the typography. Cards use large radii, hairline inner borders, and restrained glass treatment. Motion is limited to transform/opacity transitions and a live-status pulse with reduced-motion support. Signed-in screens share a compact header and iPhone-safe bottom navigation.

## Security and operations

- Public database roles have no direct table access; RLS is enabled everywhere.
- Supabase and football API secrets remain server-only.
- Cron handlers require Vercel's bearer `CRON_SECRET`.
- Admin actions require `ADMIN_SECRET`; a hidden URL is not treated as protection.
- Database time is authoritative for kickoff locking.
- Failed syncs are written to `sync_logs` and return non-success responses.

## MVP boundary

Authentication, groups, notifications, exact scores, multi-competition UI, and history are intentionally deferred. Competition fields, the provider adapter, and the route/data boundaries leave room for those features without replacing the core model.
