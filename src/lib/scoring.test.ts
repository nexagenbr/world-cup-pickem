import { describe, expect, it } from "vitest";
import { allowedPredictions } from "./domain";
import { calculateStreaks, scorePick } from "./scoring";

describe("allowedPredictions", () => {
  it("allows a draw during the group stage", () => {
    expect(allowedPredictions(false)).toEqual(["HOME", "DRAW", "AWAY"]);
  });

  it("only allows advancing teams during knockout rounds", () => {
    expect(allowedPredictions(true)).toEqual(["HOME", "AWAY"]);
  });
});

describe("scorePick", () => {
  it("awards three points for the correct group-stage outcome", () => {
    expect(scorePick("DRAW", "DRAW", true)).toBe(3);
  });

  it("awards zero points for a wrong outcome", () => {
    expect(scorePick("HOME", "AWAY", true)).toBe(0);
  });

  it("does not grade unfinished matches", () => {
    expect(scorePick("HOME", "HOME", false)).toBeNull();
  });
});

describe("calculateStreaks", () => {
  it("calculates current and longest correct streaks in kickoff order", () => {
    expect(calculateStreaks([true, true, false, true, true, true])).toEqual({
      current: 3,
      longest: 3,
    });
  });

  it("returns zeroes without graded picks", () => {
    expect(calculateStreaks([])).toEqual({ current: 0, longest: 0 });
  });
});
