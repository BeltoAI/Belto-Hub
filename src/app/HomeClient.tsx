"use client";
import * as React from "react";
import type { StatMap } from "@/lib/stats";
import { APPS } from "@/lib/apps";
import { LucideIcon } from "@/components/icons";

type AppItem = (typeof APPS)[number];

export default function HomeClient({
  initialStats,
  apps,
}: {
  initialStats: StatMap;
  apps?: AppItem[];
}) {
  const items = apps ?? APPS;

  // Pin any attendance-like tools to Educators only
  const PINNED_EDU = new Set(
    items
      .filter(
        (a) =>
          /attend/i.test(a.slug) ||
          /attend/i.test(a.title ?? "") ||
          /attendance/i.test(a.description ?? "")
      )
      .map((a) => a.slug)
  );

  // Grouping logic
  const educatorItems = items.filter(
    (a) =>
      PINNED_EDU.has(a.slug) ||
      a.tags?.includes("educator") ||
      (a as any).audience === "educator" ||
      (a as any).segment === "educator" ||
      (a as any).role === "educator" ||
      (a as any).group === "educator"
  );

  // Students = everything NOT already in educatorItems
  const eduSet = new Set(educatorItems.map((x) => x.slug));
  const studentItems = items.filter((a) => !eduSet.has(a.slug));

  const [stats, setStats] = React.useState<StatMap>(initialStats);
  React.useEffect(() => {
    setStats(initialStats);
  }, [initialStats]);

  const Section: React.FC<{ title: string; list: AppItem[] }> = ({ title, list }) => (
    <section className="mb-10">
      <div className="flex items-end justify-between mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <span className="text-sm text-gray-500">{list.length} tools</span>
      </div>

      {list.length === 0 ? (
        <div className="text-sm text-gray-500">No tools yet.</div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((a) => {
            const s = stats[a.slug] ?? { total: 0, today: 0, series: [] };
            return (
              <a
                key={a.slug}
                href={`/go/${a.slug}`}
                className="group block rounded-2xl border p-5 hover:shadow-lg transition hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-3">
                  <LucideIcon name={a.icon} className="h-5 w-5 opacity-80 group-hover:opacity-100 transition" />
                  <div className="font-medium">{a.title}</div>
                </div>
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{a.description}</p>
                <div className="text-xs mt-3 opacity-70 group-hover:opacity-100 transition">
                  Today: {s.today} • Total: {s.total}
                </div>
              </a>
            );
          })}
        </div>
      )}
    </section>
  );

  return (
    <main className="mx-auto max-w-6xl p-6">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold">Belto EdStore</h1>
        <p className="text-sm text-gray-500">Premium AI tools for teachers & students.</p>
      </header>

      <Section title="For Educators" list={educatorItems} />
      <Section title="For Students" list={studentItems} />
    </main>
  );
}
