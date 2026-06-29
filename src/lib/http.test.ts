import { describe, expect, it } from "vitest";
import { authorizeBearer, parsePickBody } from "./http";

describe("authorizeBearer", () => {
  it("accepts the exact bearer secret", () => {
    expect(authorizeBearer("Bearer a-secure-secret", "a-secure-secret")).toBe(true);
  });

  it("rejects missing and incorrect credentials", () => {
    expect(authorizeBearer(null, "a-secure-secret")).toBe(false);
    expect(authorizeBearer("Bearer wrong", "a-secure-secret")).toBe(false);
  });
});

describe("parsePickBody", () => {
  it("accepts a complete pick", () => {
    const playerId = "11111111-1111-4111-8111-111111111111";
    const matchId = "22222222-2222-4222-8222-222222222222";
    expect(parsePickBody({ playerId, matchId, prediction: "HOME" })).toEqual({
      playerId, matchId, prediction: "HOME",
    });
  });

  it("rejects an invalid prediction", () => {
    expect(() => parsePickBody({ playerId: "p1", matchId: "m1", prediction: "BRAZIL" })).toThrow("Invalid pick");
  });
});
