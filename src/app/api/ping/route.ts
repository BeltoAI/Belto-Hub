import { NextResponse } from "next/server";
import { getDb } from "@/lib/get-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getDb();
    const col = db.collection("clicks");
    const now = new Date();
    await col.insertOne({ slug: "ping", ts: now, where: "vercel" });
    const n = await col.countDocuments({ slug: "ping" });
    return NextResponse.json({
      ok: true,
      env: { hasURI: !!process.env.MONGODB_URI, db: process.env.MONGODB_DB },
      pingCount: n,
    });
  } catch (e:any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
