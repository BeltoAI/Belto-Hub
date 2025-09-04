import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/mongo";
import { APPS_BY_SLUG } from "@/lib/apps";

export const dynamic = "force-dynamic";

export default async function GoPage(
  { params }: { params: Promise<{ slug: string }> }  // 👈 Promise + await below
) {
  const { slug } = await params;
  const app = APPS_BY_SLUG[slug];
  if (!app) redirect("/");

  const h = await headers();
  const db = await getDb();
  await db.collection("click_events").insertOne({
    slug,
    ts: new Date(),
    ua: h.get("user-agent") || null,
    ref: h.get("referer") || null,
    ip: h.get("x-forwarded-for") || null,
  });

  redirect(app.url);
}
