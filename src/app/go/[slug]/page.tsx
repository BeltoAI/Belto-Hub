import { headers } from "next/headers";
import { redirect } from "next/navigation";
import * as Mongo from "@/lib/mongo";
import { APPS } from "@/lib/apps";
import GoClient from "./GoClient";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const APPS_BY_SLUG = Object.fromEntries(APPS.map(a => [a.slug, a])) as Record<string, { url: string }>;

async function getDb() {
  return "getDb" in (Mongo as any) ? await (Mongo as any).getDb() : await (Mongo as any).db();
}

export default async function GoPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const app = APPS_BY_SLUG[slug];
  if (!app) return redirect("/");

  try {
    const h = headers();
    const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
    const ua = h.get("user-agent") ?? "";
    const database = await getDb();
    await database.collection("clicks").insertOne({ slug, ip, ua, ts: new Date() });
  } catch (e) {
    console.error("click write failed", e);
  }

  return <GoClient slug={slug} url={app.url} />;
}
