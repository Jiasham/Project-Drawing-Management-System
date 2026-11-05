"use client";
import { useEffect, useState } from "react";
import { GlassCard, SectionHeader } from "../ui/glass";
import { StatusChip, VersionBadge } from "../ui/badges";
import {
  EngineeringDrawing, getPartType, sheetForPartType, TYPE_COLORS, type Change,
} from "../ui/engineering-drawing";
import { useLkl } from "@/lib/store";
import { t } from "@/lib/i18n";
import {
  GitCompare, FileWarning, AlertTriangle, ShieldAlert, Loader2, FileText, ChevronRight,
} from "lucide-react";

const RISK_COLORS: Record<string, string> = {
  low: "text-emerald-700 bg-emerald-50 border-emerald-200",
  medium: "text-amber-700 bg-amber-50 border-amber-200",
  high: "text-orange-700 bg-orange-50 border-orange-200",
  critical: "text-red-700 bg-red-50 border-red-200",
};

export function DesignChange() {
  const { lang, openDrawing } = useLkl();
  const [drawings, setDrawings] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [diff, setDiff] = useState<any>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDiff, setLoadingDiff] = useState(false);
  const [activeChangeId, setActiveChangeId] = useState<number | null>(null);
  const [hoverChangeId, setHoverChangeId] = useState<number | null>(null);
  const [reportGenerated, setReportGenerated] = useState(false);

  const selectDrawing = (id: string) => {
    setSelectedId(id);
    setLoadingDiff(true);
    setDiff(null);
    setActiveChangeId(null);
    setReportGenerated(false);
    fetch(`/api/design-change?drawingId=${id}`)
      .then((r) => r.json())
      .then((d) => {
        setDiff(d);
        setLoadingDiff(false);
      });
  };

  useEffect(() => {
    fetch("/api/design-change")
      .then((r) => r.json())
      .then((d) => {
        setDrawings(d.drawings ?? []);
        setLoadingList(false);
        if (d.drawings?.[0]) selectDrawing(d.drawings[0].id);
      });
  }, []);

  const counts = diff?.changes?.reduce(
    (acc: any, c: Change) => {
      acc[c.type] = (acc[c.type] ?? 0) + 1;
      return acc;
    },
    { added: 0, removed: 0, modified: 0, dimension: 0 },
  ) ?? { added: 0, removed: 0, modified: 0, dimension: 0 };

  if (loadingList) {
    return (
      <div className="space-y-4">
        <div className="lkl-card p-4 h-12 animate-pulse bg-slate-100" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 lkl-card h-96 animate-pulse bg-slate-100" />
          <div className="lkl-card h-96 animate-pulse bg-slate-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-md bg-blue-50 border border-blue-200 grid place-items-center text-blue-700">
          <GitCompare className="w-5 h-5" />
        </div>
        <div>
          <div className="lkl-eyebrow mb-0.5">VERSION COMPARISON</div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{t("dc.title", lang)}</h1>
        </div>
      </div>

      {/* Drawing selector */}
      <GlassCard>
        <SectionHeader eyebrow={t("dc.selectDrawing", lang)} title={lang === "bm" ? "Pilih lukisan untuk dibandingkan" : "Pick a drawing to compare"} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {drawings.map((d) => (
            <button
              key={d.id}
              onClick={() => selectDrawing(d.id)}
              className={`p-3 rounded-md border text-left transition-colors ${
                selectedId === d.id ? "border-blue-600 bg-blue-50/60 shadow-sm" : "border-slate-200 hover:border-blue-400 bg-white"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="lkl-mono text-xs font-bold text-slate-900">{d.number}</span>
                {d.changeCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                    {d.changeCount} {lang === "bm" ? "perubahan" : "changes"}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-600 truncate">{lang === "bm" ? d.titleBm : d.title}</div>
              <div className="mt-2 flex items-center gap-1.5 text-[10px] lkl-mono text-slate-500">
                <span className="px-1 py-0.5 rounded border border-red-200 bg-red-50 text-red-700">V{d.oldVersion}</span>
                →
                <span className="px-1 py-0.5 rounded border border-emerald-200 bg-emerald-50 text-emerald-700">V{d.newVersion}</span>
              </div>
            </button>
          ))}
        </div>
      </GlassCard>

      {!diff || loadingDiff ? (
        <GlassCard className="text-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
          <div className="text-sm text-slate-500 mt-2">{lang === "bm" ? "Memuatkan diff…" : "Loading diff…"}</div>
        </GlassCard>
      ) : (
        <>
          {/* Side-by-side */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <GlassCard className="lg:col-span-2 p-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {/* OLD */}
                <div>
                  <div className="px-2 pt-1 pb-2 flex items-center justify-between">
                    <span className="lkl-eyebrow text-red-700">{t("dc.oldVersion", lang)}</span>
                    <VersionBadge version={diff.drawing.oldVersion} />
                  </div>
                  <div className="rounded-md overflow-hidden border border-slate-200">
                    <EngineeringDrawing
                      partType={getPartType(diff.drawing.number)}
                      variant="old"
                      sheet={{ ...sheetForPartType(getPartType(diff.drawing.number), diff.drawing), _version: diff.drawing.oldVersion } as any}
                    />
                  </div>
                </div>
                {/* NEW */}
                <div>
                  <div className="px-2 pt-1 pb-2 flex items-center justify-between">
                    <span className="lkl-eyebrow text-emerald-700">{t("dc.newVersion", lang)}</span>
                    <VersionBadge version={diff.drawing.newVersion} />
                  </div>
                  <div className="rounded-md overflow-hidden border border-slate-200">
                    <EngineeringDrawing
                      partType={getPartType(diff.drawing.number)}
                      variant="new"
                      sheet={{ ...sheetForPartType(getPartType(diff.drawing.number), diff.drawing), _version: diff.drawing.newVersion } as any}
                      showChangeMarkers
                      changes={diff.changes}
                      activeChange={activeChangeId}
                      onHoverChange={setHoverChangeId}
                      onClickChange={(id: number) => setActiveChangeId(id)}
                    />
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="mt-2 px-1 py-2 border-t border-slate-200">
                <div className="lkl-eyebrow mb-1.5">{t("dc.changeLegend", lang)}</div>
                <div className="flex flex-wrap gap-2">
                  {(["added", "removed", "modified", "dimension"] as const).map((typ) => {
                    const Icon = TYPE_COLORS[typ].icon;
                    const meta = TYPE_COLORS[typ];
                    return (
                      <div key={typ} className={`flex items-center gap-1.5 px-2 py-1 rounded border text-[11px] font-semibold ${meta.chip}`}>
                        <Icon className="w-3 h-3" />
                        {t(`dc.type.${typ}`, lang)}
                        <span className="lkl-mono">({counts[typ] ?? 0})</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </GlassCard>

            {/* Change list */}
            <GlassCard>
              <SectionHeader eyebrow={t("dc.changes", lang)} title={`${diff.changes.length} ${lang === "bm" ? "perubahan" : "changes"}`} />
              <ul className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                {diff.changes.map((c: Change) => {
                  const meta = TYPE_COLORS[c.type];
                  const Icon = meta.icon;
                  const active = activeChangeId === c.id || hoverChangeId === c.id;
                  return (
                    <li key={c.id}>
                      <button
                        onClick={() => setActiveChangeId(c.id === activeChangeId ? null : c.id)}
                        className={`w-full text-left p-2.5 rounded-md border transition-colors ${
                          active ? "border-blue-500 bg-blue-50/60 shadow-sm" : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-5 h-5 rounded grid place-items-center text-[10px] font-bold text-white" style={{ background: meta.stroke }}>
                            {c.id}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded border text-[9px] uppercase tracking-wider ${meta.chip}`}>
                            <Icon className="w-3 h-3 inline" /> {t(`dc.type.${c.type}`, lang)}
                          </span>
                          <span className="ml-auto text-[9px] text-slate-400 lkl-mono">{c.category}</span>
                        </div>
                        <div className="text-xs font-semibold text-slate-900">{lang === "bm" ? c.titleBm : c.title}</div>
                        <div className="text-[11px] text-slate-600 mt-0.5 leading-snug">{lang === "bm" ? c.descriptionBm : c.description}</div>
                        <div className="mt-1.5 grid grid-cols-2 gap-1.5 text-[10px]">
                          <div className="rounded border border-red-200 bg-red-50 p-1">
                            <div className="text-red-700 font-bold uppercase tracking-wider">Old</div>
                            <div className="lkl-mono text-slate-700">{c.oldSpec}</div>
                          </div>
                          <div className="rounded border border-emerald-200 bg-emerald-50 p-1">
                            <div className="text-emerald-700 font-bold uppercase tracking-wider">New</div>
                            <div className="lkl-mono text-slate-700">{c.newSpec}</div>
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </GlassCard>
          </div>

          {/* AI Analysis */}
          <GlassCard tickCorners>
            <SectionHeader
              eyebrow={t("dc.aiAnalysis", lang)}
              title={lang === "bm" ? "Analisis AI & ECO" : "AI analysis & ECO"}
              action={
                <div className={`px-2 py-1 rounded border text-[10px] font-bold uppercase tracking-wider ${RISK_COLORS[diff.aiAnalysis.risk]}`}>
                  <ShieldAlert className="w-3.5 h-3.5 inline mr-1" />
                  {t(`dc.risk.${diff.aiAnalysis.risk}`, lang)} {t("dc.risk", lang)}
                </div>
              }
            />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-3">
                <div>
                  <div className="lkl-eyebrow mb-1">{t("dc.aiVerdict", lang)}</div>
                  <div className="text-sm text-slate-900 font-semibold">{lang === "bm" ? diff.aiAnalysis.verdictBm : diff.aiAnalysis.verdict}</div>
                </div>
                <div>
                  <div className="lkl-eyebrow mb-1">Summary</div>
                  <p className="text-xs text-slate-700 leading-relaxed">{lang === "bm" ? diff.aiAnalysis.summaryBm : diff.aiAnalysis.summary}</p>
                </div>
                <div>
                  <div className="lkl-eyebrow mb-1">{t("dc.impact", lang)}</div>
                  <p className="text-xs text-slate-700 leading-relaxed">{diff.aiAnalysis.manufacturingImpact}</p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <FileWarning className="w-4 h-4 text-amber-600" />
                  <span className="text-slate-600">{t("dc.checklistImpact", lang)}:</span>
                  <span className={`px-1.5 py-0.5 rounded border text-[10px] font-semibold ${diff.aiAnalysis.checklistRecheckRequired ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
                    {diff.aiAnalysis.checklistRecheckRequired ? t("dc.impactY", lang) : t("dc.impactN", lang)}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="lkl-eyebrow mb-1">Affected items</div>
                  <ul className="space-y-1">
                    {diff.aiAnalysis.affectedItems.map((it: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-slate-700">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                        <span className="lkl-mono">{it}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  className="lkl-btn lkl-btn-primary w-full text-xs"
                  onClick={() => setReportGenerated(true)}
                >
                  <FileText className="w-3.5 h-3.5" /> {t("dc.generateReport", lang)}
                </button>
                {reportGenerated && (
                  <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded p-2 text-center font-semibold">
                    ✓ {t("dc.reportGenerated", lang)}
                  </div>
                )}
              </div>
            </div>
          </GlassCard>
        </>
      )}
    </div>
  );
}
