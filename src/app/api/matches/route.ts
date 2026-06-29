import { getMatches } from "@/lib/data";
import { jsonError } from "@/lib/http";

export async function GET() {
  try { return Response.json(await getMatches()); }
  catch (error) { return jsonError(error); }
}
