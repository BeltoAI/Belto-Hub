"use client";
import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { APPS } from "@/lib/apps";
import AppCard from "@/components/AppCard";
import { LucideIcon } from "@/components/icons";
import { BarChart3, Flame, Search, Users, GraduationCap } from "lucide-react";
import clsx from "clsx";

type StatsPayload = {
  totals: Record<string, number>;
  today: Record<string, number>;
  last14: Record<string, { date: string; count: number }[]>;
  lastUpdatedISO: string;
};
type View = "teachers" | "students";

function beacon(slug: string) {
  try {
    const blob = new Blob([JSON.stringify({ slug, ts: Date.now() })], { type: "application/json" });
    navigator.sendBeacon("/api/click", blob);
  } catch {}
}

export default function Home() {
  const [view, setView] = useState<View>("teachers");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"hot" | "alpha">("hot");
  const [stats, setStats] = useState<StatsPayload | null>(null);

  useEffect(() => {
    const run = async () => {
      const res = await fetch("/api/stats", { cache: "no-store" });
      const data = (await res.json()) as StatsPayload;
      setStats(data);
    };
    run();
    const id = setInterval(run, 15000);
    return () => clearInterval(id);
  }, []);

  const apps = useMemo(() => {
    const filtered = APPS
      .filter(a => a.category === view)
      .filter(a => a.title.toLowerCase().includes(q.toLowerCase()) || a.description.toLowerCase().includes(q.toLowerCase()));
    const withTotals = filtered.map(a => ({ a, t: stats?.totals[a.slug] ?? 0 }));
    if (sort === "hot") withTotals.sort((x,y)=> y.t - x.t || x.a.title.localeCompare(y.a.title));
    if (sort === "alpha") withTotals.sort((x,y)=> x.a.title.localeCompare(y.a.title));
    return withTotals.map(({a})=>a);
  }, [stats, q, sort, view]);

  const maxTotal = useMemo(()=>{
    if (!stats) return 0;
    let m = 0; for (const s of APPS) { m = Math.max(m, stats.totals[s.slug] ?? 0); }
    return m;
  }, [stats]);

  const topFive = useMemo(()=>{
    if (!stats) return [];
    return APPS.map(a => ({ slug: a.slug, title: a.title, total: stats.totals[a.slug] ?? 0, url: a.url }))
      .sort((x,y)=> y.total - x.total)
      .slice(0,5);
  }, [stats]);

  const tCount = APPS.filter(a=>a.category==="teachers").length;
  const sCount = APPS.filter(a=>a.category==="students").length;

  function StatCard({ icon, label, value }: { icon: any; label: string; value: string | number }) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_8px_40px_rgba(0,0,0,.35)] p-4 flex items-center gap-3">
        <div className="p-3 rounded-xl bg-white/10"><LucideIcon name={icon} className="w-5 h-5"/></div>
        <div>
          <div className="text-sm text-white/60">{label}</div>
          <div className="text-lg font-semibold">{value}</div>
        </div>
      </div>
    );
  }

  return (
    <main className="space-y-10">
      {/* HERO */}
      <header className="space-y-6">
        <div className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight">
          The <span className="gradient-text">Belto</span> Apps Hub
        </div>
        <p className="text-white/70 max-w-3xl">
          A fast, clean launcher for educators and students. Every click is tracked server-side and visualized live so you instantly see what’s hot.
        </p>
        <div className="grid sm:grid-cols-3 gap-4">
          <StatCard icon="Flame" label="Hottest app (total)" value={(topFive[0]?.title ?? "—")} />
          <StatCard icon="BarChart3" label="Total tracked clicks" value={Object.values(stats?.totals ?? {}).reduce((a,b)=>a+b,0)} />
          <StatCard icon="Clock" label="Last updated" value={stats?.lastUpdatedISO ? new Date(stats.lastUpdatedISO).toLocaleTimeString() : "—"} />
        </div>
      </header>

      {/* STICKY FILTER BAR */}
      <section className="sticky top-4 z-10">
        <div className="rounded-2xl border border-white/10 bg-[rgba(0,0,0,0.35)] backdrop-blur-xl p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={()=>setView("teachers")}
                className={clsx(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/10 hover:bg-white/15 transition",
                  view==="teachers" && "ring-2 ring-white/25"
                )}
                title={`Apps for teachers (${tCount})`}
              >
                <GraduationCap className="w-4 h-4" /> For Teachers ({tCount})
              </button>
              <button
                onClick={()=>setView("students")}
                className={clsx(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/10 hover:bg-white/15 transition",
                  view==="students" && "ring-2 ring-white/25"
                )}
                title={`Apps for students (${sCount})`}
              >
                <Users className="w-4 h-4" /> For Students ({sCount})
              </button>
            </div>

            <div className="flex gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-white/50"/>
                <input
                  value={q} onChange={e=>setQ(e.target.value)} placeholder="Search apps…"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-9 py-2 outline-none focus:ring-2 ring-white/20 sm:w-64"
                />
              </div>
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>setSort(e.target.value as "hot"|"alpha")}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 pr-10 outline-none focus:ring-2 ring-white/20"
                >
                  <option value="hot">Sort by hottest</option>
                  <option value="alpha">Sort A→Z</option>
                </select>
                <BarChart3 className="w-4 h-4 absolute right-3 top-2.5 text-white/50"/>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GRID */}
      <section className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {apps.map(a => {
          const total = stats?.totals[a.slug] ?? 0;
          const today = stats?.today[a.slug] ?? 0;
          const series = stats?.last14[a.slug] ?? [];
          return (
<a href={`/go/${a.slug}`}>
            <AppCard
              key={a.slug}
              slug={a.slug}
              title={a.title}
              description={a.description}
              icon={a.icon as any}
              stat={{ total, today, series }}
              maxTotal={maxTotal}
              url={a.url}
            />
</a>
          );
        })}
        {apps.length === 0 && (
          <div className="col-span-full text-white/70 text-sm">
            Nothing here yet. Try a different view or clear the search.
          </div>
        )}
      </section>

      {/* LEADERBOARD */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-white/80" />
          <h2 className="text-xl font-semibold">Most clicked</h2>
        </div>
        <div className="grid md:grid-cols-5 sm:grid-cols-3 grid-cols-1 gap-4">
          {topFive.map((x,i)=>(
            <a
              key={x.slug}
              href={x.url}
              onClick={()=>beacon(x.slug)}
              target="_blank" rel="noopener noreferrer"
              className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_8px_40px_rgba(0,0,0,.35)] p-4 hover:bg-white/10 transition"
            >
              <div className="text-sm text-white/60">#{i+1}</div>
              <div className="font-semibold">{x.title}</div>
              <div className="text-sm text-white/60 mt-1">{x.total} total clicks</div>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
