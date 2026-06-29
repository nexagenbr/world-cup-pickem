import { isLive } from "@/lib/domain";

type ScheduledMatch = { kickoff: string; status: string };

export function shouldPollResults(matches: ScheduledMatch[], now = new Date()) {
  const time = now.getTime();
  return matches.some((match) => {
    if (isLive(match.status)) return true;
    const kickoff = new Date(match.kickoff).getTime();
    return time >= kickoff - 15 * 60_000 && time <= kickoff + 4 * 60 * 60_000;
  });
}
