"use client";
import * as React from "react";
import * as Lucide from "lucide-react";
export function LucideIcon({ name, className }: { name: string; className?: string }) {
  const Ico = (Lucide as any)[name] as React.ComponentType<any>;
  if (!Ico) return <Lucide.Square className={className} />;
  return <Ico className={className} />;
}
