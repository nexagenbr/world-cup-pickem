import type { Match, Prediction } from "../domain";

const knockoutPattern = /round of|quarter|semi|final|third place/i;

export type FixtureInput = {
  id: number;
  date: string;
  stage: string;
  home_team: string;
  away_team: string;
  home_code: string;
  away_code: string;
  venue?: string;
};

function normalizeMatch(f: FixtureInput, homeScore?: number, awayScore?: number): Omit<Match, "id"> {
  const winner: Prediction | null =
    homeScore === undefined || awayScore === undefined || homeScore === null || awayScore === null
      ? null
      : homeScore === awayScore
        ? "DRAW"
        : homeScore > awayScore
          ? "HOME"
          : "AWAY";

  return {
    api_match_id: f.id,
    competition: "FIFA World Cup 2026",
    season: 2026,
    stage: f.stage,
    is_knockout: knockoutPattern.test(f.stage),
    home_team: f.home_team,
    away_team: f.away_team,
    home_team_code: f.home_code,
    away_team_code: f.away_code,
    home_team_logo: null,
    away_team_logo: null,
    kickoff: f.date,
    status: homeScore !== undefined ? "FT" : "NS",
    status_detail: homeScore !== undefined ? "Full Time" : null,
    elapsed: null,
    home_score: homeScore ?? null,
    away_score: awayScore ?? null,
    home_penalty_score: null,
    away_penalty_score: null,
    winner,
    advancing_team: null,
    venue: f.venue ?? null,
  };
}

// World Cup 2026 fixtures (June 11 - July 18, 2026) - USA, Canada, Mexico
// Stage 1: Group Stage
const groupStageFixtures: FixtureInput[] = [
  // Matchday 1 - June 11
  { id: 1, date: "2026-06-11T20:00:00Z", stage: "Group A - Matchday 1", home_team: "Argentina", away_team: "Argentina", home_code: "ARG", away_code: "ARG", venue: "MetLife Stadium, New Jersey" },
  { id: 2, date: "2026-06-11T23:00:00Z", stage: "Group A - Matchday 1", home_team: "Argentina", away_team: "Canada", home_code: "ARG", away_code: "CAN", venue: "MetLife Stadium, New Jersey" },

  // Matchday 1 - June 12
  { id: 3, date: "2026-06-12T17:00:00Z", stage: "Group B - Matchday 1", home_team: "Spain", away_team: "Nigeria", home_code: "ESP", away_code: "NGA", venue: "AT&T Stadium, Texas" },
  { id: 4, date: "2026-06-12T20:00:00Z", stage: "Group B - Matchday 1", home_team: "Brazil", away_team: "Colombia", home_code: "BRA", away_code: "COL", venue: "Rose Bowl, California" },
  { id: 5, date: "2026-06-12T23:00:00Z", stage: "Group C - Matchday 1", home_team: "Mexico", away_team: "Ecuador", home_code: "MEX", away_code: "ECU", venue: "Azteca Stadium, Mexico City" },

  // Matchday 1 - June 13
  { id: 6, date: "2026-06-13T17:00:00Z", stage: "Group D - Matchday 1", home_team: "France", away_team: "USA", home_code: "FRA", away_code: "USA", venue: "MetLife Stadium, New Jersey" },
  { id: 7, date: "2026-06-13T20:00:00Z", stage: "Group D - Matchday 1", home_team: "Germany", away_team: "Japan", home_code: "GER", away_code: "JPN", venue: "NRG Stadium, Houston" },
  { id: 8, date: "2026-06-13T23:00:00Z", stage: "Group E - Matchday 1", home_team: "Portugal", away_team: "Iran", home_code: "POR", away_code: "IRN", venue: "SoFi Stadium, California" },

  // Matchday 1 - June 14
  { id: 9, date: "2026-06-14T17:00:00Z", stage: "Group F - Matchday 1", home_team: "England", away_team: "Serbia", home_code: "ENG", away_code: "SRB", venue: "Lambeau Field, Wisconsin" },
  { id: 10, date: "2026-06-14T20:00:00Z", stage: "Group F - Matchday 1", home_team: "Belgium", away_team: "South Korea", home_code: "BEL", away_code: "KOR", venue: "BC Place, Vancouver" },
  { id: 11, date: "2026-06-14T23:00:00Z", stage: "Group G - Matchday 1", home_team: "Netherlands", away_team: "Senegal", home_code: "NED", away_code: "SEN", venue: "Estadio Azteca, Mexico City" },

  // Matchday 1 - June 15
  { id: 12, date: "2026-06-15T17:00:00Z", stage: "Group H - Matchday 1", home_team: "Uruguay", away_team: "Australia", home_code: "URU", away_code: "AUS", venue: "Allegiant Stadium, Las Vegas" },
  { id: 13, date: "2026-06-15T20:00:00Z", stage: "Group H - Matchday 1", home_team: "Italy", away_team: "Ghana", home_code: "ITA", away_code: "GHA", venue: "Lamar Hunt U.S. Open Cup Stadium, Texas" },
  { id: 14, date: "2026-06-15T23:00:00Z", stage: "Group A - Matchday 1", home_team: "Mexico", away_team: "Canada", home_code: "MEX", away_code: "CAN", venue: "Estadio Azteca, Mexico City" },

  // Matchday 2 - June 17
  { id: 15, date: "2026-06-17T17:00:00Z", stage: "Group A - Matchday 2", home_team: "Argentina", away_team: "Mexico", home_code: "ARG", away_code: "MEX", venue: "MetLife Stadium, New Jersey" },
  { id: 16, date: "2026-06-17T20:00:00Z", stage: "Group A - Matchday 2", home_team: "Canada", away_team: "Canada", home_code: "CAN", away_code: "CAN", venue: "BMO Field, Toronto" },
  { id: 17, date: "2026-06-17T23:00:00Z", stage: "Group B - Matchday 2", home_team: "Spain", away_team: "Brazil", home_code: "ESP", away_code: "BRA", venue: "Rose Bowl, California" },

  // Matchday 2 - June 18
  { id: 18, date: "2026-06-18T17:00:00Z", stage: "Group B - Matchday 2", home_team: "Nigeria", away_team: "Colombia", home_code: "NGA", away_code: "COL", venue: "Levi's Stadium, California" },
  { id: 19, date: "2026-06-18T20:00:00Z", stage: "Group C - Matchday 2", home_team: "Ecuador", away_team: "Argentina", home_code: "ECU", away_code: "ARG", venue: "NRG Stadium, Houston" },
  { id: 20, date: "2026-06-18T23:00:00Z", stage: "Group C - Matchday 2", home_team: "Mexico", away_team: "Argentina", home_code: "MEX", away_code: "ARG", venue: "Estadio Azteca, Mexico City" },

  // Matchday 2 - June 19
  { id: 21, date: "2026-06-19T17:00:00Z", stage: "Group D - Matchday 2", home_team: "France", away_team: "Germany", home_code: "FRA", away_code: "GER", venue: "SoFi Stadium, California" },
  { id: 22, date: "2026-06-19T20:00:00Z", stage: "Group D - Matchday 2", home_team: "Japan", away_team: "USA", home_code: "JPN", away_code: "USA", venue: "AT&T Stadium, Texas" },
  { id: 23, date: "2026-06-19T23:00:00Z", stage: "Group E - Matchday 2", home_team: "Portugal", away_team: "Japan", home_code: "POR", away_code: "JPN", venue: "Allegiant Stadium, Las Vegas" },

  // Matchday 2 - June 20
  { id: 24, date: "2026-06-20T17:00:00Z", stage: "Group E - Matchday 2", home_team: "Iran", away_team: "South Korea", home_code: "IRN", away_code: "KOR", venue: "BC Place, Vancouver" },
  { id: 25, date: "2026-06-20T20:00:00Z", stage: "Group F - Matchday 2", home_team: "England", away_team: "Belgium", home_code: "ENG", away_code: "BEL", venue: "MetLife Stadium, New Jersey" },
  { id: 26, date: "2026-06-20T23:00:00Z", stage: "Group F - Matchday 2", home_team: "Serbia", away_team: "Netherlands", home_code: "SRB", away_code: "NED", venue: "Rose Bowl, California" },

  // Matchday 2 - June 21
  { id: 27, date: "2026-06-21T17:00:00Z", stage: "Group G - Matchday 2", home_team: "Netherlands", away_team: "Italy", home_code: "NED", away_code: "ITA", venue: "AT&T Stadium, Texas" },
  { id: 28, date: "2026-06-21T20:00:00Z", stage: "Group G - Matchday 2", home_team: "Senegal", away_team: "Ghana", home_code: "SEN", away_code: "GHA", venue: "NRG Stadium, Houston" },
  { id: 29, date: "2026-06-21T23:00:00Z", stage: "Group H - Matchday 2", home_team: "Uruguay", away_team: "Italy", home_code: "URU", away_code: "ITA", venue: "SoFi Stadium, California" },

  // Matchday 2 - June 22
  { id: 30, date: "2026-06-22T17:00:00Z", stage: "Group H - Matchday 2", home_team: "Australia", away_team: "Ghana", home_code: "AUS", away_code: "GHA", venue: "Allegiant Stadium, Las Vegas" },
  { id: 31, date: "2026-06-22T20:00:00Z", stage: "Group A - Matchday 3", home_team: "Canada", away_team: "Mexico", home_code: "CAN", away_code: "MEX", venue: "BMO Field, Toronto" },
  { id: 32, date: "2026-06-22T23:00:00Z", stage: "Group A - Matchday 3", home_team: "Argentina", away_team: "Canada", home_code: "ARG", away_code: "CAN", venue: "MetLife Stadium, New Jersey" },

  // Matchday 3 - June 23
  { id: 33, date: "2026-06-23T17:00:00Z", stage: "Group B - Matchday 3", home_team: "Colombia", away_team: "Nigeria", home_code: "COL", away_code: "NGA", venue: "Levi's Stadium, California" },
  { id: 34, date: "2026-06-23T20:00:00Z", stage: "Group B - Matchday 3", home_team: "Brazil", away_team: "Spain", home_code: "BRA", away_code: "ESP", venue: "Rose Bowl, California" },
  { id: 35, date: "2026-06-23T23:00:00Z", stage: "Group C - Matchday 3", home_team: "Argentina", away_team: "Mexico", home_code: "ARG", away_code: "MEX", venue: "NRG Stadium, Houston" },

  // Matchday 3 - June 24
  { id: 36, date: "2026-06-24T17:00:00Z", stage: "Group C - Matchday 3", home_team: "Ecuador", away_team: "Mexico", home_code: "ECU", away_code: "MEX", venue: "Estadio Azteca, Mexico City" },
  { id: 37, date: "2026-06-24T20:00:00Z", stage: "Group D - Matchday 3", home_team: "USA", away_team: "Germany", home_code: "USA", away_code: "GER", venue: "AT&T Stadium, Texas" },
  { id: 38, date: "2026-06-24T23:00:00Z", stage: "Group D - Matchday 3", home_team: "Japan", away_team: "France", home_code: "JPN", away_code: "FRA", venue: "MetLife Stadium, New Jersey" },

  // Matchday 3 - June 25
  { id: 39, date: "2026-06-25T17:00:00Z", stage: "Group E - Matchday 3", home_team: "South Korea", away_team: "Portugal", home_code: "KOR", away_code: "POR", venue: "BC Place, Vancouver" },
  { id: 40, date: "2026-06-25T20:00:00Z", stage: "Group E - Matchday 3", home_team: "Japan", away_team: "Iran", home_code: "JPN", away_code: "IRN", venue: "Allegiant Stadium, Las Vegas" },
  { id: 41, date: "2026-06-25T23:00:00Z", stage: "Group F - Matchday 3", home_team: "Netherlands", away_team: "England", home_code: "NED", away_code: "ENG", venue: "SoFi Stadium, California" },

  // Matchday 3 - June 26
  { id: 42, date: "2026-06-26T17:00:00Z", stage: "Group F - Matchday 3", home_team: "Belgium", away_team: "Serbia", home_code: "BEL", away_code: "SRB", venue: "Rose Bowl, California" },
  { id: 43, date: "2026-06-26T20:00:00Z", stage: "Group G - Matchday 3", home_team: "Ghana", away_team: "Netherlands", home_code: "GHA", away_code: "NED", venue: "NRG Stadium, Houston" },
  { id: 44, date: "2026-06-26T23:00:00Z", stage: "Group G - Matchday 3", home_team: "Italy", away_team: "Senegal", home_code: "ITA", away_code: "SEN", venue: "AT&T Stadium, Texas" },

  // Matchday 3 - June 27
  { id: 45, date: "2026-06-27T17:00:00Z", stage: "Group H - Matchday 3", home_team: "Ghana", away_team: "Uruguay", home_code: "GHA", away_code: "URU", venue: "MetLife Stadium, New Jersey" },
  { id: 46, date: "2026-06-27T20:00:00Z", stage: "Group H - Matchday 3", home_team: "Italy", away_team: "Australia", home_code: "ITA", away_code: "AUS", venue: "SoFi Stadium, California" },

  // Round of 32 - June 28-29
  { id: 47, date: "2026-06-28T17:00:00Z", stage: "Round of 32", home_team: "1A", away_team: "3C/3D/3E", home_code: "TBD", away_code: "TBD", venue: "NRG Stadium, Houston" },
  { id: 48, date: "2026-06-28T20:00:00Z", stage: "Round of 32", home_team: "1B", away_team: "3A/3D/3F", home_code: "TBD", away_code: "TBD", venue: "SoFi Stadium, California" },
  { id: 49, date: "2026-06-28T23:00:00Z", stage: "Round of 32", home_team: "1C", away_team: "3B/3D/3E", home_code: "TBD", away_code: "TBD", venue: "MetLife Stadium, New Jersey" },
  { id: 50, date: "2026-06-29T17:00:00Z", stage: "Round of 32", home_team: "1D", away_team: "2B", home_code: "TBD", away_code: "TBD", venue: "AT&T Stadium, Texas" },
  { id: 51, date: "2026-06-29T20:00:00Z", stage: "Round of 32", home_team: "1E", away_team: "2A", home_code: "TBD", away_code: "TBD", venue: "Allegiant Stadium, Las Vegas" },
  { id: 52, date: "2026-06-29T23:00:00Z", stage: "Round of 32", home_team: "1F", away_team: "2C", home_code: "TBD", away_code: "TBD", venue: "BC Place, Vancouver" },

  // Round of 32 - June 30
  { id: 53, date: "2026-06-30T17:00:00Z", stage: "Round of 32", home_team: "1G", away_team: "2H", home_code: "TBD", away_code: "TBD", venue: "Rose Bowl, California" },
  { id: 54, date: "2026-06-30T20:00:00Z", stage: "Round of 32", home_team: "1H", away_team: "2G", home_code: "TBD", away_code: "TBD", venue: "Estadio Azteca, Mexico City" },

  // Quarter Finals - July 3-4
  { id: 55, date: "2026-07-03T17:00:00Z", stage: "Quarter-final", home_team: "Winner 49", away_team: "Winner 53", home_code: "TBD", away_code: "TBD", venue: "MetLife Stadium, New Jersey" },
  { id: 56, date: "2026-07-03T20:00:00Z", stage: "Quarter-final", home_team: "Winner 47", away_team: "Winner 51", home_code: "TBD", away_code: "TBD", venue: "AT&T Stadium, Texas" },
  { id: 57, date: "2026-07-04T17:00:00Z", stage: "Quarter-final", home_team: "Winner 48", away_team: "Winner 54", home_code: "TBD", away_code: "TBD", venue: "SoFi Stadium, California" },
  { id: 58, date: "2026-07-04T20:00:00Z", stage: "Quarter-final", home_team: "Winner 50", away_team: "Winner 52", home_code: "TBD", away_code: "TBD", venue: "Allegiant Stadium, Las Vegas" },

  // Semi Finals - July 8-9
  { id: 59, date: "2026-07-08T20:00:00Z", stage: "Semi-final", home_team: "Winner 55", away_team: "Winner 57", home_code: "TBD", away_code: "TBD", venue: "MetLife Stadium, New Jersey" },
  { id: 60, date: "2026-07-09T20:00:00Z", stage: "Semi-final", home_team: "Winner 56", away_team: "Winner 58", home_code: "TBD", away_code: "TBD", venue: "SoFi Stadium, California" },

  // Third Place - July 12
  { id: 61, date: "2026-07-12T20:00:00Z", stage: "Third place", home_team: "Loser 59", away_team: "Loser 60", home_code: "TBD", away_code: "TBD", venue: "Estadio Azteca, Mexico City" },

  // Final - July 18
  { id: 62, date: "2026-07-18T20:00:00Z", stage: "Final", home_team: "Winner 59", away_team: "Winner 60", home_code: "TBD", away_code: "TBD", venue: "MetLife Stadium, New Jersey" },
];

export function getWorldCupFixtures(): Omit<Match, "id">[] {
  return groupStageFixtures.map(f => normalizeMatch(f));
}

export function getWorldCupFixtureById(id: number): Omit<Match, "id"> | undefined {
  const fixture = groupStageFixtures.find(f => f.id === id);
  return fixture ? normalizeMatch(fixture) : undefined;
}

// For backwards compatibility with API-Football
export { normalizeMatch };
