"use client";
import { cn } from "@/lib/utils";
import { tStatus, type Lang } from "@/lib/i18n";

export function StatusChip({ status, lang, size = "sm" }: { status: string; lang: Lang; size?: "sm" | "md" }) {
  const cls = status === "Draft" ? "lkl-chip-draft" : status === "For Review" ? "lkl-chip-forreview" : status === "Submission" ? "lkl-chip-submission" : status === "Tender" ? "lkl-chip-tender" : status === "Construction" ? "lkl-chip-construction" : status === "As-Built" ? "lkl-chip-asbuilt" : status === "Approved" ? "lkl-chip-approved" : status === "Released" ? "lkl-chip-released" : status === "Obsolete" ? "lkl-chip-obsolete" : "lkl-chip-draft";
  return <span className={cn("lkl-chip", cls, size === "md" && "text-xs px-2 py-0.5")}>{tStatus(status, lang)}</span>;
}

export function CategoryTag({ category, lang }: { category: string; lang: Lang }) {
  return <span className="lkl-mono text-[11px] px-2 py-0.5 rounded border border-slate-300 bg-slate-100 text-slate-700">{category}</span>;
}

export function VersionBadge({ version }: { version: string }) {
  return <span className="lkl-mono text-[11px] font-semibold px-1.5 py-0.5 rounded border border-blue-600/30 bg-blue-50 text-blue-700">V{version}</span>;
}

export function FileIcon({ type }: { type: string }) {
  const cls = type === "dwg" ? "border-blue-600/40 bg-blue-50 text-blue-700" : type === "pdf" ? "border-red-600/40 bg-red-50 text-red-700" : type === "step" ? "border-amber-600/40 bg-amber-50 text-amber-700" : type === "stl" ? "border-fuchsia-600/40 bg-fuchsia-50 text-fuchsia-700" : "border-slate-600/40 bg-slate-100 text-slate-700";
  return <span className={cn("lkl-mono text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase", cls)}>{type}</span>;
}
