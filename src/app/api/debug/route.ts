import { NextResponse } from "next/server";
export const runtime="nodejs"; export const dynamic="force-dynamic";
export async function GET() {
  const uri = process.env.MONGODB_URI || "";
  return NextResponse.json({
    hasUri: !!uri,
    startsWithSrv: uri.startsWith("mongodb+srv://"),
    db: process.env.MONGODB_DB || null
  });
}
