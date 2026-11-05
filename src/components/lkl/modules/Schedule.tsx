"use client";
import { useEffect, useState } from "react";
import { GlassCard, SectionHeader, StatTile } from "../ui/glass";
import { StatusChip, VersionBadge } from "../ui/badges";
import { useLkl } from "@/lib/store";
import { t } from "@/lib/i18n";
import { ClipboardList, Building2, HardHat, MapPin, Trees, Wrench, Zap, ChevronRight, HardDrive } from "lucide-react";

// All disciplines the project department manages
const DISCIPLINES = [
  { key: "Architectural", label: "Architectural", labelBm: "Senibina", icon: Building2, color: "text-blue-600" },
  { key: "Structural",   label: "Structural",    labelBm: "Struktur",  icon: HardHat,   color: "text-amber-600" },
  { key: "Civil",        label: "Civil",         labelBm: "Awam",      icon: MapPin,    color: "text-slate-600" },
  { key: "Site",         label: "Site / Survey", labelBm: "Tapak",     icon: MapPin,    color: "text-emerald-600" },
  { key: "Landscape",    label: "Landscape",     labelBm: "Landskap",  icon: Trees,     color: "text-green-600" },
  { key: "ACMV",         label: "ACMV",          labelBm: "ACMV",      icon: Wrench,    color: "text-cyan-600" },
  { key: "CWSP",         label: "CWSP",          labelBm: "CWSP",      icon: Wrench,    color: "text-cyan-600" },
  { key: "FPS",          label: "Fire Protection", labelBm: "Kebakaran", icon: Wrench,  color: "text-red-600" },
  { key: "General",      label: "General (M)",   labelBm: "Am (M)",    icon: Wrench,    color: "text-slate-500" },
  { key: "Infrastructure", label: "Infrastructure", labelBm: "Infrastruktur", icon: Zap, color: "text-purple-600" },
  { key: "Lighting",     label: "Lighting",      labelBm: "Pencahayaan", icon: Zap,     color: "text-yellow-600" },
  { key: "Small Power",  label: "Small Power",   labelBm: "Kuasa Kecil", icon: Zap,     color: "text-orange-600" },
  { key: "DB/SLD",       label: "DB / SLD",      labelBm: "DB / SLD",  icon: Zap,       color: "text-purple-600" },
  { key: "LPS",          label: "Lightning Protection", labelBm: "Perlindungan Kilat", icon: Zap, color: "text-indigo-600" },
  { key: "TNB",          label: "TNB / Electrical", labelBm: "TNB / Elektrikal", icon: Zap, color: "text-blue-600" },
];

// Group disciplines into broad categories for summary tiles
function broadCategory(cat: string): "arch" | "str" | "civil" | "mech" | "elec" | "other" {
  if (cat === "Architectural") return "arch";
  if (cat === "Structural") return "str";
  if (["Civil", "Site", "Landscape"].includes(cat)) return "civil";
  if (["ACMV", "CWSP", "FPS", "General"].includes(cat)) return "mech";
  if (["Infrastructure", "Lighting", "Small Power", "DB/SLD", "LPS", "TNB"].includes(cat)) return "elec";
  return "other";
}

function Row({ d, idx, lang, onOpen }: { d: any; idx: number; lang: "en" | "bm"; onOpen: () => void }) {
  const fileCount = d._count?.files ?? d.files?.length ?? 0;
  return (
    <tr className="border-b border-slate-100 hover:bg-blue-50/40 cursor-pointer transition-colors" onClick={onOpen}>
      <td className="px-2 py-2 text-xs lkl-mono text-slate-500 w-10">{idx}</td>
      <td className="px-2 py-2 text-xs text-slate-700 truncate max-w-[300px]">{lang === "bm" ? d.titleBm : d.title}</td>
      <td className="px-2 py-2 text-xs lkl-mono font-semibold text-blue-700 whitespace-nowrap">{d.number}</td>
      <td className="px-2 py-2"><VersionBadge version={d.version} /></td>
      <td className="px-2 py-2"><StatusChip status={d.status} lang={lang} /></td>
      <td className="px-2 py-2 text-xs lkl-mono text-slate-600 text-center">{fileCount}</td>
      <td className="px-2 py-2 text-slate-400"><ChevronRight className="w-4 h-4" /></td>
    </tr>
  );
}

function SystemBlock({ sysLabel, children }: { sysLabel: string; children: React.ReactNode }) {
  return (
    <>
      <tr>
        <td colSpan={7} className="px-2 py-1.5 bg-blue-50/60 border-y border-blue-100">
          <span className="lkl-mono text-[11px] font-bold text-blue-700 uppercase tracking-wider">{sysLabel}</span>
        </td>
      </tr>
      {children}
    </>
  );
}

export function Schedule() {
  const { lang, openDrawing } = useLkl();
  const [drawings, setDrawings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/drawings").then((r) => r.json()).then((d) => { setDrawings(d.drawings ?? []); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="lkl-card p-4 h-12 animate-pulse bg-slate-100" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="lkl-card p-5 h-24 animate-pulse bg-slate-100" />)}</div>
      </div>
    );
  }

  const totalFiles = drawings.reduce((s, d) => s + (d._count?.files ?? d.files?.length ?? 0), 0);
  const counts = {
    arch: drawings.filter((d) => broadCategory(d.category) === "arch").length,
    str: drawings.filter((d) => broadCategory(d.category) === "str").length,
    civil: drawings.filter((d) => broadCategory(d.category) === "civil").length,
    mech: drawings.filter((d) => broadCategory(d.category) === "mech").length,
    elec: drawings.filter((d) => broadCategory(d.category) === "elec").length,
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="lkl-eyebrow mb-1">FAC118 — NCT LAND MANAGED INDUSTRIAL PARK</div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{t("schedule.title", lang)}</h1>
        <p className="text-xs text-slate-500 mt-1">{t("schedule.subtitle", lang)}</p>
      </div>

      {/* Summary tiles — by broad discipline */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile label={t("schedule.total", lang)} value={drawings.length} accent="blue" icon={<ClipboardList className="w-5 h-5" />} />
        <StatTile label={lang === "bm" ? "Mekanikal" : "Mechanical"} value={counts.mech} sublabel="ACMV · CWSP · FPS" accent="cyan" icon={<Wrench className="w-5 h-5" />} />
        <StatTile label={lang === "bm" ? "Elektrikal" : "Electrical"} value={counts.elec} sublabel="Light · Power · SLD · LPS · TNB" accent="amber" icon={<Zap className="w-5 h-5" />} />
        <StatTile label={lang === "bm" ? "Lain-lain" : "Other disciplines"} value={counts.arch + counts.str + counts.civil} sublabel="Arch · Str · Civil · Site" accent="green" icon={<Building2 className="w-5 h-5" />} />
      </div>

      {/* All disciplines in one table */}
      <GlassCard>
        <SectionHeader eyebrow="ALL DISCIPLINES" title={lang === "bm" ? "Semua disiplin" : "All disciplines"} />
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <th className="px-2 py-2 font-semibold">{t("schedule.col.no", lang)}</th>
                <th className="px-2 py-2 font-semibold">{t("schedule.col.title", lang)}</th>
                <th className="px-2 py-2 font-semibold">{t("schedule.col.number", lang)}</th>
                <th className="px-2 py-2 font-semibold">{t("schedule.col.rev", lang)}</th>
                <th className="px-2 py-2 font-semibold">{t("schedule.col.status", lang)}</th>
                <th className="px-2 py-2 font-semibold text-center">{t("schedule.col.files", lang)}</th>
                <th className="px-2 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {DISCIPLINES.map((disc) => {
                const rows = drawings.filter((d) => d.category === disc.key);
                if (rows.length === 0) return null;
                const Icon = disc.icon;
                return (
                  <SystemBlock key={disc.key} sysLabel={`${lang === "bm" ? disc.labelBm : disc.label} (${rows.length})`}>
                    {rows.map((d, i) => (
                      <Row key={d.id} d={d} idx={i + 1} lang={lang} onOpen={() => openDrawing(d.id, d.number)} />
                    ))}
                  </SystemBlock>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
