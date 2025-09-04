"use client";
import * as React from "react";
import { LucideIcon } from "./icons";
import type { LucideKeys } from "./icons";
import { PopularityBar } from "./PopularityBar";
import SparkLine from "./SparkLine";

type Stat = { total: number; today: number; series: { date: string; count: number }[]; };

function heatRing(total: number, max: number) {
  const t = max > 0 ? total / max : 0;
  const hue = 210 - Math.round(210 * t);
  return `shadow-[0_0_0_3px_hsl(${hue}_90%_55%_/_0.45)]`;
}

export default function AppCard({
  slug, title, description, icon, stat, maxTotal, url
}: {
  slug: string; title: string; description: string; icon: LucideKeys; stat: Stat; maxTotal: number; url: string;
}) {
  const onClick = React.useCallback(() => {
    try {
      const blob = new Blob([JSON.stringify({ slug, ts: Date.now() })], { type: "application/json" });
      navigator.sendBeacon("/api/click", blob);
    } catch {}
  }, [slug]);

  return (
    <a
      href={url}
      onClick={onClick}
      target="_blank" rel="noopener noreferrer"
      className="group relative block rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.06)] backdrop-blur-xl 
                 shadow-[0_12px_40px_rgba(0,0,0,.35)] hover:shadow-[0_18px_70px_rgba(0,0,0,.55)]
                 transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 ring-white/30"
    >
      {stat.today > 0 && (
        <div className="absolute right-3 top-3 select-none rounded-full px-2 py-0.5 text-xs font-semibold
                        border border-white/15 bg-white/15 text-white/90">
          +{stat.today} today
        </div>
      )}

      <div className="p-5 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className={`rounded-2xl p-3 bg-white/10 ${heatRing(stat.total, maxTotal)}`}>
            <LucideIcon name={icon} className="w-7 h-7" />
          </div>
          <div className="min-w-0">
            <div className="text-lg font-bold tracking-tight">{title}</div>
            <div className="text-xs text-white/55">Belto app • Verified</div>
            <div className="text-sm text-white/70 mt-1 line-clamp-2">{description}</div>
          </div>
        </div>

        <SparkLine data={stat.series} />
        <PopularityBar value={stat.total} max={maxTotal} />

        <div className="flex items-center justify-between pt-1">
          <div className="text-xs text-white/60">Total clicks: <span className="font-semibold text-white/80">{stat.total}</span></div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/10 group-hover:bg-white/15 transition text-sm">
            Launch
          </div>
        </div>
      </div>
    </a>
  );
}
