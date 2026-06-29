import type { Prediction } from "./domain";

export function scorePick(
  prediction: Prediction,
  result: Prediction | null,
  finished: boolean,
  exactHomeScore?: number,
  exactAwayScore?: number,
  actualHomeScore?: number,
  actualAwayScore?: number,
): number | null {
  if (!finished || !result) return null;

  // Base points for correct winner/draw
  let points = prediction === result ? 3 : 0;

  // Bonus point for exact score in group stage
  if (
    points === 3 &&
    exactHomeScore !== undefined &&
    exactAwayScore !== undefined &&
    actualHomeScore !== undefined &&
    actualAwayScore !== undefined &&
    exactHomeScore === actualHomeScore &&
    exactAwayScore === actualAwayScore
  ) {
    points += 1; // +1 bonus for exact score
  }

  return points;
}

export function calculateStreaks(results: boolean[]) {
  let current = 0;
  let longest = 0;

  for (const correct of results) {
    current = correct ? current + 1 : 0;
    longest = Math.max(longest, current);
  }

  return { current, longest };
}
