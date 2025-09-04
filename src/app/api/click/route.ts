export const dynamic="force-dynamic";
export const runtime="nodejs";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { APPS_BY_SLUG } from "@/lib/apps";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const slug = (body?.slug ?? "") as string;
    if (!slug || !APPS_BY_SLUG[slug]) return new NextResponse(null, { status: 204 });

    try {
      const db = await getDb();
      await db.collection("click_events").insertOne({
        slug,
        ts: new Date(),
        ua: req.headers.get("user-agent") || null,
        ref: req.headers.get("referer") || null,
        ip: req.headers.get("x-forwarded-for") || null,
      });
    } catch {
      // swallow DB errors: never block navigation
    }
    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}
