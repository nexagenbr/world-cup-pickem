import { getPlayers } from "@/lib/data";
import { jsonError } from "@/lib/http";

export async function GET() {
  try { return Response.json(await getPlayers()); }
  catch (error) { return jsonError(error); }
}
