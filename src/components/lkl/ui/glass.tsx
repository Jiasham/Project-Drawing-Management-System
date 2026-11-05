"use client";
import { cn } from "@/lib/utils";

export function GlassCard({ children, className, tickCorners = false }: { children: React.ReactNode; className?: string; tickCorners?: boolean }) {
  return <div className={cn("lkl-card p-4 sm:p-5", tickCorners && "lkl-tick-corners", className)}>{children}</div>;
}

export function SectionHeader({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-3 mb-3">
      <div>{eyebrow && <div className="lkl-eyebrow mb-1">{eyebrow}</div>}<h2 className="text-lg font-semibold text-slate-900 tracking-tight">{title}</h2></div>
      {action}
    </div>
  );
}

export function StatTile({ label, value, sublabel, accent = "cyan", icon }: { label: string; value: React.ReactNode; sublabel?: string; accent?: "cyan" | "amber" | "green" | "blue" | "red"; icon?: React.ReactNode }) {
  const color = accent === "cyan" ? "text-blue-600" : accent === "amber" ? "text-amber-600" : accent === "green" ? "text-emerald-600" : accent === "blue" ? "text-blue-700" : accent === "red" ? "text-red-600" : "text-blue-600";
  return (
    <GlassCard tickCorners className="relative">
      <div className="flex items-start justify-between"><div className="lkl-eyebrow">{label}</div>{icon && <div className={color}>{icon}</div>}</div>
      <div className={cn("lkl-stat-number text-3xl sm:text-4xl mt-2", color)}>{value}</div>
      {sublabel && <div className="text-[11px] text-slate-500 mt-1 lkl-mono uppercase tracking-wider">{sublabel}</div>}
    </GlassCard>
  );
}
