"use client";

import * as React from "react";
import type { StatMap } from "@/lib/stats";
import { APPS } from "@/lib/apps";
import { LucideIcon } from "@/components/icons";
import { motion, AnimatePresence } from "framer-motion";

type Audience = "educators" | "students";
type AppItem = (typeof APPS)[number] & { audience?: Audience };

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};
const card = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 320, damping: 22, mass: 0.6 },
  },
};

// Optional explicit overrides if you want to force a lane for a slug:
const AUDIENCE_BY_SLUG: Record<string, Audience> = {
  // "exam-generator": "educators",
  // "flashcards": "students",
};

// Heuristic if no audience is provided on the app object:
function inferAudience(a: AppItem): Audience {
  if (a.audience) return a.audience;
  const hay = `${a.slug} ${a.title} ${a.description ?? ""}`.toLowerCase();
  const eduHits = /(teacher|educator|classroom|lesson|lecture|syllabus|curriculum|worksheet|assignment|grade|rubric|exam|quiz)/.test(hay);
  const stuHits = /(student|study|flashcard|notes?|notebook|planner|resume|gpa|practice|solver|homework)/.test(hay);
  if (AUDIENCE_BY_SLUG[a.slug]) return AUDIENCE_BY_SLUG[a.slug];
  if (eduHits && !stuHits) return "educators";
  if (stuHits && !eduHits) return "students";
  // Tie-breaker: tools with “exam/grade/lesson” lean educators; else students
  if (/(exam|grade|lesson|teacher)/.test(hay)) return "educators";
  return "students";
}

export default function HomeClient({
  initialStats,
  apps,
}: {
  initialStats: StatMap;
  apps?: AppItem[];
}) {
  const items = (apps ?? APPS) as AppItem[];
  const [stats, setStats] = React.useState<StatMap>(initialStats);
  const [q, setQ] = React.useState("");
  const [sort, setSort] = React.useState<"hot" | "alpha">("hot");
  const [lane, setLane] = React.useState<Audience>("educators"); // default lane
  const [cursor, setCursor] = React.useState({ x: 0, y: 0 });

  React.useEffect(() => setStats(initialStats), [initialStats]);

  // Spotlight cursor glow
  const glowStyle = { "--x": `${cursor.x}px`, "--y": `${cursor.y}px` } as React.CSSProperties;

  // Search + sort, then split into lanes
  const { educators, students } = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = items.filter((a) =>
      needle
        ? (a.title + " " + (a.description ?? "") + " " + a.slug).toLowerCase().includes(needle)
        : true
    );

    // sort across all, we’ll split after
    if (sort === "hot") {
      list = list.sort((a, b) => {
        const sa = stats[a.slug] ?? { today: 0, total: 0 };
        const sb = stats[b.slug] ?? { today: 0, total: 0 };
        if (sb.today !== sa.today) return sb.today - sa.today;
        return (sb.total ?? 0) - (sa.total ?? 0);
      });
    } else {
      list = list.sort((a, b) => a.title.localeCompare(b.title));
    }

    const educators: AppItem[] = [];
    const students: AppItem[] = [];
    for (const a of list) (inferAudience(a) === "educators" ? educators : students).push(a);
    return { educators, students };
  }, [items, q, sort, stats]);

  const active = lane === "educators" ? educators : students;

  return (
    <main
      className="relative mx-auto max-w-7xl p-6"
      onMouseMove={(e) => {
        const el = e.currentTarget.getBoundingClientRect();
        setCursor({ x: e.clientX - el.left, y: e.clientY - el.top });
      }}
    >
      {/* Spotlight cursor glow */}
      <div className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300" style={glowStyle}>
        <div className="absolute inset-0 [background:radial-gradient(600px_at_var(--x)_var(--y),rgba(120,119,198,0.16),transparent_60%)]" />
      </div>

      {/* Hero / Header */}
      <section className="relative z-10 mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-3 py-1 text-xs text-zinc-300 backdrop-blur">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          Live
          <span className="text-zinc-500">·</span>
          Premium Tools
        </div>

        <h1 className="mt-3 text-4xl sm:text-5xl font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-400">
          Belto Hub
        </h1>
        <p className="mt-2 text-sm text-zinc-400 max-w-2xl">
          Explore curated AI tools for the classroom and beyond. Click to launch — server logs every click.
        </p>

        {/* Segmented control + search + sort */}
        <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center">
          {/* segmented */}
          <div className="flex w-full lg:w-auto items-center gap-1 rounded-2xl border border-white/10 bg-white/[0.03] p-1">
            <button
              onClick={() => setLane("educators")}
              className={`px-4 py-2 text-sm rounded-xl transition ${
                lane === "educators" ? "bg-white/10 text-zinc-100" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              For Educators <span className="ml-1 text-xs text-zinc-400">({educators.length})</span>
            </button>
            <button
              onClick={() => setLane("students")}
              className={`px-4 py-2 text-sm rounded-xl transition ${
                lane === "students" ? "bg-white/10 text-zinc-100" : "text-zinc-400 hover:text-zinc-2 00"
              }`}
            >
              For Students <span className="ml-1 text-xs text-zinc-400">({students.length})</span>
            </button>
          </div>

          {/* search */}
          <div className="relative w-full lg:max-w-md">
            <LucideIcon
              name="Search"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400"
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={`Search ${lane === "educators" ? "educator" : "student"} tools…`}
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pl-9 pr-3 text-sm text-zinc-200 placeholder:text-zinc-500 shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>

          {/* sort */}
          <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
            <button
              onClick={() => setSort("hot")}
              className={`px-3 py-1.5 text-xs rounded-lg transition ${
                sort === "hot" ? "bg-white/10 text-zinc-100" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Hot
            </button>
            <button
              onClick={() => setSort("alpha")}
              className={`px-3 py-1.5 text-xs rounded-lg transition ${
                sort === "alpha" ? "bg-white/10 text-zinc-100" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              A–Z
            </button>
          </div>
        </div>
      </section>

      {/* Section label */}
      <div className="relative z-10 mb-3 flex items-center gap-2 text-xs text-zinc-400">
        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2 py-1">
          <LucideIcon name={lane === "educators" ? "GraduationCap" : "Users"} className="h-3.5 w-3.5" />
          {lane === "educators" ? "For Educators" : "For Students"}
        </span>
        <span className="opacity-60">·</span>
        <span>{active.length} {active.length === 1 ? "tool" : "tools"}</span>
      </div>

      {/* Grid */}
      <AnimatePresence initial={false} mode="popLayout">
        <motion.div
          key={lane} /* re-stagger when switching lanes */
          variants={container}
          initial="hidden"
          animate="show"
          className="relative z-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {active.map((a) => {
            const s = stats[a.slug] ?? { total: 0, today: 0, series: [] };
            const trending = (s.today ?? 0) >= 3;

            return (
              <motion.a
                key={a.slug}
                variants={card}
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.99 }}
                href={`/go/${a.slug}`}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-900/80 to-zinc-950/80 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
              >
                {/* Moving gradient border */}
                <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-60 group-hover:opacity-100 transition">
                  <div className="absolute inset-0 rounded-2xl [mask:linear-gradient(#000,transparent_30%)] bg-gradient-to-r from-indigo-500/40 via-fuchsia-500/40 to-cyan-500/40 blur-md" />
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10" />
                </div>

                {/* Shine sweep */}
                <div className="pointer-events-none absolute -inset-6 rotate-12 opacity-0 group-hover:opacity-100 [animation:card-shine_1.1s_linear] bg-gradient-to-r from-transparent via-white/15 to-transparent" />

                {/* Top row */}
                <div className="relative z-10 flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10 shadow-inner">
                    <LucideIcon
                      name={a.icon}
                      className="h-5 w-5 text-zinc-100 transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-medium leading-tight text-zinc-100 truncate">{a.title}</h3>
                    <p className="mt-1 text-sm text-zinc-400 line-clamp-2">{a.description}</p>
                  </div>

                  {trending && (
                    <motion.span
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="ml-auto inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-1 text-[10px] font-medium text-amber-300 ring-1 ring-amber-400/20"
                    >
                      <LucideIcon name="Flame" className="h-3.5 w-3.5" />
                      Trending
                    </motion.span>
                  )}
                </div>

                {/* Footer stats */}
                <div className="relative z-10 mt-4 flex items-center justify-between text-[11px] text-zinc-400">
                  <div className="inline-flex items-center gap-2">
                    <span className="rounded-md bg-white/5 px-2 py-1 ring-1 ring-white/10 text-zinc-300">
                      Today <span className="text-zinc-100">{s.today}</span>
                    </span>
                    <span className="rounded-md bg-white/5 px-2 py-1 ring-1 ring-white/10">
                      Total <span className="text-zinc-100">{s.total}</span>
                    </span>
                  </div>
                  <span className="opacity-70">Open</span>
                </div>
              </motion.a>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
