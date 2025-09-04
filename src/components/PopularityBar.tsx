"use client";
import { useMemo } from "react";
export function PopularityBar({ value, max }: { value: number; max: number }) {
  const pct = useMemo(() => (max > 0 ? Math.round((value / max) * 100) : 0), [value, max]);
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1 text-xs text-white/60"><span>Clicks</span><span>{value}</span></div>
      <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background:"linear-gradient(90deg, rgba(56,189,248,0.9), rgba(168,85,247,0.95), rgba(244,63,94,0.95))" }} />
      </div>
    </div>
  );
}
