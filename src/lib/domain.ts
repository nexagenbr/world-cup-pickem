export const predictions = ["HOME", "DRAW", "AWAY"] as const;
export type Prediction = (typeof predictions)[number];

export const finishedStatuses = ["FT", "AET", "PEN"] as const;
export const liveStatuses = ["1H", "HT", "2H", "ET", "BT", "P", "LIVE"] as const;

export type Match = {
  id: string;
  api_match_id: number;
  competition: string;
  season: number;
  stage: string;
  is_knockout: boolean;
  home_team: string;
  away_team: string;
  home_team_code: string | null;
  away_team_code: string | null;
  home_team_logo: string | null;
  away_team_logo: string | null;
  kickoff: string;
  status: string;
  status_detail: string | null;
  elapsed: number | null;
  home_score: number | null;
  away_score: number | null;
  home_penalty_score: number | null;
  away_penalty_score: number | null;
  winner: Prediction | null;
  advancing_team: "HOME" | "AWAY" | null;
  venue: string | null;
};

export type Player = { id: string; name: string };

export type Pick = {
  id: string;
  player_id: string;
  match_id: string;
  prediction: Prediction;
  home_score?: number;
  away_score?: number;
  points: number | null;
  created_at: string;
  updated_at: string;
  locked: boolean;
  match?: Match;
};

export type LeaderboardRow = {
  player_id: string;
  name: string;
  points: number;
  correct_picks: number;
  incorrect_picks: number;
  pending_picks: number;
  exact_scores: number;
  accuracy: number;
  current_streak: number;
  longest_streak: number;
};

export function allowedPredictions(isKnockout: boolean): Prediction[] {
  return isKnockout ? ["HOME", "AWAY"] : [...predictions];
}

export function isPrediction(value: unknown): value is Prediction {
  return typeof value === "string" && predictions.includes(value as Prediction);
}

export function isFinished(status: string) {
  return finishedStatuses.includes(status as (typeof finishedStatuses)[number]);
}

export function isLive(status: string) {
  return liveStatuses.includes(status as (typeof liveStatuses)[number]);
}
