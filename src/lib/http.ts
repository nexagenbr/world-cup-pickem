import { timingSafeEqual } from "node:crypto";
import { isPrediction, type Prediction } from "@/lib/domain";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function authorizeBearer(header: string | null, secret: string) {
  if (!header?.startsWith("Bearer ")) return false;
  const supplied = Buffer.from(header.slice(7));
  const expected = Buffer.from(secret);
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

export function parsePickBody(body: unknown): {
  playerId: string;
  matchId: string;
  prediction: Prediction;
} {
  if (!body || typeof body !== "object") throw new Error("Invalid pick");
  const value = body as Record<string, unknown>;
  if (!uuid.test(String(value.playerId)) || !uuid.test(String(value.matchId)) || !isPrediction(value.prediction)) {
    throw new Error("Invalid pick");
  }
  return {
    playerId: String(value.playerId),
    matchId: String(value.matchId),
    prediction: value.prediction,
  };
}

export function jsonError(error: unknown, status = 500) {
  const message = error instanceof Error ? error.message : "Unexpected error";
  return Response.json({ error: message }, { status });
}
