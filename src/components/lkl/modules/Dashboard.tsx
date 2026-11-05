"use client";
import { useEffect, useState } from "react";
import { GlassCard, SectionHeader, StatTile } from "../ui/glass";
import { StatusChip, VersionBadge, CategoryTag } from "../ui/badges";
import { timeAgo, fmtDateTime } from "../ui/time";
import { useLkl, ROLES } from "@/lib/store";
import { t, tStatus } from "@/lib/i18n";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area, XAxis as AX, YAxis as AY,
} from "recharts";
import { FileStack, HardDrive, ListChecks, Users, ArrowRight, Activity } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  Draft: "#0066b4", "For Review": "#d97706", Submission: "#6d28d9", Tender: "#be185d",
  Construction: "#044a80", "As-Built": "#0f766e", Approved: "#059669", Released: "#044a80", Obsolete: "#c8102e",
};

type DashData = {
  totalDrawings: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
  totalFiles: number;
  totalSizeKb: number;
  openChecklist: number;
  activeUsers: number;
  statusOrder: string[];
  categoryOrder: string[];
  uploadSeries: { date: string; count: number; sizeKb: number }[];
  recentAudit: any[];
  drawings: any[];
};

export function Dashboard() {
  const { lang, openDrawing, role } = useLkl();
  const currentRole = ROLES.find((r) => r.id === role);
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => alive && (setData(d), setLoading(false)))
      .catch(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  if (loading || !data) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="lkl-card p-5 h-32 animate-pulse bg-slate-100" />
        ))}
      </div>
    );
  }

  const statusData = data.statusOrder
    .map((s) => ({ name: tStatus(s, lang), key: s, value: data.byStatus[s] ?? 0, color: STATUS_COLORS[s] }))
    .filter((d) => d.value > 0);
  const catData = data.categoryOrder
    .map((c) => ({ name: c, value: data.byCategory[c] ?? 0 }))
    .filter((d) => d.value > 0);
  const uploadFmt = data.uploadSeries.map((u) => ({
    ...u,
    label: u.date.slice(5),
  }));

  const totalSizeMb = (data.totalSizeKb / 1024).toFixed(1);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="lkl-eyebrow mb-1">NCT GROUP · MANAGED INDUSTRIAL PARK</div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{t("dash.title", lang)}</h1>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-500 lkl-mono uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 lkl-blink" />
          LIVE · {fmtDateTime(new Date(), lang)}
        </div>
      </div>

      {/* Role welcome banner */}
      {currentRole && (
        <div className="lkl-card p-3 flex items-center gap-3 border-l-4" style={{ borderLeftColor: role === "superadmin" ? "#334155" : role === "architect" ? "#0066b4" : role === "technical" ? "#6366f1" : role === "me" ? "#06b6d4" : role === "qs" ? "#d97706" : role === "salesAdmin" ? "#a855f7" : "#ec4899" }}>
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${currentRole.color} text-white grid place-items-center text-sm font-bold shrink-0`}>
            {currentRole.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">
              {lang === "bm" ? `Selamat datang, ${currentRole.name}` : `Welcome, ${currentRole.name}`}
            </div>
            <div className="text-xs text-slate-500">
              {lang === "bm" ? currentRole.labelBm : currentRole.label}
              {currentRole.step && ` · ${lang === "bm" ? "Langkah" : "Step"} ${currentRole.step}`}
              {role === "superadmin" && ` · ${lang === "bm" ? "Akses penuh" : "Full access"}`}
            </div>
          </div>
        </div>
      )}

      {/* Stat tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile
          label={t("dash.totalDrawings", lang)}
          value={data.totalDrawings}
          sublabel="FAC118"
          accent="blue"
          icon={<FileStack className="w-5 h-5" />}
        />
        <StatTile
          label={t("dash.filesStored", lang)}
          value={data.totalFiles}
          sublabel={`${totalSizeMb} MB`}
          accent="cyan"
          icon={<HardDrive className="w-5 h-5" />}
        />
        <StatTile
          label={t("dash.openChecklist", lang)}
          value={data.openChecklist}
          sublabel={lang === "bm" ? "Perlu semakan" : "Need review"}
          accent="amber"
          icon={<ListChecks className="w-5 h-5" />}
        />
        <StatTile
          label={t("dash.activeUsers", lang)}
          value={data.activeUsers}
          sublabel={lang === "bm" ? "Pereka & Jurutera" : "Designers & Engineers"}
          accent="green"
          icon={<Users className="w-5 h-5" />}
        />
      </div>

      {/* Status strip */}
      <GlassCard>
        <SectionHeader eyebrow={t("dash.byStatus", lang)} title={lang === "bm" ? "Pengagihan status" : "Status distribution"} />
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
          {data.statusOrder.map((s) => {
            const count = data.byStatus[s] ?? 0;
            const pct = data.totalDrawings ? Math.round((count / data.totalDrawings) * 100) : 0;
            return (
              <button
                key={s}
                className="flex flex-col items-start p-2 rounded-md border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 transition-colors text-left"
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[s] }} />
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider truncate">
                    {tStatus(s, lang)}
                  </span>
                </div>
                <div className="lkl-stat-number text-lg text-slate-900 mt-0.5">{count}</div>
                <div className="text-[10px] text-slate-400 lkl-mono">{pct}%</div>
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <GlassCard>
          <SectionHeader eyebrow={t("dash.byStatus", lang)} title={lang === "bm" ? "Leduang status" : "Status donut"} />
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={48} outerRadius={84} paddingAngle={2}>
                {statusData.map((d, i) => (
                  <Cell key={i} fill={d.color} stroke="#fff" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "#fff", border: "1px solid #d4dbe6", borderRadius: 6, fontSize: 12 }}
                labelStyle={{ color: "#0a1828", fontWeight: 700 }}
              />
              <Legend wrapperStyle={{ fontSize: 11, color: "#5a6a82" }} />
            </PieChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard>
          <SectionHeader eyebrow={t("dash.byCategory", lang)} title={lang === "bm" ? "Leduang kategori" : "Category bar"} />
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={catData} margin={{ top: 5, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid stroke="#d4dbe6" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#5a6a82", fontSize: 10 }} axisLine={{ stroke: "#d4dbe6" }} tickLine={false} />
              <YAxis tick={{ fill: "#5a6a82", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#fff", border: "1px solid #d4dbe6", borderRadius: 6, fontSize: 12 }}
                cursor={{ fill: "rgba(0,102,180,0.06)" }}
              />
              <Bar dataKey="value" fill="#0066b4" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard>
          <SectionHeader eyebrow={t("dash.uploadActivity", lang)} title={lang === "bm" ? "Trend muat naik" : "Upload trend"} />
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={uploadFmt} margin={{ top: 5, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="ul" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0066b4" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#0066b4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#d4dbe6" strokeDasharray="3 3" vertical={false} />
              <AX dataKey="label" tick={{ fill: "#5a6a82", fontSize: 9 }} axisLine={{ stroke: "#d4dbe6" }} tickLine={false} interval={4} />
              <AY tick={{ fill: "#5a6a82", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: "#fff", border: "1px solid #d4dbe6", borderRadius: 6, fontSize: 12 }}
                labelStyle={{ color: "#0a1828", fontWeight: 700 }}
              />
              <Area type="monotone" dataKey="count" stroke="#0066b4" strokeWidth={2} fill="url(#ul)" />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {/* Recent drawings + audit feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <GlassCard className="lg:col-span-2">
          <SectionHeader
            eyebrow={t("dash.recentDrawings", lang)}
            title={lang === "bm" ? "Lukisan terkini" : "Latest drawings"}
            action={
              <button className="lkl-btn lkl-btn-ghost text-xs" onClick={() => (window.location.hash = "drawings")}>
                {lang === "bm" ? "Lihat semua" : "View all"} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            }
          />
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className="px-2 py-2 font-semibold">{t("col.drawingNo", lang)}</th>
                  <th className="px-2 py-2 font-semibold hidden sm:table-cell">{t("col.title", lang)}</th>
                  <th className="px-2 py-2 font-semibold">{t("col.version", lang)}</th>
                  <th className="px-2 py-2 font-semibold hidden md:table-cell">{t("col.status", lang)}</th>
                  <th className="px-2 py-2 font-semibold hidden lg:table-cell">{t("col.updated", lang)}</th>
                </tr>
              </thead>
              <tbody>
                {data.drawings.slice(0, 7).map((d) => (
                  <tr
                    key={d.id}
                    className="border-b border-slate-100 hover:bg-blue-50/40 cursor-pointer transition-colors"
                    onClick={() => openDrawing(d.id, d.number)}
                  >
                    <td className="px-2 py-2.5 lkl-mono text-[11px] font-semibold text-blue-700">{d.number}</td>
                    <td className="px-2 py-2.5 text-slate-700 truncate max-w-[260px] hidden sm:table-cell">{lang === "bm" ? d.titleBm : d.title}</td>
                    <td className="px-2 py-2.5"><VersionBadge version={d.version} /></td>
                    <td className="px-2 py-2.5 hidden md:table-cell"><StatusChip status={d.status} lang={lang} /></td>
                    <td className="px-2 py-2.5 text-[11px] text-slate-500 lkl-mono hidden lg:table-cell">{timeAgo(d.updatedAt, lang)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        <GlassCard>
          <SectionHeader eyebrow={t("dash.recentAudit", lang)} title={lang === "bm" ? "Suapan audit" : "Audit feed"} />
          <div className="relative max-h-80 overflow-y-auto pr-1">
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-slate-200" />
            <ul className="space-y-3">
              {data.recentAudit.map((a) => (
                <li key={a.id} className="relative pl-6">
                  <span className="absolute left-[3px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue-600 ring-2 ring-blue-100 lkl-pulse" />
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="lkl-mono font-semibold text-slate-600">{a.user}</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[9px] uppercase tracking-wider text-slate-600">
                      {a.action}
                    </span>
                    <span className="ml-auto lkl-mono">{timeAgo(a.createdAt, lang)}</span>
                  </div>
                  <div className="text-xs text-slate-700 mt-0.5 leading-snug">{a.detail}</div>
                  {a.drawing && (
                    <div className="text-[10px] text-blue-700 lkl-mono mt-0.5">{a.drawing.number}</div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
