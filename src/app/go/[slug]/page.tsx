import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/mongo";
import { APPS_BY_SLUG } from "@/lib/apps";

export const dynamic = "force-dynamic";

export default async function GoPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const app = APPS_BY_SLUG[slug];
  if (!app) redirect("/");

  try {
    const h = await headers();
    const db = await getDb();
    await db.collection("click_events").insertOne({
      slug,
      ts: new Date(),
      ua: h.get("user-agent") || null,
      ref: h.get("referer") || null,
      ip: h.get("x-forwarded-for") || null,
    });
  } catch (err) {
    // fail-safe: never block the redirect
    console.error("click log failed:", (err as Error).message);
  }

  redirect(app.url);
}
