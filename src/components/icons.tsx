"use client";
import * as React from "react";
import * as Lucide from "lucide-react";
import type { LucideProps } from "lucide-react";

export type LucideKeys = (keyof typeof Lucide) & string;

export function LucideIcon({ name, className }: { name: LucideKeys; className?: string }) {
  const Comp = (Lucide as Record<string, unknown>)[name] as React.ComponentType<LucideProps> | undefined;
  const Fallback = Lucide.Square as React.ComponentType<LucideProps>;
  const Ico = Comp ?? Fallback;
  return <Ico className={className} />;
}
