import { getDb } from "@/lib/get-db";

type Pt = { date: string; count: number };
export type Stat = { total: number; today: number; series: Pt[] };
export type StatMap = Record<string, Stat>;

export async function getClickStats(days = 14): Promise<StatMap> {
  const db = await getDb();
  const clicks = db.collection("clicks");
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - (days - 1)));

  const agg = await clicks.aggregate([
    { $match: { ts: { $gte: start } } },
    {
      $group: {
        _id: {
          slug: "$slug",
          day: { $dateToString: { date: "$ts", format: "%Y-%m-%d", timezone: "UTC" } }
        },
        c: { $sum: 1 }
      }
    }
  ]).toArray();

  const daysList: string[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - (days - 1 - i)));
    daysList.push(d.toISOString().slice(0,10));
  }
  const todayStr = now.toISOString().slice(0,10);

  const bySlug = new Map<string, Map<string, number>>();
  for (const row of agg as any[]) {
    const slug = row._id.slug as string;
    const day  = row._id.day as string;
    const c    = row.c as number;
    if (!bySlug.has(slug)) bySlug.set(slug, new Map());
    bySlug.get(slug)!.set(day, c);
  }

  const out: StatMap = {};
  for (const [slug, dayMap] of bySlug) {
    const series: Pt[] = daysList.map(d => ({ date: d, count: dayMap.get(d) ?? 0 }));
    const total = series.reduce((s,p)=>s+p.count, 0);
    const today = dayMap.get(todayStr) ?? 0;
    out[slug] = { total, today, series };
  }
  return out;
}
