import { describe, expect, it } from "vitest";
import { normalizeFixture } from "./api-football";

const fixture = {
  fixture: {
    id: 1489369,
    date: "2026-06-29T19:00:00+00:00",
    status: { short: "NS", long: "Not Started", elapsed: null },
    venue: { name: "MetLife Stadium" },
  },
  league: { round: "Group Stage - 1" },
  teams: {
    home: { name: "Brazil", code: "BRA", logo: "https://cdn.test/bra.png", winner: null },
    away: { name: "Japan", code: "JPN", logo: "https://cdn.test/jpn.png", winner: null },
  },
  goals: { home: null, away: null },
  score: { penalty: { home: null, away: null } },
};

describe("normalizeFixture", () => {
  it("normalizes a scheduled group match", () => {
    expect(normalizeFixture(fixture)).toMatchObject({
      api_match_id: 1489369,
      stage: "Group Stage - 1",
      is_knockout: false,
      home_team: "Brazil",
      away_team: "Japan",
      status: "NS",
      winner: null,
    });
  });

  it("uses the shootout winner as the advancing team", () => {
    const penaltyFixture = {
      ...fixture,
      fixture: { ...fixture.fixture, status: { short: "PEN", long: "Match Finished", elapsed: 120 } },
      league: { round: "Round of 16" },
      teams: {
        home: { ...fixture.teams.home, winner: false },
        away: { ...fixture.teams.away, winner: true },
      },
      goals: { home: 1, away: 1 },
      score: { penalty: { home: 3, away: 4 } },
    };

    expect(normalizeFixture(penaltyFixture)).toMatchObject({
      is_knockout: true,
      status: "PEN",
      winner: "DRAW",
      advancing_team: "AWAY",
      home_penalty_score: 3,
      away_penalty_score: 4,
    });
  });
});
