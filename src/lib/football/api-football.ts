import type { Match, Prediction } from "@/lib/domain";

const API_URL = "https://v3.football.api-sports.io";
const knockoutPattern = /round of|quarter|semi|final|third place/i;

type Team = { name: string; code?: string | null; logo?: string | null; winner?: boolean | null };

export type ApiFixture = {
  fixture: {
    id: number;
    date: string;
    status: { short: string; long: string; elapsed: number | null };
    venue?: { name?: string | null } | null;
  };
  league: { round: string };
  teams: { home: Team; away: Team };
  goals: { home: number | null; away: number | null };
  score?: { penalty?: { home: number | null; away: number | null } | null };
};

export type NormalizedMatch = Omit<Match, "id">;

export function normalizeFixture(item: ApiFixture): NormalizedMatch {
  const homeScore = item.goals.home;
  const awayScore = item.goals.away;
  const winner: Prediction | null =
    homeScore === null || awayScore === null
      ? null
      : homeScore === awayScore
        ? "DRAW"
        : homeScore > awayScore
          ? "HOME"
          : "AWAY";

  const advancingTeam = item.teams.home.winner
    ? "HOME"
    : item.teams.away.winner
      ? "AWAY"
      : null;

  return {
    api_match_id: item.fixture.id,
    competition: "FIFA World Cup",
    season: 2026,
    stage: item.league.round,
    is_knockout: knockoutPattern.test(item.league.round),
    home_team: item.teams.home.name,
    away_team: item.teams.away.name,
    home_team_code: item.teams.home.code ?? null,
    away_team_code: item.teams.away.code ?? null,
    home_team_logo: item.teams.home.logo ?? null,
    away_team_logo: item.teams.away.logo ?? null,
    kickoff: item.fixture.date,
    status: item.fixture.status.short,
    status_detail: item.fixture.status.long,
    elapsed: item.fixture.status.elapsed,
    home_score: homeScore,
    away_score: awayScore,
    home_penalty_score: item.score?.penalty?.home ?? null,
    away_penalty_score: item.score?.penalty?.away ?? null,
    winner,
    advancing_team: advancingTeam,
    venue: item.fixture.venue?.name ?? null,
  };
}

async function requestFixtures(apiKey: string, search: URLSearchParams) {
  const response = await fetch(`${API_URL}/fixtures?${search}`, {
    headers: { "x-apisports-key": apiKey },
    cache: "no-store",
  });

  if (!response.ok) throw new Error(`API-Football request failed (${response.status})`);

  const payload = (await response.json()) as {
    errors?: Record<string, string> | string[];
    response?: ApiFixture[];
  };

  if (payload.errors && Object.keys(payload.errors).length) {
    throw new Error(`API-Football error: ${JSON.stringify(payload.errors)}`);
  }

  return (payload.response ?? []).map(normalizeFixture);
}

export function fetchAllFixtures(apiKey: string) {
  return requestFixtures(apiKey, new URLSearchParams({ league: "1", season: "2026" }));
}

export function fetchActiveFixtures(apiKey: string, now = new Date()) {
  const from = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const to = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  return requestFixtures(
    apiKey,
    new URLSearchParams({ league: "1", season: "2026", from, to, timezone: "UTC" }),
  );
}
