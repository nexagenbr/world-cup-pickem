import type { Match, Prediction } from "../domain";

const DATA_URL = "https://raw.githubusercontent.com/rezarahiminia/worldcup2026/main/football.matches.json";
const LIVE_API_URL = "https://worldcup26.ir/api";

const teamCodes: Record<string, string> = {
  "Argentina": "ARG", "Australia": "AUS", "Austria": "AUT", "Belgium": "BEL",
  "Brazil": "BRA", "Cameroon": "CAM", "Canada": "CAN", "Chile": "CHI",
  "Colombia": "COL", "Costa Rica": "CRC", "Croatia": "CRO", "Denmark": "DEN",
  "Ecuador": "ECU", "Egypt": "EGY", "England": "ENG", "Finland": "FIN",
  "France": "FRA", "Germany": "GER", "Ghana": "GHA", "Greece": "GRE",
  "Honduras": "HON", "Hungary": "HUN", "Iran": "IRN", "Ireland": "IRL",
  "Italy": "ITA", "Ivory Coast": "CIV", "Jamaica": "JAM", "Japan": "JPN",
  "Mexico": "MEX", "Morocco": "MAR", "Netherlands": "NED", "New Zealand": "NZL",
  "Nigeria": "NGA", "Norway": "NOR", "Panama": "PAN", "Paraguay": "PAR",
  "Peru": "PER", "Poland": "POL", "Portugal": "POR", "Qatar": "QAT",
  "Romania": "ROU", "Saudi Arabia": "KSA", "Scotland": "SCO", "Senegal": "SEN",
  "Serbia": "SRB", "Slovakia": "SVK", "Slovenia": "SVN", "South Africa": "RSA",
  "South Korea": "KOR", "Spain": "ESP", "Sweden": "SWE", "Switzerland": "SUI",
  "Turkey": "TUR", "Ukraine": "UKR", "United States": "USA", "Uruguay": "URU",
  "Venezuela": "VEN", "Wales": "WAL", "China": "CHN", "India": "IND",
  "Algeria": "ALG", "Iceland": "ISL", "North Macedonia": "MKD", "Albania": "ALB",
  "Bosnia": "BIH", "Montenegro": "MNE", "Luxembourg": "LUX",
};

function getCode(name: string): string {
  if (teamCodes[name]) return teamCodes[name];
  if (name.includes("Winner")) return "TBD";
  return name.slice(0, 3).toUpperCase();
}

type Game = {
  id: string;
  home_team_id: string;
  away_team_id: string;
  home_team_name_en: string;
  away_team_name_en: string;
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

export type NormalizedMatch = Omit<Match, "id">;

async function fetchWithFallback(url: string): Promise<unknown[]> {
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return Array.isArray(data) ? data : (data.games ?? data.matches ?? []);
  } catch {
    return [];
  }
}

export async function fetchWorldCupGames(): Promise<NormalizedMatch[]> {
  // Try GitHub data first
  let games = await fetchWithFallback(DATA_URL);

  // Try live API as backup
  if (games.length === 0) {
    try {
      const response = await fetch(`${LIVE_API_URL}/get/games`, { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        games = data.games ?? [];
      }
    } catch {}
  }

  if (games.length === 0) {
    throw new Error("No fixtures available");
  }

  return (games as Game[]).map((game) => {
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
      : game.group;

    return {
      api_match_id: parseInt(game.id),
      competition: "FIFA World Cup 2026",
      season: 2026,
      stage: stageName,
      is_knockout: game.type !== "group",
      home_team: game.home_team_name_en || "TBD",
      away_team: game.away_team_name_en || "TBD",
      home_team_code: getCode(game.home_team_name_en || ""),
      away_team_code: getCode(game.away_team_name_en || ""),
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
}
