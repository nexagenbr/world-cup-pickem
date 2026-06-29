import { env } from "@/lib/env";
import { authorizeBearer, jsonError } from "@/lib/http";
import { syncTournament } from "@/lib/sync";

export async function GET(request: Request) {
  if (!authorizeBearer(request.headers.get("authorization"), env.cronSecret())) return jsonError(new Error("Unauthorized"), 401);
  try { return Response.json(await syncTournament("results")); }
  catch (error) { return jsonError(error); }
}
