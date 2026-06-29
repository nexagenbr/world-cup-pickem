import type { Prediction } from "./domain";

export function scorePick(
  prediction: Prediction,
  result: Prediction | null,
  finished: boolean,
): number | null {
  if (!finished || !result) return null;
  return prediction === result ? 3 : 0;
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
