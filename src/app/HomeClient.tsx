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
  const [stats, setStats] = React.useState<StatMap>(initialStats);

  // keep state synced with server-provided stats (no client fetches)
  React.useEffect(() => {
    setStats(initialStats);
  }, [initialStats]);

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="text-2xl font-semibold mb-6">Belto Hub</h1>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((a) => {
          const s = stats[a.slug] ?? { total: 0, today: 0, series: [] };
          return (
            <a
              key={a.slug}
              href={`/go/${a.slug}`}
              className="block rounded-xl border p-4 hover:shadow transition"
            >
              <div className="flex items-center gap-3">
                <LucideIcon name={a.icon} className="h-5 w-5" />
                <div className="font-medium">{a.title}</div>
              </div>
              <p className="text-sm text-gray-500 mt-2">{a.description}</p>
              <div className="text-xs mt-3">
                Today: {s.today} • Total: {s.total}
              </div>
            </a>
          );
        })}
      </div>
    </main>
  );
}
