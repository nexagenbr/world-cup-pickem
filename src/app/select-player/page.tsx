import { getPlayers } from "@/lib/data";
import { PlayerSelection } from "@/components/player-selection";

export const dynamic = "force-dynamic";
export default async function SelectPlayerPage() { return <PlayerSelection players={await getPlayers()} />; }
