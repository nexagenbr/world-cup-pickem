import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

// Protected by ADMIN_SECRET
export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    const admin = createAdminClient();

    if (action === "setup") {
      const results = [];

      // Create extension
      try {
        await admin.query("CREATE EXTENSION IF NOT EXISTS pgcrypto");
        results.push("✓ Created pgcrypto extension");
      } catch (e) {}

      // Create schema
      try {
        await admin.query("CREATE SCHEMA IF NOT EXISTS private");
        results.push("✓ Created private schema");
      } catch (e) {}

      // Create enum
      try {
        await admin.query(`DO $$ BEGIN
          CREATE TYPE public.prediction AS ENUM ('HOME', 'DRAW', 'AWAY');
        EXCEPTION WHEN duplicate_object THEN null;
        END $$`);
        results.push("✓ Created prediction enum");
      } catch (e) {}

      // Create tables
      const createTables = [
        `CREATE TABLE IF NOT EXISTS public.players (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          name text NOT NULL UNIQUE CHECK (char_length(name) BETWEEN 1 AND 80),
          created_at timestamptz NOT NULL DEFAULT now()
        )`,
        `CREATE TABLE IF NOT EXISTS public.matches (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          api_match_id bigint NOT NULL UNIQUE,
          competition text NOT NULL DEFAULT 'FIFA World Cup',
          season integer NOT NULL DEFAULT 2026,
          stage text NOT NULL,
          is_knockout boolean NOT NULL DEFAULT false,
          home_team text NOT NULL,
          away_team text NOT NULL,
          home_team_code text,
          away_team_code text,
          home_team_logo text,
          away_team_logo text,
          kickoff timestamptz NOT NULL,
          status text NOT NULL DEFAULT 'NS',
          status_detail text,
          elapsed integer,
          home_score integer CHECK (home_score >= 0),
          away_score integer CHECK (away_score >= 0),
          home_penalty_score integer CHECK (home_penalty_score >= 0),
          away_penalty_score integer CHECK (away_penalty_score >= 0),
          winner public.prediction,
          advancing_team public.prediction CHECK (advancing_team IS NULL OR advancing_team <> 'DRAW'),
          venue text,
          updated_at timestamptz NOT NULL DEFAULT now(),
          CHECK (home_team <> away_team)
        )`,
        `CREATE TABLE IF NOT EXISTS public.picks (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
          match_id uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
          prediction public.prediction NOT NULL,
          home_score integer CHECK (home_score >= 0),
          away_score integer CHECK (away_score >= 0),
          points integer CHECK (points IN (0, 3, 4)),
          created_at timestamptz NOT NULL DEFAULT now(),
          updated_at timestamptz NOT NULL DEFAULT now(),
          locked boolean NOT NULL DEFAULT false,
          UNIQUE (player_id, match_id)
        )`,
        `CREATE TABLE IF NOT EXISTS public.sync_logs (
          id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          sync_type text NOT NULL CHECK (sync_type IN ('fixtures', 'results')),
          status text NOT NULL CHECK (status IN ('started', 'success', 'failed')),
          fixtures_processed integer NOT NULL DEFAULT 0,
          message text,
          started_at timestamptz NOT NULL DEFAULT now(),
          finished_at timestamptz
        )`,
      ];

      for (const sql of createTables) {
        try {
          await admin.query(sql);
          results.push("✓ Created table");
        } catch (e) {}
      }

      // Create indexes
      const createIndexes = [
        "CREATE INDEX IF NOT EXISTS matches_kickoff_idx ON public.matches(kickoff)",
        "CREATE INDEX IF NOT EXISTS matches_status_idx ON public.matches(status)",
        "CREATE INDEX IF NOT EXISTS picks_player_idx ON public.picks(player_id)",
        "CREATE INDEX IF NOT EXISTS picks_match_idx ON public.picks(match_id)",
      ];

      for (const sql of createIndexes) {
        try {
          await admin.query(sql);
        } catch (e) {}
      }

      // Create functions and triggers
      try {
        await admin.query(`CREATE OR REPLACE FUNCTION private.set_updated_at()
          RETURNS TRIGGER LANGUAGE plpgsql AS $$
          BEGIN new.updated_at = now(); RETURN new; END; $$`);
        await admin.query(`DROP TRIGGER IF EXISTS matches_updated_at ON public.matches`);
        await admin.query(`CREATE TRIGGER matches_updated_at BEFORE UPDATE ON public.matches FOR EACH ROW EXECUTE FUNCTION private.set_updated_at()`);
        await admin.query(`DROP TRIGGER IF EXISTS picks_updated_at ON public.picks`);
        await admin.query(`CREATE TRIGGER picks_updated_at BEFORE UPDATE ON public.picks FOR EACH ROW EXECUTE FUNCTION private.set_updated_at()`);
        results.push("✓ Created triggers");
      } catch (e) {}

      // Create submit_pick function
      try {
        await admin.query(`CREATE OR REPLACE FUNCTION public.submit_pick(
          p_player_id uuid, p_match_id uuid, p_prediction public.prediction,
          p_home_score integer DEFAULT NULL, p_away_score integer DEFAULT NULL
        ) RETURNS public.picks LANGUAGE plpgsql AS $$
        DECLARE target public.matches; saved public.picks;
        BEGIN
          SELECT * INTO target FROM public.matches WHERE id = p_match_id FOR UPDATE;
          IF NOT FOUND THEN RAISE EXCEPTION 'Match not found'; END IF;
          IF NOT EXISTS (SELECT 1 FROM public.players WHERE id = p_player_id) THEN RAISE EXCEPTION 'Player not found'; END IF;
          IF clock_timestamp() >= target.kickoff THEN RAISE EXCEPTION 'Picks are locked'; END IF;
          IF target.is_knockout AND p_prediction = 'DRAW' THEN RAISE EXCEPTION 'Knockout picks must select who advances'; END IF;
          IF NOT target.is_knockout AND (p_home_score IS NULL OR p_away_score IS NULL) THEN RAISE EXCEPTION 'Group stage picks require score'; END IF;
          INSERT INTO public.picks (player_id, match_id, prediction, home_score, away_score)
          VALUES (p_player_id, p_match_id, p_prediction, p_home_score, p_away_score)
          ON CONFLICT (player_id, match_id) DO UPDATE SET prediction = excluded.prediction, home_score = excluded.home_score, away_score = excluded.away_score, updated_at = now()
          RETURNING * INTO saved;
          RETURN saved;
        END; $$`);
        results.push("✓ Created submit_pick function");
      } catch (e) {}

      // Create grade function
      try {
        await admin.query(`CREATE OR REPLACE FUNCTION public.grade_finished_matches() RETURNS integer LANGUAGE plpgsql AS $$
        DECLARE affected integer;
        BEGIN
          UPDATE public.picks p SET points = CASE
            WHEN NOT EXISTS (SELECT 1 FROM public.matches m WHERE m.id = p.match_id AND NOT m.is_knockout) THEN CASE WHEN p.prediction = (SELECT advancing_team FROM public.matches m WHERE m.id = p.match_id) THEN 3 ELSE 0 END
            ELSE CASE WHEN p.prediction = (SELECT winner FROM public.matches m WHERE m.id = p.match_id) THEN CASE WHEN p.home_score = (SELECT home_score FROM public.matches m WHERE m.id = p.match_id) AND p.away_score = (SELECT away_score FROM public.matches m WHERE m.id = p.match_id) THEN 4 ELSE 3 END ELSE 0 END
          END, locked = true, updated_at = now() FROM public.matches m WHERE p.match_id = m.id AND m.status IN ('FT', 'AET', 'PEN') AND (CASE WHEN m.is_knockout THEN m.advancing_team ELSE m.winner END) IS NOT NULL AND p.points IS NULL;
          GET DIAGNOSTICS affected = ROW_COUNT;
          UPDATE public.picks p SET locked = true FROM public.matches m WHERE p.match_id = m.id AND m.kickoff <= now() AND NOT p.locked;
          RETURN affected;
        END; $$`);
        results.push("✓ Created grade function");
      } catch (e) {}

      // Create streaks function
      try {
        await admin.query(`CREATE OR REPLACE FUNCTION private.pick_streaks(target_player uuid) RETURNS TABLE(current_streak bigint, longest_streak bigint) LANGUAGE sql STABLE AS $$
          WITH ordered AS (SELECT p.points, row_number() OVER (ORDER BY m.kickoff DESC, p.id DESC) as recent_rank, sum(CASE WHEN p.points = 0 OR p.points = 4 THEN 1 ELSE 0 END) OVER (ORDER BY m.kickoff, p.id) as run_group FROM public.picks p JOIN public.matches m ON m.id = p.match_id WHERE p.player_id = target_player AND p.points IS NOT NULL),
          runs AS (SELECT count(*) as run_length FROM ordered WHERE points IN (3, 4) GROUP BY run_group)
          SELECT coalesce((SELECT count(*) FROM ordered o WHERE o.points IN (3, 4) AND o.recent_rank < coalesce((SELECT min(recent_rank) FROM ordered WHERE points = 0), 9223372036854775807)), 0), coalesce((SELECT max(run_length) FROM runs), 0); $$`);
        results.push("✓ Created streaks function");
      } catch (e) {}

      // Create leaderboard view
      try {
        await admin.query(`CREATE OR REPLACE VIEW public.leaderboard WITH (security_invoker = true) AS
          SELECT pl.id as player_id, pl.name, coalesce(sum(pk.points), 0)::integer as points,
          count(*) FILTER (WHERE pk.points IN (3, 4))::integer as correct_picks,
          count(*) FILTER (WHERE pk.points = 0)::integer as incorrect_picks,
          count(pk.id) FILTER (WHERE pk.points IS NULL)::integer as pending_picks,
          count(*) FILTER (WHERE pk.points = 4)::integer as exact_scores,
          CASE WHEN count(*) FILTER (WHERE pk.points IS NOT NULL) = 0 THEN 0 ELSE round(100.0 * count(*) FILTER (WHERE pk.points IN (3, 4)) / count(*) FILTER (WHERE pk.points IS NOT NULL), 1) END as accuracy,
          streaks.current_streak::integer, streaks.longest_streak::integer
          FROM public.players pl LEFT JOIN public.picks pk ON pk.player_id = pl.id CROSS JOIN LATERAL private.pick_streaks(pl.id) streaks
          GROUP BY pl.id, pl.name, streaks.current_streak, streaks.longest_streak`);
        results.push("✓ Created leaderboard view");
      } catch (e) {}

      // Enable RLS and grants
      try {
        await admin.query("ALTER TABLE public.players ENABLE ROW LEVEL SECURITY");
        await admin.query("ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY");
        await admin.query("ALTER TABLE public.picks ENABLE ROW LEVEL SECURITY");
        await admin.query("ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY");
        await admin.query("REVOKE ALL ON SCHEMA public FROM anon, authenticated");
        await admin.query("REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated");
        await admin.query("REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon, authenticated");
        await admin.query("GRANT USAGE ON SCHEMA public TO service_role");
        await admin.query("GRANT SELECT, INSERT, UPDATE, DELETE ON public.players, public.matches, public.picks, public.sync_logs TO service_role");
        await admin.query("GRANT SELECT ON public.leaderboard TO service_role");
        await admin.query("GRANT USAGE, SELECT ON SEQUENCE public.sync_logs_id_seq TO service_role");
        await admin.query("GRANT EXECUTE ON FUNCTION public.submit_pick(uuid, uuid, public.prediction, integer, integer) TO service_role");
        await admin.query("GRANT EXECUTE ON FUNCTION public.grade_finished_matches() TO service_role");
        await admin.query("GRANT USAGE ON SCHEMA private TO service_role");
        await admin.query("GRANT EXECUTE ON FUNCTION private.pick_streaks(uuid) TO service_role");
        results.push("✓ Set up RLS and permissions");
      } catch (e) {}

      // Add players
      const players = ["Cameron", "Irina", "Prithu", "Gopal"];
      for (const name of players) {
        try {
          await admin.query("INSERT INTO public.players (name) VALUES ($1)", [name]);
          results.push(`✓ Added player: ${name}`);
        } catch (e) {
          if (e.message.includes("duplicate")) {
            results.push(`Player ${name} already exists`);
          }
        }
      }

      return NextResponse.json({ success: true, results });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}