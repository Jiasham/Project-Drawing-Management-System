"use client";
import { useEffect, useState } from "react";
import { useLkl, ROLES, type Role } from "@/lib/store";
import { t } from "@/lib/i18n";
import { GlassCard, SectionHeader, StatTile } from "../ui/glass";
import { StatusChip, VersionBadge } from "../ui/badges";
import { timeAgo } from "../ui/time";
import {
  Building2, Ruler, Wrench, Calculator, ClipboardCheck, Megaphone,
  CheckCircle2, AlertTriangle, ArrowRight, ArrowDown, ArrowLeft,
  FileCheck, RotateCcw, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Step = {
  step: number;
  key: string;
  department: { en: string; bm: string };
  description: { en: string; bm: string };
  approvers: { en: string; bm: string };
  icon: string;
};

type DrawingSignOffState = {
  currentStep: number;
  isIssued: boolean;
  progress: number;
  steps: (Step & { status: "approved" | "inReview" | "pending"; approvedBy: string | null; approvedDate: string | null })[];
};

type DrawingWithSignOff = {
  id: string;
  number: string;
  title: string;
  titleBm: string;
  category: string;
  status: string;
  version: string;
  updatedAt: string;
  signOff: DrawingSignOffState;
};

const STEP_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  building: Building2,
  ruler: Ruler,
  wrench: Wrench,
  calculator: Calculator,
  clipboard: ClipboardCheck,
  megaphone: Megaphone,
};

const STATUS_STYLES = {
  approved: { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-300", icon: CheckCircle2, label: "signoff.status.approved" },
  inReview: { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-300", icon: AlertTriangle, label: "signoff.status.inReview" },
  pending: { color: "text-slate-400", bg: "bg-slate-50", border: "border-slate-200", icon: null, label: "signoff.status.pending" },
};

export function SignOffFlow() {
  const { lang, openDrawing, role } = useLkl();
  const currentRole = ROLES.find((r) => r.id === role);
  const isSuperAdmin = role === "superadmin";
  const [data, setData] = useState<{ steps: Step[]; summary: any; drawings: DrawingWithSignOff[] } | null>(null);
  const [selectedId, setSelectedId] = useState<string>("");
  const [selectedState, setSelectedState] = useState<DrawingSignOffState | null>(null);
  const [selectedDrawing, setSelectedDrawing] = useState<DrawingWithSignOff | null>(null);

  useEffect(() => {
    fetch("/api/sign-off")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        if (d.drawings.length > 0) {
          setSelectedId(d.drawings[0].id);
          setSelectedDrawing(d.drawings[0]);
          setSelectedState(d.drawings[0].signOff);
        }
      })
      .catch(console.error);
  }, []);

  function selectDrawing(id: string) {
    const drawing = data?.drawings.find((d) => d.id === id);
    if (!drawing) return;
    setSelectedId(id);
    setSelectedDrawing(drawing);
    setSelectedState(drawing.signOff);
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <div className="h-12 lkl-card animate-pulse" />
        <div className="h-64 lkl-card animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <div className="lkl-eyebrow mb-1">NCT GROUP · RECOMMENDED WORKFLOW</div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{t("signoff.title", lang)}</h1>
        <p className="text-xs text-slate-500 mt-1 max-w-3xl">{t("signoff.subtitle", lang)}</p>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile label={lang === "bm" ? "Jumlah Lukisan" : "Total Drawings"} value={data.summary.total} accent="blue" icon={<FileCheck className="w-5 h-5" />} />
        <StatTile label={t("signoff.final", lang)} value={data.summary.issued} sublabel={lang === "bm" ? "Dikeluarkan" : "Issued"} accent="green" icon={<CheckCircle2 className="w-5 h-5" />} />
        <StatTile label={lang === "bm" ? "Sedang Berjalan" : "In Progress"} value={data.summary.inProgress} sublabel={lang === "bm" ? "Dalam aliran" : "In flow"} accent="amber" icon={<AlertTriangle className="w-5 h-5" />} />
        <StatTile label={t("signoff.status.notStarted", lang)} value={data.summary.notStarted} sublabel={lang === "bm" ? "Langkah 1" : "Step 1"} accent="cyan" icon={<RotateCcw className="w-5 h-5" />} />
      </div>

      {/* Flow diagram */}
      <GlassCard tickCorners>
        <SectionHeader eyebrow="6-STEP SERPENTINE FLOW" title="How drawings move through the system" />
        <FlowDiagram steps={data.steps} currentStep={selectedState?.currentStep ?? 0} isIssued={selectedState?.isIssued ?? false} lang={lang} />
      </GlassCard>

      {/* Gate rule */}
      <div className="lkl-card p-4 border-amber-300 bg-amber-50">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-400 grid place-items-center shrink-0">
            <AlertTriangle className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="lkl-eyebrow text-amber-700 mb-1">{t("signoff.gateRule", lang)}</div>
            <p className="text-sm text-amber-800 leading-relaxed">{t("signoff.gateRule.desc", lang)}</p>
          </div>
        </div>
      </div>

      {/* Role-based filter banner */}
      {!isSuperAdmin && currentRole?.step && (
        <div className={cn("lkl-card p-3 border-2 flex items-center gap-3", "border-blue-300 bg-blue-50")}>
          <div className={cn("w-10 h-10 rounded-full bg-gradient-to-br text-white grid place-items-center text-sm font-bold shrink-0", currentRole.color)}>
            {currentRole.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-slate-900">
              {lang === "bm" ? `Anda log masuk sebagai: ${currentRole.labelBm}` : `You are signed in as: ${currentRole.label}`}
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {lang === "bm"
                ? `Anda boleh menyemak dan meluluskan lukisan di Langkah ${currentRole.step}. Lukisan yang menunggu tindakan anda ditunjukkan di bawah.`
                : `You can review and approve drawings at Step ${currentRole.step}. Drawings awaiting your action are highlighted below.`}
            </p>
          </div>
        </div>
      )}
      {isSuperAdmin && (
        <div className="lkl-card p-3 border-2 border-slate-300 bg-slate-50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-white grid place-items-center text-sm font-bold shrink-0">DC</div>
          <div className="flex-1">
            <div className="text-sm font-bold text-slate-900">
              {lang === "bm" ? "Mod Pentadbir Utama — akses penuh kepada semua lukisan dan langkah" : "Super Admin mode — full access to all drawings and steps"}
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {lang === "bm" ? "Anda boleh memajukan, menolak, atau mengeluarkan mana-mana lukisan pada bila-bila masa." : "You can advance, reject, or issue any drawing at any time."}
            </p>
          </div>
        </div>
      )}

      {/* Drawing selector + sign-off detail */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Drawing list */}
        <GlassCard className="lg:col-span-1 !p-0 overflow-hidden">
          <div className="p-4 pb-2">
            <SectionHeader eyebrow={t("signoff.selectDrawing", lang)} title={`${data.drawings.length} drawings`} />
          </div>
          <div className="overflow-y-auto max-h-[600px] divide-y divide-slate-100">
            {data.drawings.map((d) => {
              // Highlight drawings that are at the current role's step
              const isAtMyStep = !isSuperAdmin && currentRole?.step === d.signOff.currentStep && !d.signOff.isIssued;
              return (
              <button
                key={d.id}
                onClick={() => selectDrawing(d.id)}
                className={cn(
                  "w-full text-left p-3 border-l-2 transition relative",
                  selectedId === d.id ? "bg-blue-50 border-blue-600" : isAtMyStep ? "bg-amber-50 border-amber-400" : "border-transparent hover:bg-slate-50",
                )}
              >
                {isAtMyStep && (
                  <span className="absolute top-2 right-2 lkl-mono text-[8px] px-1 py-0.5 rounded bg-amber-400 text-white font-bold uppercase">● YOUR ACTION</span>
                )}
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className="lkl-mono text-[10px] text-blue-700 truncate">{d.number}</span>
                  <span className={cn("lkl-mono text-[10px] font-bold", d.signOff.isIssued ? "text-emerald-600" : "text-amber-600")}>
                    {d.signOff.isIssued ? "100%" : `${d.signOff.progress}%`}
                  </span>
                </div>
                <div className="text-xs text-slate-700 truncate">{lang === "bm" ? d.titleBm : d.title}</div>
                {/* Mini progress bar */}
                <div className="mt-1.5 h-1 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", d.signOff.isIssued ? "bg-emerald-500" : "bg-gradient-to-r from-blue-500 to-amber-400")}
                    style={{ width: `${Math.max(d.signOff.progress, 5)}%` }}
                  />
                </div>
              </button>
              );
            })}
          </div>
        </GlassCard>

        {/* Selected drawing sign-off detail */}
        <div className="lg:col-span-3 space-y-4">
          {selectedDrawing && selectedState && (
            <>
              {/* Drawing header */}
              <GlassCard>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="lkl-mono text-sm text-blue-700">{selectedDrawing.number}</span>
                      <VersionBadge version={selectedDrawing.version} />
                      <StatusChip status={selectedDrawing.status} lang={lang} />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{lang === "bm" ? selectedDrawing.titleBm : selectedDrawing.title}</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="lkl-eyebrow">{t("signoff.progress", lang)}</div>
                      <div className={cn("lkl-stat-number text-2xl", selectedState.isIssued ? "text-emerald-600" : "text-blue-600")}>{selectedState.progress}%</div>
                    </div>
                    <button onClick={() => openDrawing(selectedDrawing.id, selectedDrawing.number)} className="lkl-btn lkl-btn-ghost text-xs">
                      Open detail <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                {/* Overall progress bar */}
                <div className="mt-3 h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", selectedState.isIssued ? "bg-emerald-500" : "bg-gradient-to-r from-blue-500 via-amber-400 to-emerald-400")}
                    style={{ width: `${Math.max(selectedState.progress, 3)}%` }}
                  />
                </div>
              </GlassCard>

              {/* Step-by-step sign-off list */}
              <GlassCard className="!p-0 overflow-hidden">
                <div className="p-4 pb-2">
                  <SectionHeader
                    eyebrow={t("signoff.currentStep", lang)}
                    title={selectedState.isIssued ? t("signoff.final", lang) : `${lang === "bm" ? "Langkah" : "Step"} ${selectedState.currentStep}`}
                  />
                </div>
                <div className="divide-y divide-slate-100">
                  {selectedState.steps.map((s, i) => {
                    const Icon = STEP_ICONS[s.icon] ?? Building2;
                    const style = STATUS_STYLES[s.status];
                    const StatusIcon = style.icon;
                    return (
                      <div key={s.step} className={cn("p-4 flex items-start gap-3 transition", s.status === "inReview" && "bg-amber-50/40")}>
                        {/* Step number / status icon */}
                        <div className={cn("shrink-0 w-10 h-10 rounded-full grid place-items-center border-2", style.border, style.bg)}>
                          {s.status === "approved" ? (
                            <CheckCircle2 className={cn("w-5 h-5", style.color)} />
                          ) : s.status === "inReview" ? (
                            <span className={cn("lkl-mono text-sm font-bold", style.color)}>{s.step}</span>
                          ) : (
                            <span className="lkl-mono text-sm font-bold text-slate-400">{s.step}</span>
                          )}
                        </div>
                        {/* Step content */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <Icon className={cn("w-4 h-4", style.color)} />
                            <span className={cn("text-sm font-bold", s.status === "pending" ? "text-slate-500" : "text-slate-900")}>
                              {lang === "bm" ? s.department.bm : s.department.en}
                            </span>
                            {/* Status chip */}
                            <span className={cn("lkl-mono text-[10px] px-1.5 py-0.5 rounded border font-semibold uppercase", style.border, style.bg, style.color)}>
                              {t(style.label, lang)}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed">{lang === "bm" ? s.description.bm : s.description.en}</p>
                          {/* Approvers */}
                          <div className="mt-1.5 text-[11px] text-slate-600">
                            <span className="lkl-mono text-slate-400 uppercase tracking-wider">{lang === "bm" ? "Pelulus" : "Approvers"}: </span>
                            {lang === "bm" ? s.approvers.bm : s.approvers.en}
                          </div>
                          {/* Approved date */}
                          {s.status === "approved" && s.approvedDate && (
                            <div className="mt-0.5 text-[10px] text-emerald-600 lkl-mono">
                              ✓ {s.approvedDate}
                            </div>
                          )}
                        </div>
                        {/* Action button for current step — only shown if this is the user's role's step or superadmin */}
                        {s.status === "inReview" && (isSuperAdmin || currentRole?.step === s.step) && (
                          <div className="shrink-0 flex flex-col gap-1.5">
                            <button className="lkl-btn lkl-btn-primary !py-1 !px-2.5 text-xs">
                              <CheckCircle2 className="w-3 h-3" />
                              {t("signoff.advance", lang)}
                            </button>
                            <button className="lkl-btn lkl-btn-ghost !py-1 !px-2.5 text-xs text-red-600 hover:!border-red-400 hover:!bg-red-50">
                              <RotateCcw className="w-3 h-3" />
                              {t("signoff.reject", lang)}
                            </button>
                          </div>
                        )}
                        {/* Read-only indicator for non-matching roles */}
                        {s.status === "inReview" && !isSuperAdmin && currentRole?.step !== s.step && (
                          <div className="shrink-0 lkl-mono text-[10px] text-slate-400 uppercase tracking-wider px-2">
                            {lang === "bm" ? "Menunggu" : "Awaiting"}<br/>{lang === "bm" ? s.department.bm : s.department.en}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {/* Final issue bar */}
                <div className={cn("p-4 border-t-2 flex items-center gap-3", selectedState.isIssued ? "bg-emerald-50 border-emerald-300" : "bg-slate-50 border-slate-200")}>
                  <div className={cn("shrink-0 w-10 h-10 rounded-full grid place-items-center border-2", selectedState.isIssued ? "border-emerald-400 bg-emerald-100" : "border-slate-300 bg-white")}>
                    <FileCheck className={cn("w-5 h-5", selectedState.isIssued ? "text-emerald-600" : "text-slate-400")} />
                  </div>
                  <div className="flex-1">
                    <div className={cn("text-sm font-bold", selectedState.isIssued ? "text-emerald-700" : "text-slate-500")}>{t("signoff.final", lang)}</div>
                    <p className="text-xs text-slate-500">{t("signoff.final.desc", lang)}</p>
                  </div>
                  {selectedState.isIssued ? (
                    <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      {t("signoff.issued", lang)}
                    </div>
                  ) : selectedState.currentStep === 7 ? (
                    <button className="lkl-btn lkl-btn-primary">
                      <FileCheck className="w-3.5 h-3.5" />
                      {t("signoff.complete", lang)}
                    </button>
                  ) : (
                    <div className="text-xs text-slate-400 lkl-mono">—</div>
                  )}
                </div>
              </GlassCard>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Flow Diagram — serpentine S-shaped 6-step layout ────────────────────────

function FlowDiagram({ steps, currentStep, isIssued, lang }: { steps: Step[]; currentStep: number; isIssued: boolean; lang: "en" | "bm" }) {
  // Top row: steps 1 → 2 → 3 (left to right)
  // Bottom row: steps 6 ← 5 ← 4 (right to left)
  // Then → Final Controlled Issue

  return (
    <div className="space-y-3">
      {/* Top row: steps 1, 2, 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 relative">
        {steps.slice(0, 3).map((s, i) => (
          <FlowBox key={s.step} step={s} status={getStepStatus(s.step, currentStep, isIssued)} lang={lang} showArrow={i < 2} arrowDir="right" />
        ))}
      </div>

      {/* Down arrow (from step 3 to step 4) */}
      <div className="flex justify-end pr-[16%]">
        <ArrowDown className="w-6 h-6 text-slate-400" />
      </div>

      {/* Bottom row: steps 4, 5, 6 (right to left visually, but render 6,5,4 in DOM for left-to-right reading) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 relative">
        {steps.slice(3, 6).reverse().map((s, i) => {
          // The reversed array is [step6, step5, step4]
          // Show left arrow between them (from 6→5→4 visually means arrow points left)
          const originalStep = s.step;
          return (
            <FlowBox key={s.step} step={s} status={getStepStatus(originalStep, currentStep, isIssued)} lang={lang} showArrow={i < 2} arrowDir="left" />
          );
        })}
      </div>

      {/* Down arrow (from step 6 to Final) */}
      <div className="flex justify-start pl-[16%]">
        <ArrowDown className="w-6 h-6 text-slate-400" />
      </div>

      {/* Final controlled issue */}
      <div className="flex justify-center">
        <div className={cn(
          "lkl-card px-6 py-4 flex items-center gap-3 border-2",
          isIssued ? "border-emerald-400 bg-emerald-50" : "border-slate-300 bg-slate-50",
        )}>
          <div className={cn("w-10 h-10 rounded-full grid place-items-center", isIssued ? "bg-emerald-500" : "bg-slate-300")}>
            <FileCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className={cn("text-sm font-bold", isIssued ? "text-emerald-700" : "text-slate-500")}>{t("signoff.final", lang)}</div>
            <p className="text-[11px] text-slate-500 max-w-md">{t("signoff.final.desc", lang)}</p>
          </div>
          {isIssued && <CheckCircle2 className="w-6 h-6 text-emerald-600" />}
        </div>
      </div>
    </div>
  );
}

function getStepStatus(step: number, currentStep: number, isIssued: boolean): "approved" | "inReview" | "pending" {
  if (isIssued) return "approved";
  if (step < currentStep) return "approved";
  if (step === currentStep) return "inReview";
  return "pending";
}

function FlowBox({ step, status, lang, showArrow, arrowDir }: {
  step: Step;
  status: "approved" | "inReview" | "pending";
  lang: "en" | "bm";
  showArrow: boolean;
  arrowDir: "right" | "left";
}) {
  const Icon = STEP_ICONS[step.icon] ?? Building2;
  const style = STATUS_STYLES[status];

  return (
    <div className="relative">
      <div className={cn(
        "lkl-card p-3 border-2 transition",
        style.border,
        status === "inReview" && "shadow-[0_0_16px_-4px_rgba(217,119,6,0.3)]",
      )}>
        {/* Step number badge */}
        <div className="flex items-center justify-between mb-2">
          <div className={cn("w-7 h-7 rounded-full grid place-items-center lkl-mono text-xs font-bold", style.bg, style.color, "border", style.border)}>
            {status === "approved" ? "✓" : step.step}
          </div>
          <Icon className={cn("w-4 h-4", style.color)} />
        </div>
        {/* Department name */}
        <div className={cn("text-sm font-bold leading-tight", status === "pending" ? "text-slate-500" : "text-slate-900")}>
          {lang === "bm" ? step.department.bm : step.department.en}
        </div>
        {/* Description (truncated) */}
        <p className="text-[11px] text-slate-500 mt-1 leading-snug line-clamp-2">
          {lang === "bm" ? step.description.bm : step.description.en}
        </p>
        {/* Status chip */}
        <div className={cn("mt-2 lkl-mono text-[9px] px-1.5 py-0.5 rounded border font-semibold uppercase inline-block", style.border, style.bg, style.color)}>
          {t(style.label, lang)}
        </div>
        {/* Approvers (step 2 has named approvers) */}
        {step.step === 2 && (
          <div className="mt-1.5 text-[10px] text-slate-600 leading-snug">
            {lang === "bm" ? step.approvers.bm : step.approvers.en}
          </div>
        )}
      </div>
      {/* Arrow between boxes */}
      {showArrow && (
        <div className="hidden md:block absolute top-1/2 -translate-y-1/2 -right-3 z-10">
          {arrowDir === "right" ? (
            <div className="w-6 h-6 rounded-full bg-blue-100 border border-blue-300 grid place-items-center">
              <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-blue-100 border border-blue-300 grid place-items-center">
              <ArrowLeft className="w-3.5 h-3.5 text-blue-600" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
