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

  React.useEffect(() => setStats(initialStats), [initialStats]);

  return (
    <main className="mx-auto max-w-6xl p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Belto Hub</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Click a tool to launch. Server logs the click; stats show Today &amp; Total.
        </p>
      </header>

      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((a) => {
          const s = stats[a.slug] ?? { total: 0, today: 0, series: [] };
          return (
            <a
              key={a.slug}
              href={`/go/${a.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900 to-zinc-950 p-5 transition-all hover:-translate-y-0.5 hover:shadow-2xl"
            >
              {/* subtle glow on hover */}
              <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300 [background:radial-gradient(40rem_40rem_at_50%_-20%,rgba(255,255,255,0.08),transparent_60%)]" />
              {/* inner ring */}
              <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10 group-hover:ring-white/20 transition" />

              <div className="relative z-10 flex items-center gap-3">
                <LucideIcon
                  name={a.icon}
                  className="h-5 w-5 flex-none translate-y-px transition-transform duration-300 group-hover:scale-110"
                />
                <div className="min-w-0">
                  <div className="font-medium truncate">{a.title}</div>
                  <p className="text-sm text-zinc-400 mt-1 line-clamp-2">
                    {a.description}
                  </p>
                </div>
              </div>

              <div className="relative z-10 mt-4 flex items-center justify-between text-xs text-zinc-400">
                <span className="font-medium">
                  Today: <span className="text-zinc-200">{s.today}</span>
                </span>
                <span className="font-medium">
                  Total: <span className="text-zinc-200">{s.total}</span>
                </span>
              </div>
            </a>
          );
        })}
      </div>
    </main>
  );
}
