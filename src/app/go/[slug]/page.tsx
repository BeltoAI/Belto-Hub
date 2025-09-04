import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/mongo";
import { APPS } from "@/lib/apps";
import GoClient from "./GoClient";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Build a quick lookup by slug (do NOT rely on app.url here)
const APPS_BY_SLUG = Object.fromEntries(APPS.map(a => [a.slug, a]));

export default async function GoPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const app = APPS_BY_SLUG[slug];
  if (!app) return redirect("/");

  try {
    const h = await headers();
    const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
    const ua = h.get("user-agent") ?? "";
    const database = await db();
    await database.collection("clicks").insertOne({ slug, ip, ua, ts: new Date() });
  } catch (e) {
    console.error("click write failed", e);
    // keep going even if logging fails
  }

  return <GoClient slug={slug} url={app.url} />;
}
