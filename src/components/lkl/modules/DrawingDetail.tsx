"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { GlassCard, SectionHeader } from "../ui/glass";
import { StatusChip, VersionBadge, CategoryTag, FileIcon } from "../ui/badges";
import { UploadDialog } from "../ui/upload-dialog";
import {
  EngineeringDrawing, getPartType, sheetForPartType, TYPE_COLORS,
} from "../ui/engineering-drawing";
import { timeAgo, fmtDateTime, fmtDate } from "../ui/time";
import { useLkl, ROLES } from "@/lib/store";
import { t, tStatus } from "@/lib/i18n";
import {
  ArrowLeft, ZoomIn, X, Upload, GitCompare, GitCommit, ListChecks, History as HistoryIcon,
  CheckCircle2, AlertCircle, Eye, Download, RotateCcw, Send, DollarSign, FileSignature,
} from "lucide-react";

const STATUS_FLOW = ["Draft", "For Review", "Submission", "Tender", "Construction", "As-Built", "Approved", "Released", "Obsolete"];

function ChecklistProgress({ items, lang }: { items: any[]; lang: "en" | "bm" }) {
  if (items.length === 0) return null;
  const done = items.filter((i) => i.checked).length;
  const pct = Math.round((done / items.length) * 100);
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="lkl-eyebrow">{t("chk.title", lang)}</span>
        <span className="lkl-mono text-xs font-semibold text-slate-700">{done}/{items.length} · {pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full bg-blue-600 transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function StatusWorkflowBar({ status, onSet }: { status: string; onSet: (s: string) => void }) {
  const { lang } = useLkl();
  const idx = STATUS_FLOW.indexOf(status);
  return (
    <GlassCard>
      <SectionHeader eyebrow="STATUS WORKFLOW" title={lang === "bm" ? "Aliran kerja status" : "Status workflow"} />
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {STATUS_FLOW.map((s, i) => {
          const done = i < idx;
          const current = i === idx;
          return (
            <button
              key={s}
              className="flex items-center gap-1 shrink-0"
              onClick={() => onSet(s)}
              title={tStatus(s, lang)}
            >
              <div
                className={`px-2 py-1 rounded text-[10px] lkl-mono font-semibold border transition-colors ${
                  current
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : done
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-white text-slate-500 border-slate-200 hover:border-blue-400"
                }`}
              >
                {tStatus(s, lang)}
              </div>
              {i < STATUS_FLOW.length - 1 && <div className="text-slate-300 text-xs">→</div>}
            </button>
          );
        })}
      </div>
    </GlassCard>
  );
}

export function DrawingDetail() {
  const { selectedDrawingId, clearDrawing, setActiveModule, lang, openDrawing, role } = useLkl();
  const currentRole = ROLES.find((r) => r.id === role);
  const isSuperAdmin = role === "superadmin";
  const [d, setD] = useState<any>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [newVersionOpen, setNewVersionOpen] = useState(false);
  const [activeVersionIdx, setActiveVersionIdx] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  const reload = () => setReloadKey((k) => k + 1);

  useEffect(() => {
    if (!selectedDrawingId) return;
    let alive = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    Promise.all([
      fetch(`/api/drawings/${selectedDrawingId}`).then((r) => r.json()),
      fetch(`/api/drawings/${selectedDrawingId}/versions`).then((r) => r.json()),
    ])
      .then(([d1, d2]) => {
        if (!alive) return;
        setD(d1.drawing);
        setVersions(d2.versions ?? []);
        setActiveVersionIdx(0);
        setLoading(false);
      })
      .catch(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [selectedDrawingId, reloadKey]);

  if (loading || !d) {
    return (
      <div className="space-y-4">
        <div className="lkl-card p-4 h-12 animate-pulse bg-slate-100" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2 lkl-card h-96 animate-pulse bg-slate-100" />
          <div className="lkl-card h-96 animate-pulse bg-slate-100" />
          <div className="lkl-card h-96 animate-pulse bg-slate-100" />
        </div>
      </div>
    );
  }

  const partType = getPartType(d.number);
  const sheet = sheetForPartType(partType, d);
  sheet._version = d.version;
  const viewingVersion = versions[activeVersionIdx];
  const isViewingOld = viewingVersion && !viewingVersion.isCurrent;
  if (isViewingOld) sheet._version = viewingVersion.version;

  const setStatus = async (to: string) => {
    if (to === d.status) return;
    await fetch(`/api/drawings/${d.id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, user: "SHZ" }),
    });
    reload();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          className="lkl-btn lkl-btn-ghost text-xs"
          onClick={() => {
            clearDrawing();
            setActiveModule("drawings");
          }}
        >
          <ArrowLeft className="w-4 h-4" /> {t("detail.back", lang)}
        </button>
      </div>

      <GlassCard>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="lkl-mono text-lg sm:text-xl font-bold text-slate-900">{d.number}</h1>
              <VersionBadge version={d.version} />
              <StatusChip status={d.status} lang={lang} size="md" />
              <CategoryTag category={d.category} lang={lang} />
            </div>
            <h2 className="text-sm sm:text-base font-semibold text-slate-800 mt-1">{lang === "bm" ? d.titleBm : d.title}</h2>
            <div className="text-[11px] text-slate-500 lkl-mono mt-1">
              {t("col.updated", lang)}: {timeAgo(d.updatedAt, lang)} · {fmtDate(d.updatedAt)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="lkl-btn lkl-btn-ghost text-xs" onClick={() => setNewVersionOpen(true)}>
              <GitCommit className="w-4 h-4" /> {t("upload.newVersion", lang)}
            </button>
            <button className="lkl-btn lkl-btn-primary text-xs" onClick={() => setUploadOpen(true)}>
              <Upload className="w-4 h-4" /> {t("upload.title", lang)}
            </button>
          </div>
        </div>
      </GlassCard>

      {/* HERO: 4-col grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Drawing (2 cols) */}
        <GlassCard className="lg:col-span-2 p-2">
          <div className="flex items-center justify-between px-2 pt-1 pb-2">
            <span className="lkl-eyebrow">{t("detail.viewing", lang)}: V{viewingVersion?.version ?? d.version}</span>
            <button className="lkl-btn lkl-btn-ghost text-xs" onClick={() => setZoom(true)}>
              <ZoomIn className="w-3.5 h-3.5" /> {t("detail.zoom", lang)}
            </button>
          </div>
          <div className="rounded-md overflow-hidden border border-slate-200">
            <EngineeringDrawing partType={partType} variant={isViewingOld ? "old" : "new"} sheet={sheet} />
          </div>
          {/* Version quick-switch */}
          <div className="mt-2 px-1 flex items-center gap-1 overflow-x-auto pb-1">
            {versions.map((v, i) => (
              <button
                key={v.version}
                onClick={() => setActiveVersionIdx(i)}
                className={`shrink-0 px-2 py-1 rounded text-[10px] lkl-mono font-semibold border ${
                  i === activeVersionIdx
                    ? "bg-blue-600 text-white border-blue-600"
                    : v.isCurrent
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-white text-slate-500 border-slate-200 hover:border-blue-400"
                }`}
              >
                V{v.version}{v.isCurrent ? " ●" : ""}
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Metadata + description + checklist */}
        <div className="space-y-3">
          <GlassCard>
            <SectionHeader eyebrow={t("detail.metadata", lang)} title={lang === "bm" ? "Maklumat" : "Metadata"} />
            <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
              <dt className="text-slate-500">{t("detail.drawnBy", lang)}</dt>
              <dd className="lkl-mono font-semibold text-slate-800">{d.drawnBy || "—"}</dd>
              <dt className="text-slate-500">{t("detail.checkedBy", lang)}</dt>
              <dd className="lkl-mono font-semibold text-slate-800">{d.checkedBy || "—"}</dd>
              <dt className="text-slate-500">{t("detail.approvedBy", lang)}</dt>
              <dd className="lkl-mono font-semibold text-slate-800">{d.approvedBy || "—"}</dd>
              <dt className="text-slate-500">{t("detail.material", lang)}</dt>
              <dd className="lkl-mono font-semibold text-slate-800">{d.material || "—"}</dd>
              <dt className="text-slate-500">{t("detail.mass", lang)}</dt>
              <dd className="lkl-mono font-semibold text-slate-800">{d.mass != null ? `${d.mass} kg` : "—"}</dd>
              <dt className="text-slate-500">{t("detail.version", lang)}</dt>
              <dd><VersionBadge version={d.version} /></dd>
            </dl>
          </GlassCard>

          <GlassCard>
            <SectionHeader eyebrow={t("detail.description", lang)} title={lang === "bm" ? "Penerangan" : "Description"} />
            <p className="text-xs text-slate-700 leading-relaxed">
              {lang === "bm" ? d.descriptionBm || d.description : d.description}
            </p>
          </GlassCard>

          <GlassCard>
            <ChecklistProgress items={d.checklistItems} lang={lang} />
            {d.checklistItems.slice(0, 3).map((c: any) => (
              <div key={c.id} className="flex items-center gap-2 mt-2 text-xs">
                <span className={`w-4 h-4 rounded grid place-items-center text-[9px] ${c.checked ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-400"}`}>
                  {c.checked ? "✓" : ""}
                </span>
                <span className={c.checked ? "text-slate-500 line-through" : "text-slate-700"}>{lang === "bm" ? c.labelBm : c.label}</span>
              </div>
            ))}
            <button
              className="lkl-btn lkl-btn-ghost text-xs w-full mt-3"
              onClick={() => setActiveModule("checklists")}
            >
              <ListChecks className="w-3.5 h-3.5" /> {t("chk.title", lang)}
            </button>
          </GlassCard>
        </div>

        {/* Version history */}
        <GlassCard>
          <SectionHeader eyebrow={t("detail.versionHistory", lang)} title={lang === "bm" ? "Sejarah versi" : "Version history"} />
          <div className="relative max-h-[420px] overflow-y-auto pr-1">
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-slate-200" />
            <ul className="space-y-3">
              {versions.map((v, i) => (
                <li key={v.version} className="relative pl-6">
                  <span
                    className={`absolute left-[3px] top-1.5 w-2.5 h-2.5 rounded-full ring-2 ${
                      i === activeVersionIdx ? "bg-blue-600 ring-blue-100" : v.isCurrent ? "bg-emerald-500 ring-emerald-100" : "bg-slate-300 ring-slate-100"
                    }`}
                  />
                  <button className="w-full text-left" onClick={() => setActiveVersionIdx(i)}>
                    <div className="flex items-center gap-2">
                      <VersionBadge version={v.version} />
                      {v.isCurrent && <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">{t("detail.current", lang)}</span>}
                      <span className="ml-auto text-[10px] text-slate-400 lkl-mono">{fmtDate(v.date)}</span>
                    </div>
                    <div className="text-xs text-slate-700 mt-1 leading-snug">
                      {lang === "bm" ? v.changeDescriptionBm : v.changeDescription}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5 lkl-mono">{v.drawnBy} · {tStatus(v.status, lang)}</div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <button
            className="lkl-btn lkl-btn-ghost text-xs w-full mt-3"
            onClick={() => setActiveModule("designChange")}
          >
            <GitCompare className="w-3.5 h-3.5" /> {t("detail.compareVersions", lang)}
          </button>
        </GlassCard>
      </div>

      {/* Status workflow */}
      <StatusWorkflowBar status={d.status} onSet={setStatus} />

      {/* Sign-off action panel — role-specific buttons */}
      {currentRole && d && (
        <SignOffActionPanel
          role={role}
          roleName={lang === "bm" ? currentRole.labelBm : currentRole.label}
          roleStep={currentRole.step}
          roleColor={currentRole.color}
          roleName2={currentRole.name}
          lang={lang}
          drawingNumber={d.number}
          isSuperAdmin={isSuperAdmin}
        />
      )}

      {/* Files + BOM */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard>
          <SectionHeader
            eyebrow={t("detail.files", lang)}
            title={lang === "bm" ? "Fail disimpan" : "Stored files"}
            action={
              <div className="flex items-center gap-1.5">
                <button className="lkl-btn lkl-btn-ghost text-xs" onClick={() => setNewVersionOpen(true)}>
                  <GitCommit className="w-3.5 h-3.5" /> {t("upload.newVersion", lang)}
                </button>
                <button className="lkl-btn lkl-btn-primary text-xs" onClick={() => setUploadOpen(true)}>
                  <Upload className="w-3.5 h-3.5" /> {t("upload.title", lang)}
                </button>
              </div>
            }
          />
          {d.files.length === 0 ? (
            <div className="text-xs text-slate-400 py-4 text-center">{lang === "bm" ? "Tiada fail" : "No files"}</div>
          ) : (
            <ul className="space-y-1.5">
              {d.files.map((f: any) => (
                <li key={f.id} className="flex items-center gap-3 p-2 rounded border border-slate-200 hover:bg-slate-50 transition group">
                  <FileIcon type={f.fileType} />
                  <div className="min-w-0 flex-1">
                    <div className="lkl-mono text-xs font-semibold text-slate-800 truncate">{f.filename}</div>
                    <div className="text-[10px] text-slate-500 lkl-mono">
                      {(f.sizeKb / 1024).toFixed(2)} MB · {f.uploadedBy} · {timeAgo(f.uploadedAt, lang)}
                    </div>
                  </div>
                  {/* View button (opens PDF in new tab) */}
                  {f.fileType === "pdf" && (
                    <a
                      href={`/api/drawings/${d.id}/files/${f.id}/download`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                      title={lang === "bm" ? "Lihat fail" : "View file"}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {/* Download button */}
                  <a
                    href={`/api/drawings/${d.id}/files/${f.id}/download`}
                    download={f.filename}
                    className="p-1.5 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                    title={lang === "bm" ? "Muat turun" : "Download"}
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>

        <GlassCard id="bom-section">
          <SectionHeader
            eyebrow="BILL OF MATERIALS"
            title={lang === "bm" ? "BOM pratonton" : "BOM preview"}
            action={role === "qs" || isSuperAdmin ? (
              <button className="lkl-btn lkl-btn-primary text-xs">
                <DollarSign className="w-3.5 h-3.5" /> {lang === "bm" ? "Luluskan Kos" : "Approve Cost"}
              </button>
            ) : undefined}
          />
          {d.bomItems.length === 0 ? (
            <div className="text-xs text-slate-400 py-4 text-center">{lang === "bm" ? "BOM belum dijana" : "BOM not generated"}</div>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-[10px] uppercase text-slate-500 border-b border-slate-200">
                  <th className="py-1 pr-2">Part</th>
                  <th className="py-1 pr-2">Qty</th>
                  <th className="py-1 pr-2 hidden sm:table-cell">Mass</th>
                </tr>
              </thead>
              <tbody>
                {d.bomItems.slice(0, 5).map((b: any) => (
                  <tr key={b.id} className="border-b border-slate-100">
                    <td className="py-1.5 pr-2 lkl-mono text-blue-700 font-semibold">{b.partNumber}</td>
                    <td className="py-1.5 pr-2 lkl-mono">{b.qty}</td>
                    <td className="py-1.5 pr-2 lkl-mono hidden sm:table-cell">{b.mass != null ? `${b.mass} kg` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <button
            className="lkl-btn lkl-btn-ghost text-xs w-full mt-3"
            onClick={() => {
              openDrawing(d.id, d.number);
              setActiveModule("autoBom");
            }}
          >
            <ListChecks className="w-3.5 h-3.5" /> {t("bom.generate", lang)}
          </button>
        </GlassCard>
      </div>

      {/* Audit log */}
      <GlassCard>
        <SectionHeader eyebrow={t("detail.audit", lang)} title={lang === "bm" ? "Log audit" : "Audit log"} />
        <ul className="space-y-1.5 max-h-72 overflow-y-auto">
          {d.auditTrails.map((a: any) => (
            <li key={a.id} className="flex items-center gap-3 text-xs p-2 rounded hover:bg-slate-50">
              <HistoryIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="lkl-mono font-semibold text-slate-700 w-12 shrink-0">{a.user}</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[9px] uppercase tracking-wider text-slate-600">{a.action}</span>
              <span className="text-slate-700 truncate flex-1">{a.detail}</span>
              <span className="text-[10px] text-slate-400 lkl-mono shrink-0">{fmtDateTime(a.createdAt, lang)}</span>
            </li>
          ))}
        </ul>
      </GlassCard>

      {/* Zoom modal */}
      {zoom && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setZoom(false)}>
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-auto relative" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 flex items-center justify-between p-3 bg-white/95 backdrop-blur border-b border-slate-200">
              <span className="lkl-mono text-sm font-bold text-slate-900">{d.number} · V{viewingVersion?.version ?? d.version}</span>
              <button className="p-1.5 text-slate-500 hover:text-slate-900" onClick={() => setZoom(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <EngineeringDrawing partType={partType} variant={isViewingOld ? "old" : "new"} sheet={sheet} />
            </div>
          </div>
        </div>
      )}

      {/* Upload dialog */}
      <UploadDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        endpoint={`/api/drawings/${d.id}/upload`}
        extraFields={{ uploadedBy: "SHZ" }}
        onUploaded={() => reload()}
      />

      {/* New version dialog */}
      <NewVersionDialog
        open={newVersionOpen}
        onClose={() => setNewVersionOpen(false)}
        drawingId={d.id}
        currentVersion={d.version}
        drawingNumber={d.number}
        lang={lang}
        onUploaded={() => reload()}
      />
    </div>
  );
}

// ─── Sign-Off Action Panel — role-specific buttons on Drawing Detail ─────────

function SignOffActionPanel({ role, roleName, roleStep, roleColor, roleName2, lang, drawingNumber, isSuperAdmin }: {
  role: string;
  roleName: string;
  roleStep: number | null;
  roleColor: string;
  roleName2: string;
  lang: "en" | "bm";
  drawingNumber: string;
  isSuperAdmin: boolean;
}) {
  if (isSuperAdmin) {
    // Super Admin: show all role actions
    return (
      <GlassCard className="border-2 border-slate-300">
        <SectionHeader eyebrow="SUPER ADMIN — SIGN-OFF ACTIONS" title="All department actions available" />
        <div className="flex flex-wrap gap-2">
          <button className="lkl-btn lkl-btn-primary text-xs"><Send className="w-3.5 h-3.5" /> Submit for Review (Architect)</button>
          <button className="lkl-btn lkl-btn-primary text-xs"><CheckCircle2 className="w-3.5 h-3.5" /> Approve (Technical)</button>
          <button className="lkl-btn lkl-btn-primary text-xs"><CheckCircle2 className="w-3.5 h-3.5" /> Approve (M&E)</button>
          <button className="lkl-btn lkl-btn-primary text-xs"><DollarSign className="w-3.5 h-3.5" /> Approve Cost (QS)</button>
          <button className="lkl-btn lkl-btn-primary text-xs"><CheckCircle2 className="w-3.5 h-3.5" /> Approve (Sales Admin)</button>
          <button className="lkl-btn lkl-btn-primary text-xs"><FileSignature className="w-3.5 h-3.5" /> Sign-off (Sales & Marketing)</button>
          <button className="lkl-btn lkl-btn-ghost text-xs text-red-600 hover:!border-red-400 hover:!bg-red-50"><RotateCcw className="w-3.5 h-3.5" /> Revise / Comment</button>
        </div>
        <div className="text-[10px] text-slate-400 mt-2 lkl-mono uppercase tracking-wider">
          {lang === "bm" ? "Pentadbir Utama boleh melakukan tindakan mana-mana jabatan" : "Super Admin can perform any department's action"}
        </div>
      </GlassCard>
    );
  }

  // Define role-specific action button
  const actions: Record<string, { label: string; labelBm: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
    architect:       { label: "Submit for Review",  labelBm: "Hantar untuk Semakan", icon: Send,           color: "lkl-btn-primary" },
    technical:       { label: "Approve",             labelBm: "Luluskan",             icon: CheckCircle2,   color: "lkl-btn-primary" },
    me:              { label: "Approve",             labelBm: "Luluskan",             icon: CheckCircle2,   color: "lkl-btn-primary" },
    qs:              { label: "Approve Cost",        labelBm: "Luluskan Kos",         icon: DollarSign,     color: "lkl-btn-primary" },
    salesAdmin:      { label: "Approve",             labelBm: "Luluskan",             icon: CheckCircle2,   color: "lkl-btn-primary" },
    salesMarketing:  { label: "Sign-off",            labelBm: "Tandatangan",          icon: FileSignature,  color: "lkl-btn-primary" },
  };

  const action = actions[role];
  if (!action) return null;
  const ActionIcon = action.icon;

  // Role-specific descriptions
  const descMap: Record<string, { en: string; bm: string }> = {
    architect:      { en: "You prepared this drawing. Submit it for technical review.", bm: "Anda menyediakan lukisan ini. Hantar untuk semakan teknikal." },
    technical:      { en: "Review technical coordination & compliance. Approve to proceed to M&E.", bm: "Semak koordinasi teknikal & pematuhan. Luluskan untuk teruskan ke M&E." },
    me:             { en: "Review services coordination (MEP layouts, risers, equipment). Approve to proceed to QS.", bm: "Semak koordinasi perkhidmatan (MEP, riser, peralatan). Luluskan untuk teruskan ke QS." },
    qs:             { en: "Validate cost & BOQ. Click 'Approve Cost' on the BOM section below after reviewing quantities.", bm: "Sahkan kos & BOQ. Klik 'Luluskan Kos' di bahagian BOM di bawah selepas semak kuantiti." },
    salesAdmin:     { en: "Check SPA & sales documentation (unit schedule, specs, areas).", bm: "Semak dokumentasi SPA & jualan (jadual unit, spesifikasi, kawasan)." },
    salesMarketing: { en: "Confirm product positioning & sales materials alignment. This is the final sign-off before controlled issue.", bm: "Sahkan kedudukan produk & bahan jualan. Ini tandatangan akhir sebelum pelepasan terkawal." },
  };
  const desc = descMap[role] ?? { en: "", bm: "" };

  return (
    <div className={`lkl-card p-4 border-2 border-l-4`} style={{ borderLeftColor: role === "architect" ? "#0066b4" : role === "technical" ? "#6366f1" : role === "me" ? "#06b6d4" : role === "qs" ? "#d97706" : role === "salesAdmin" ? "#a855f7" : "#ec4899" }}>
      {/* Role identity */}
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${roleColor} text-white grid place-items-center text-sm font-bold shrink-0`}>
          {roleName2.split(" ").map((w: string) => w[0]).slice(0, 2).join("")}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-slate-900">{roleName2}</span>
            <span className="lkl-mono text-[10px] px-1.5 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase">
              {roleName}
            </span>
            {roleStep && <span className="lkl-mono text-[10px] text-slate-400">Step {roleStep}</span>}
          </div>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">{lang === "bm" ? desc.bm : desc.en}</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Role-specific primary action */}
        <button className={`lkl-btn ${action.color} text-sm`}>
          <ActionIcon className="w-4 h-4" />
          {lang === "bm" ? action.labelBm : action.label}
        </button>

        {/* Revise / Comment — available to all roles except architect */}
        {role !== "architect" && (
          <button className="lkl-btn lkl-btn-ghost text-sm text-red-600 hover:!border-red-400 hover:!bg-red-50">
            <RotateCcw className="w-4 h-4" />
            {lang === "bm" ? "Semak / Komen" : "Revise / Comment"}
          </button>
        )}

        {/* QS-specific: link to BOM section */}
        {role === "qs" && (
          <a href="#bom-section" className="lkl-btn lkl-btn-ghost text-sm text-amber-700 hover:!border-amber-400 hover:!bg-amber-50">
            <DollarSign className="w-4 h-4" />
            {lang === "bm" ? "Lihat BOM" : "Review BOM"}
          </a>
        )}
      </div>

      {/* Gate rule reminder */}
      {role !== "architect" && (
        <div className="mt-2 text-[10px] text-amber-600 lkl-mono uppercase tracking-wider">
          ⚠ {lang === "bm" ? "Peraturan Pintu: 'Semak / Komen' menghantar kembali ke Arkitek" : "Gate Rule: 'Revise / Comment' sends back to Architect"}
        </div>
      )}
    </div>
  );
}

// ─── New Version Dialog ──────────────────────────────────────────────────────

function NewVersionDialog({ open, onClose, drawingId, currentVersion, drawingNumber, lang, onUploaded }: {
  open: boolean;
  onClose: () => void;
  drawingId: string;
  currentVersion: string;
  drawingNumber: string;
  lang: "en" | "bm";
  onUploaded: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [changeDesc, setChangeDesc] = useState("");
  const [state, setState] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  // Compute new version: "00" → "01", "01" → "02"
  const versionNum = parseInt(currentVersion.replace(/\D/g, ""), 10) || 0;
  const newVersion = String(versionNum + 1).padStart(2, "0");

  const reset = () => { setFile(null); setChangeDesc(""); setState("idle"); setError(null); setDragOver(false); };
  const handleClose = () => { reset(); onClose(); };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) { setFile(f); setState("idle"); setError(null); }
  };

  const submit = async () => {
    if (!file || !changeDesc.trim()) return;
    setState("uploading");
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("changeDescription", changeDesc.trim());
      formData.append("changeDescriptionBm", changeDesc.trim());
      const res = await fetch(`/api/drawings/${drawingId}/new-version`, { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setState("error");
        setError(data.error || "Upload failed");
        return;
      }
      setState("success");
      setTimeout(() => { handleClose(); onUploaded(); }, 1200);
    } catch (e) {
      setState("error");
      setError(e instanceof Error ? e.message : "Network error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm grid place-items-center p-4" onClick={handleClose}>
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitCommit className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">{t("upload.newVersionTitle", lang)}</h3>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"><X className="w-4 h-4" /></button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Drawing info + version preview */}
          <div className="p-3 rounded-md bg-blue-50 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="lkl-eyebrow text-blue-700">{drawingNumber}</div>
                <div className="text-xs text-slate-600 mt-0.5">{t("upload.newVersionSubtitle", lang)}</div>
              </div>
              <div className="flex items-center gap-2 lkl-mono">
                <span className="text-sm text-slate-400 line-through">V{currentVersion}</span>
                <span className="text-slate-400">→</span>
                <span className="text-lg font-bold text-emerald-600">V{newVersion}</span>
              </div>
            </div>
          </div>

          {/* File drop zone */}
          <div
            onDrop={onDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${dragOver ? "border-blue-500 bg-blue-50" : file ? "border-emerald-400 bg-emerald-50/50" : "border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/30"}`}
          >
            <input ref={inputRef} type="file" className="hidden" accept=".dwg,.pdf,.step,.stp,.stl,.igs,.iges,.jpg,.png,.zip" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setFile(f); setState("idle"); setError(null); } }} />
            {file ? (
              <div className="flex flex-col items-center gap-1.5">
                <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                <div className="flex items-center gap-2">
                  <FileIcon type={file.name.split(".").pop()?.toLowerCase() ?? ""} />
                  <span className="text-sm font-semibold text-slate-900">{file.name}</span>
                </div>
                <span className="lkl-mono text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</span>
                <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="text-xs text-slate-400 hover:text-red-600 mt-0.5">
                  ✕ {lang === "bm" ? "Buang pilihan" : "Remove"}
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5">
                <Upload className={`w-7 h-7 ${dragOver ? "text-blue-500" : "text-slate-400"}`} />
                <div className="text-sm font-medium text-slate-700">{t("upload.dragDrop", lang)}</div>
                <div className="lkl-mono text-[10px] text-slate-400 uppercase tracking-wider">DWG · PDF · STEP · STL · IGS · JPG · PNG · ZIP</div>
              </div>
            )}
          </div>

          {/* Change description */}
          <div>
            <label className="lkl-eyebrow block mb-1">{t("upload.changeDesc", lang)} *</label>
            <textarea
              className="lkl-input min-h-[70px] resize-y"
              placeholder={t("upload.changeDescHint", lang)}
              value={changeDesc}
              onChange={(e) => setChangeDesc(e.target.value)}
            />
          </div>

          {/* Error / Success */}
          {error && (
            <div className="p-2.5 rounded-md bg-red-50 border border-red-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="text-xs text-red-700">{error}</div>
            </div>
          )}
          {state === "success" && (
            <div className="p-2.5 rounded-md bg-emerald-50 border border-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="text-xs text-emerald-700 font-semibold">{t("upload.versionBumped", lang)} — V{currentVersion} → V{newVersion}</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-200 flex items-center justify-end gap-2 bg-slate-50">
          <button onClick={handleClose} className="lkl-btn lkl-btn-ghost">{t("newDrawing.cancel", lang)}</button>
          <button onClick={submit} disabled={!file || !changeDesc.trim() || state === "uploading" || state === "success"} className="lkl-btn lkl-btn-primary">
            {state === "uploading" ? (
              <><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> {t("upload.uploading", lang)}</>
            ) : state === "success" ? (
              <><CheckCircle2 className="w-3.5 h-3.5" /> {t("upload.versionBumped", lang)}</>
            ) : (
              <><GitCommit className="w-3.5 h-3.5" /> {t("upload.newVersion", lang)}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
