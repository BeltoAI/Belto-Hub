import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
export async function GET() { const db = await getDb(); const ok = await db.command({ ping: 1 }); return NextResponse.json({ ok, time: new Date().toISOString() }); }
