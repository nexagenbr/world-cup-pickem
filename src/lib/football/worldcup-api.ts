import type { Match, Prediction } from "../domain";

const API_URL = "https://worldcup26.ir/api";
const knockoutPattern = /round|quarter|semi|final|third place/i;

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
  home_team_name_en: string;
  away_team_name_en: string;
};

const teamCodes: Record<string, string> = {
  "Argentina": "ARG", "Australia": "AUS", "Austria": "AUT", "Azerbaijan": "AZE",
  "Belgium": "BEL", "Bosnia": "BIH", "Brazil": "BRA", "Cameroon": "CAM",
  "Canada": "CAN", "Chile": "CHI", "Colombia": "COL", "Costa Rica": "CRC",
  "Croatia": "CRO", "Denmark": "DEN", "Ecuador": "ECU", "Egypt": "EGY",
  "England": "ENG", "Finland": "FIN", "France": "FRA", "Germany": "GER",
  "Ghana": "GHA", "Greece": "GRE", "Honduras": "HON", "Hungary": "HUN",
  "Iran": "IRN", "Ireland": "IRL", "Italy": "ITA", "Ivory Coast": "CIV",
  "Jamaica": "JAM", "Japan": "JPN", "Mexico": "MEX", "Morocco": "MAR",
  "Netherlands": "NED", "New Zealand": "NZL", "Nigeria": "NGA", "Norway": "NOR",
  "Panama": "PAN", "Paraguay": "PAR", "Peru": "PER", "Poland": "POL",
  "Portugal": "POR", "Qatar": "QAT", "Romania": "ROU", "Saudi Arabia": "KSA",
  "Scotland": "SCO", "Senegal": "SEN", "Serbia": "SRB", "Slovakia": "SVK",
  "Slovenia": "SVN", "South Africa": "RSA", "South Korea": "KOR", "Spain": "ESP",
  "Sweden": "SWE", "Switzerland": "SUI", "Turkey": "TUR", "Ukraine": "UKR",
  "United States": "USA", "Uruguay": "URU", "Venezuela": "VEN", "Wales": "WAL",
};

function getCode(name: string): string {
  return teamCodes[name] ?? name.slice(0, 3).toUpperCase();
}

function getStageName(group: string, matchday: string, type: string): string {
  if (type === "group" || type.includes("group")) {
    return `Group ${group} - Matchday ${matchday}`;
  }
  const stages: Record<string, string> = {
    "round16": "Round of 32",
    "round_of_16": "Round of 32",
    "round": "Round of 32",
    "quarter": "Quarter-final",
    "quarterfinal": "Quarter-final",
    "semi": "Semi-final",
    "semifinal": "Semi-final",
    "third_place": "Third place",
    "final": "Final",
  };
  return stages[group] ?? stages[type] ?? `Round of 32 - ${group}`;
}

export type NormalizedMatch = Omit<Match, "id">;

export async function fetchWorldCupGames(): Promise<NormalizedMatch[]> {
  try {
    const response = await fetch(`${API_URL}/get/games`, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    const games: Game[] = data.games ?? [];

    return games.map((game) => {
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

      const stageName = getStageName(game.group, game.matchday, game.type);
      const isKnockout = !game.type.includes("group") && !game.type.includes("type");

      // Convert date format from "06/13/2026 21:00" to ISO
      const dateParts = game.local_date.match(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})/);
      const kickoff = dateParts
        ? `${dateParts[3]}-${dateParts[1]}-${dateParts[2]}T${dateParts[4]}:${dateParts[5]}:00Z`
        : new Date().toISOString();

      return {
        api_match_id: parseInt(game.id),
        competition: "FIFA World Cup 2026",
        season: 2026,
        stage: stageName,
        is_knockout: isKnockout,
        home_team: game.home_team_name_en,
        away_team: game.away_team_name_en,
        home_team_code: getCode(game.home_team_name_en),
        away_team_code: getCode(game.away_team_name_en),
        home_team_logo: null,
        away_team_logo: null,
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
  } catch (error) {
    console.error("WorldCup API error:", error);
    return [];
  }
}

export async function fetchWorldCupGroups(): Promise<unknown[]> {
  try {
    const response = await fetch(`${API_URL}/get/groups`, { cache: "no-store" });
    if (!response.ok) return [];
    const data = await response.json();
    return data.groups ?? [];
  } catch {
    return [];
  }
}
