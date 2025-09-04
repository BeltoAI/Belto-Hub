"use client";
import * as React from "react";
import * as Lucide from "lucide-react";

type LucideKeys = keyof typeof Lucide;
type IconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;

export function LucideIcon({ name, className }: { name: LucideKeys; className?: string }) {
  const Ico = (Lucide as Record<LucideKeys, IconComponent>)[name] ?? (Lucide.Square as IconComponent);
  return <Ico className={className} />;
}
