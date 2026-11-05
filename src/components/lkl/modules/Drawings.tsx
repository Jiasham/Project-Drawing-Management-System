"use client";
import { useEffect, useState, useCallback } from "react";
import { GlassCard, SectionHeader } from "../ui/glass";
import { StatusChip, VersionBadge, CategoryTag } from "../ui/badges";
import { useLkl } from "@/lib/store";
import { t, tStatus, tCategory } from "@/lib/i18n";
import { Plus, Search, Loader2, X } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const STATUS_OPTIONS = ["Draft", "For Review", "Submission", "Tender", "Construction", "As-Built", "Approved", "Released", "Obsolete"];
const CATEGORY_OPTIONS = ["Architectural", "Structural", "Civil", "Site", "Landscape", "ACMV", "CWSP", "FPS", "General", "Infrastructure", "Lighting", "Small Power", "DB/SLD", "LPS", "TNB"];

const CAT_ICON: Record<string, string> = {
  Architectural: "🏢", Structural: "🏗️", Civil: "🛣️", Site: "🗺️", Landscape: "🌳",
  ACMV: "❄️", CWSP: "🚰", FPS: "🧯", General: "📐", Infrastructure: "📡",
  Lighting: "💡", "Small Power": "🔌", "DB/SLD": "⚡", LPS: "⛈️", TNB: "🔌",
};

function Thumb({ category }: { category: string }) {
  return (
    <div className="aspect-[4/3] rounded-md border border-slate-200 bg-white overflow-hidden">
      <svg viewBox="0 0 200 150" className="w-full h-full block">
        <defs>
          <pattern id={`g-${category}`} width="14" height="14" patternUnits="userSpaceOnUse">
            <path d="M 14 0 L 0 0 0 14" fill="none" stroke="#d4dbe6" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="200" height="150" fill={`url(#g-${category})`} />
        <rect x="6" y="6" width="188" height="138" fill="none" stroke="#0a1828" strokeWidth="1.2" />
        <rect x="10" y="10" width="180" height="130" fill="none" stroke="#0a1828" strokeWidth="0.4" />
        <text x="14" y="20" fill="#5a6a82" fontSize="7" fontFamily="monospace" fontWeight="700" letterSpacing="1.5">
          {category}
        </text>
        <text x="186" y="20" textAnchor="end" fill="#5a6a82" fontSize="6" fontFamily="monospace" letterSpacing="1">
          FAC118
        </text>
        {/* category symbol */}
        <text x="100" y="80" textAnchor="middle" fontSize="36">{CAT_ICON[category] ?? "📐"}</text>
        {/* mini title block */}
        <rect x="100" y="100" width="94" height="40" fill="#fff" stroke="#0a1828" strokeWidth="0.6" />
        <line x1="100" y1="118" x2="194" y2="118" stroke="#0a1828" strokeWidth="0.4" />
        <text x="104" y="110" fill="#5a6a82" fontSize="5" fontFamily="monospace" fontWeight="700">TITLE:</text>
        <text x="104" y="128" fill="#5a6a82" fontSize="5" fontFamily="monospace" fontWeight="700">NO:</text>
        <text x="104" y="137" fill="#5a6a82" fontSize="5" fontFamily="monospace" fontWeight="700">REV:</text>
        <rect x="6" y="120" width="14" height="14" fill="#0066b4" />
        <text x="13" y="130" textAnchor="middle" fill="#fff" fontSize="9" fontFamily="monospace" fontWeight="800">D</text>
      </svg>
    </div>
  );
}

function NewDrawingDialog({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (d: any) => void }) {
  const { lang } = useLkl();
  const [form, setForm] = useState({
    number: "", title: "", titleBm: "", category: "ACMV", version: "00",
    material: "—", mass: "0", description: "", descriptionBm: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    setErr(null);
    if (!form.number || !form.title) {
      setErr(lang === "bm" ? "Nombor dan tajuk diperlukan" : "Number and title are required");
      return;
    }
    setCreating(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      fd.append("drawnBy", "SHZ");
      if (file) fd.append("file", file);
      const res = await fetch("/api/drawings", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Failed");
      onCreated(data.drawing);
      setForm({ number: "", title: "", titleBm: "", category: "ACMV", version: "00", material: "—", mass: "0", description: "", descriptionBm: "" });
      setFile(null);
      onClose();
    } catch (e: any) {
      setErr(e?.message || "Error");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900">
            <Plus className="w-4 h-4 text-blue-700" />
            {t("newDrawing.title", lang)}
          </DialogTitle>
          <DialogDescription>{t("newDrawing.subtitle", lang)}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
          <div>
            <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">{t("newDrawing.number", lang)}</label>
            <input
              className="lkl-input lkl-mono mt-1"
              placeholder="FAC118-M-ACMV-C-G-005"
              value={form.number}
              onChange={(e) => setForm({ ...form, number: e.target.value.toUpperCase() })}
            />
            <div className="text-[10px] text-slate-400 mt-0.5 lkl-mono">{t("newDrawing.numberHint", lang)}</div>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">{t("newDrawing.category", lang)}</label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger className="mt-1 lkl-input lkl-mono">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((c) => (
                  <SelectItem key={c} value={c}>{tCategory(c, lang)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">{t("newDrawing.title2", lang)}</label>
            <input className="lkl-input mt-1" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">{t("newDrawing.titleBm", lang)}</label>
            <input className="lkl-input mt-1" value={form.titleBm} onChange={(e) => setForm({ ...form, titleBm: e.target.value })} />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">{t("newDrawing.version", lang)}</label>
            <input className="lkl-input lkl-mono mt-1" value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">{t("newDrawing.material", lang)}</label>
            <input className="lkl-input mt-1" value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">{t("newDrawing.description", lang)}</label>
            <textarea
              className="lkl-input mt-1 min-h-[60px]"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">{t("newDrawing.initialFile", lang)}</label>
            <input
              type="file"
              className="mt-1 w-full text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 file:font-semibold"
              accept=".dwg,.pdf,.step,.stl,.igs,.jpg,.png,.zip"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            {file && <div className="text-[10px] text-slate-500 mt-0.5 lkl-mono">{file.name} · {(file.size / 1024).toFixed(1)} KB</div>}
          </div>
        </div>

        {err && <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1">{err}</div>}

        <div className="flex justify-end gap-2 pt-1">
          <button className="lkl-btn lkl-btn-ghost" onClick={onClose} disabled={creating}>
            {t("newDrawing.cancel", lang)}
          </button>
          <button className="lkl-btn lkl-btn-primary disabled:opacity-60" onClick={submit} disabled={creating}>
            {creating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> {t("newDrawing.creating", lang)}
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" /> {t("newDrawing.create", lang)}
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function Drawings() {
  const { lang, openDrawing } = useLkl();
  const [drawings, setDrawings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [catFilter, setCatFilter] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const reload = () => setReloadKey((k) => k + 1);

  useEffect(() => {
    let alive = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetch("/api/drawings")
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        setDrawings(d.drawings ?? []);
        setLoading(false);
      })
      .catch(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [reloadKey]);

  const filtered = drawings.filter((d) => {
    const q = query.toLowerCase();
    if (q && !`${d.number} ${d.title} ${d.titleBm} ${d.category}`.toLowerCase().includes(q)) return false;
    if (statusFilter && d.status !== statusFilter) return false;
    if (catFilter && d.category !== catFilter) return false;
    return true;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="lkl-eyebrow mb-1">FAC118 · NCT LAND GERBANG</div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {lang === "bm" ? "Lukisan M&E" : "M&E Drawings"}
          </h1>
        </div>
        <button className="lkl-btn lkl-btn-primary" onClick={() => setShowNew(true)}>
          <Plus className="w-4 h-4" /> {t("drawings.new", lang)}
        </button>
      </div>

      {/* Filters */}
      <GlassCard>
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className="lkl-input pl-9"
              placeholder={t("drawings.search", lang)}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700" onClick={() => setQuery("")}>
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              className={`lkl-chip cursor-pointer ${!statusFilter ? "lkl-chip-draft" : "border-slate-200 bg-white text-slate-500"}`}
              onClick={() => setStatusFilter(null)}
            >
              {t("drawings.all", lang)}
            </button>
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(statusFilter === s ? null : s)}
                className={`lkl-chip cursor-pointer ${statusFilter === s ? "" : "opacity-50 hover:opacity-100"}`}
              >
                <span className={statusFilter === s ? statusChipCls(s) : ""}>
                  {tStatus(s, lang)} ({drawings.filter((d) => d.status === s).length})
                </span>
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              className={`lkl-mono text-[11px] px-2 py-0.5 rounded border ${!catFilter ? "border-blue-600/30 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-500"}`}
              onClick={() => setCatFilter(null)}
            >
              {t("drawings.all", lang)}
            </button>
            {CATEGORY_OPTIONS.map((c) => (
              <button
                key={c}
                onClick={() => setCatFilter(catFilter === c ? null : c)}
                className={`lkl-mono text-[11px] px-2 py-0.5 rounded border ${catFilter === c ? "border-blue-600/30 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-500 hover:border-slate-400"}`}
              >
                {tCategory(c, lang)}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="lkl-card p-4 h-72 animate-pulse bg-slate-100" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <GlassCard className="text-center py-12">
          <div className="text-slate-500 text-sm">{t("drawings.empty", lang)}</div>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((d) => (
            <button
              key={d.id}
              className="lkl-card p-4 text-left hover:border-blue-400 hover:shadow-md transition-all group"
              onClick={() => openDrawing(d.id, d.number)}
            >
              <Thumb category={d.category} />
              <div className="mt-3 flex items-center justify-between gap-2">
                <div className="lkl-mono text-xs font-bold text-blue-700 truncate">{d.number}</div>
                <VersionBadge version={d.version} />
              </div>
              <div className="text-sm font-semibold text-slate-900 mt-1 line-clamp-2 leading-snug">
                {lang === "bm" ? d.titleBm : d.title}
              </div>
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <StatusChip status={d.status} lang={lang} />
                <CategoryTag category={d.category} lang={lang} />
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 lkl-mono">
                <span>{d._count?.files ?? d.files?.length ?? 0} files</span>
                <span className="text-blue-700 group-hover:translate-x-0.5 transition-transform">→</span>
              </div>
            </button>
          ))}
        </div>
      )}

      <NewDrawingDialog
        open={showNew}
        onClose={() => setShowNew(false)}
        onCreated={(d) => {
          reload();
          openDrawing(d.id, d.number);
        }}
      />
    </div>
  );
}

function statusChipCls(s: string): string {
  return (
    s === "Draft" ? "lkl-chip-draft" :
    s === "For Review" ? "lkl-chip-forreview" :
    s === "Submission" ? "lkl-chip-submission" :
    s === "Tender" ? "lkl-chip-tender" :
    s === "Construction" ? "lkl-chip-construction" :
    s === "As-Built" ? "lkl-chip-asbuilt" :
    s === "Approved" ? "lkl-chip-approved" :
    s === "Released" ? "lkl-chip-released" :
    s === "Obsolete" ? "lkl-chip-obsolete" : "lkl-chip-draft"
  );
}
