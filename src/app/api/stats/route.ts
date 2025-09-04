import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getDb();
    const col = db.collection("click_events");

    const now = new Date();
    const start14 = new Date(now); start14.setDate(now.getDate() - 13); start14.setHours(0,0,0,0);
    const startToday = new Date(now); startToday.setHours(0,0,0,0);

    const totalsAgg = await col.aggregate([{ $group: { _id: "$slug", total: { $sum: 1 } } }]).toArray();
    const todayAgg  = await col.aggregate([{ $match: { ts: { $gte: startToday } } }, { $group: { _id: "$slug", today: { $sum: 1 } } }]).toArray();
    const last14Agg = await col.aggregate([
      { $match: { ts: { $gte: start14 } } },
      { $project: { slug: 1, day: { $dateToString: { format: "%Y-%m-%d", date: "$ts" } } } },
      { $group: { _id: { slug: "$slug", day: "$day" }, count: { $sum: 1 } } },
      { $sort: { "_id.day": 1 } },
    ]).toArray();

    const totals: Record<string, number> = {};
    for (const r of totalsAgg) totals[r._id as string] = r.total as number;

    const today: Record<string, number> = {};
    for (const r of todayAgg) today[r._id as string] = r.today as number;

    const last14: Record<string, { date: string; count: number }[]> = {};
    for (const r of last14Agg) {
      const slug = (r._id as any).slug as string;
      const day = (r._id as any).day as string;
      (last14[slug] ||= []).push({ date: day, count: r.count as number });
    }

    return NextResponse.json({ totals, today, last14, lastUpdatedISO: new Date().toISOString() }, { headers: { "Cache-Control": "no-store" } });
  } catch (e: any) {
    // SAFE FALLBACK
    return NextResponse.json({ totals: {}, today: {}, last14: {}, lastUpdatedISO: new Date().toISOString(), error: e?.message ?? "db error" }, { headers: { "Cache-Control": "no-store" } });
  }
}
