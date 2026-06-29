import { describe, expect, it } from "vitest";
import { shouldPollResults } from "./sync-policy";

describe("shouldPollResults", () => {
  const now = new Date("2026-06-29T18:00:00Z");

  it("skips API calls when no match is near kickoff", () => {
    expect(shouldPollResults([{ kickoff: "2026-06-30T18:00:00Z", status: "NS" }], now)).toBe(false);
  });

  it("polls from fifteen minutes before kickoff through four hours after", () => {
    expect(shouldPollResults([{ kickoff: "2026-06-29T18:10:00Z", status: "NS" }], now)).toBe(true);
  });

  it("continues polling any match marked live", () => {
    expect(shouldPollResults([{ kickoff: "2026-06-29T10:00:00Z", status: "2H" }], now)).toBe(true);
  });
});
