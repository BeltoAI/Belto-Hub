import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { APPS } from "@/lib/apps";
export const revalidate = 0;
type DayBucket = { date: string; count: number };
export async function GET() {
  const db = await getDb(); const col = db.collection("click_events");
  const now = new Date();
  const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const past14 = new Date(todayStart); past14.setUTCDate(past14.getUTCDate() - 13);

  const totalsAgg = await col.aggregate([{ $group: { _id: "$slug", count: { $sum: 1 } } }]).toArray();
  const totals: Record<string, number> = {}; totalsAgg.forEach(d => totals[d._id] = d.count);

  const todayAgg = await col.aggregate([{ $match: { ts: { $gte: todayStart } } }, { $group: { _id: "$slug", count: { $sum: 1 } } }]).toArray();
  const today: Record<string, number> = {}; todayAgg.forEach(d => today[d._id] = d.count);

  const last14Agg = await col.aggregate([
    { $match: { ts: { $gte: past14 } } },
    { $project: { slug: 1, day: { $dateToString: { format: "%Y-%m-%d", date: "$ts" } } } },
    { $group: { _id: { slug: "$slug", day: "$day" }, count: { $sum: 1 } } },
  ]).toArray();

  const days = Array.from({length:14},(_,i)=>{ const d = new Date(todayStart); d.setUTCDate(d.getUTCDate()-13+i); return d.toISOString().slice(0,10); });
  const last14: Record<string, DayBucket[]> = {};
  for (const app of APPS) last14[app.slug] = days.map(date => ({ date, count: 0 }));
  for (const r of last14Agg) { const slug = r._id.slug; const day = r._id.day; const arr = last14[slug]; if (arr) { const idx = arr.findIndex(x => x.date === day); if (idx >= 0) arr[idx].count = r.count; } }

  return NextResponse.json({ totals, today, last14, lastUpdatedISO: new Date().toISOString() }, { headers: { "Cache-Control": "no-store" }});
}
