import type { Match, Prediction } from "../domain";

const MATCHES_URL = "https://raw.githubusercontent.com/rezarahiminia/worldcup2026/main/football.matches.json";
const TEAMS_URL = "https://raw.githubusercontent.com/rezarahiminia/worldcup2026/main/football.teams.json";

type Team = {
  id: string;
  name_en: string;
  fifa_code: string;
  flag: string;
};

type Game = {
  id: string;
  home_team_id: string;
  away_team_id: string;
  home_score: string;
  away_score: string;
  group: string;
  matchday: string;
  local_date: string;
  stadium_id: string;
  finished: string;
  time_elapsed: string;
  type: string;
};

let teamsCache: Map<string, Team> = new Map();

async function fetchTeams(): Promise<Map<string, Team>> {
  if (teamsCache.size > 0) return teamsCache;

  try {
    const response = await fetch(TEAMS_URL, { cache: "no-store" });
    if (!response.ok) return teamsCache;

    const teams: Team[] = await response.json();
    for (const team of teams) {
      teamsCache.set(team.id, team);
    }
  } catch {
    // ignore errors
  }
  return teamsCache;
}

export type NormalizedMatch = Omit<Match, "id">;

export async function fetchWorldCupGames(): Promise<NormalizedMatch[]> {
  // Fetch both in parallel
  const [matchesRes, teams] = await Promise.all([
    fetch(MATCHES_URL, { cache: "no-store" }),
    fetchTeams()
  ]);

  if (!matchesRes.ok) {
    throw new Error("Failed to fetch matches");
  }

  const games: Game[] = await matchesRes.json();

  return games.map((game) => {
    const homeTeam = teams.get(game.home_team_id);
    const awayTeam = teams.get(game.away_team_id);

    const homeScore = game.finished === "TRUE" ? parseInt(game.home_score) : null;
    const awayScore = game.finished === "TRUE" ? parseInt(game.away_score) : null;

    const winner: Prediction | null =
      homeScore === null || awayScore === null
        ? null
        : homeScore === awayScore
          ? "DRAW"
          : homeScore > awayScore
            ? "HOME"
            : "AWAY";

    // Convert date from "06/13/2026 21:00" to ISO
    const dateParts = game.local_date.match(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})/);
    const kickoff = dateParts
      ? `${dateParts[3]}-${dateParts[1]}-${dateParts[2]}T${dateParts[4]}:${dateParts[5]}:00Z`
      : new Date().toISOString();

    const stageName = game.type === "group"
      ? `Group ${game.group} - Matchday ${game.matchday}`
      : game.type === "round16" ? "Round of 32"
      : game.type === "round" ? "Round of 32"
      : game.type === "quarter" ? "Quarter-final"
      : game.type === "semi" ? "Semi-final"
      : game.type === "third_place" ? "Third place"
      : game.type === "final" ? "Final"
      : game.group;

    return {
      api_match_id: parseInt(game.id),
      competition: "FIFA World Cup 2026",
      season: 2026,
      stage: stageName,
      is_knockout: game.type !== "group",
      home_team: homeTeam?.name_en ?? "TBD",
      away_team: awayTeam?.name_en ?? "TBD",
      home_team_code: homeTeam?.fifa_code ?? "",
      away_team_code: awayTeam?.fifa_code ?? "",
      home_team_logo: homeTeam?.flag ?? null,
      away_team_logo: awayTeam?.flag ?? null,
      kickoff,
      status: game.finished === "TRUE" ? "FT" : game.time_elapsed === "live" ? "LIVE" : "NS",
      status_detail: game.finished === "TRUE" ? "Full Time" : game.time_elapsed,
      elapsed: game.time_elapsed === "live" ? 45 : null,
      home_score: homeScore,
      away_score: awayScore,
      home_penalty_score: null,
      away_penalty_score: null,
      winner,
      advancing_team: null,
      venue: null,
    };
  });
}
