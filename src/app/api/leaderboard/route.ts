import { getLeaderboard } from "@/lib/data";
import { jsonError } from "@/lib/http";

export async function GET() {
  try { return Response.json(await getLeaderboard()); }
  catch (error) { return jsonError(error); }
}
