import { APPS } from "@/lib/apps";
import { getClickStats } from "@/lib/stats";
import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";

export default async function Page() {
  const initialStats = await getClickStats(14);
  return <HomeClient initialStats={initialStats} apps={APPS} />;
}
