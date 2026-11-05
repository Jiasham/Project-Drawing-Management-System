"use client";
import { useEffect, useState } from "react";
import { GlassCard, SectionHeader, StatTile } from "../ui/glass";
import { useLkl } from "@/lib/store";
import { t, tStatus } from "@/lib/i18n";
import { timeAgo } from "../ui/time";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { FileStack, HardDrive, History as HistoryIcon, ListChecks, Cpu, Settings } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  Draft: "#0066b4", "For Review": "#d97706", Submission: "#6d28d9", Tender: "#be185d",
  Construction: "#044a80", "As-Built": "#0f766e", Approved: "#059669", Released: "#044a80", Obsolete: "#c8102e",
};

const AVATAR_COLORS = ["from-blue-500 to-blue-700", "from-amber-500 to-amber-700", "from-emerald-500 to-emerald-700", "from-purple-500 to-purple-700"];

export function Admin() {
  const { lang } = useLkl();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, []);

  if (loading || !data) {
    return (
      <div className="space-y-4">
        <div className="lkl-card p-4 h-12 animate-pulse bg-slate-100" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="lkl-card p-5 h-24 animate-pulse bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  const statusData = Object.entries(data.byStatus)
    .map(([k, v]) => ({ name: tStatus(k, lang), value: v as number, color: STATUS_COLORS[k] }))
    .filter((d) => d.value > 0);
  const catData = Object.entries(data.byCategory)
    .map(([k, v]) => ({ name: k, value: v as number }))
    .filter((d) => d.value > 0);
  const fileTypeData = Object.entries(data.byFileType).map(([k, v]: [string, any]) => ({
    name: k.toUpperCase(),
    count: v.count,
    sizeMb: +(v.sizeKb / 1024).toFixed(2),
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-md bg-blue-50 border border-blue-200 grid place-items-center text-blue-700">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <div className="lkl-eyebrow mb-0.5">SYSTEM ADMINISTRATION</div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{t("admin.title", lang)}</h1>
          <p className="text-xs text-slate-500 mt-0.5">{t("admin.subtitle", lang)}</p>
        </div>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile label="DRAWINGS" value={data.systemStats.totalDrawings} accent="blue" icon={<FileStack className="w-5 h-5" />} />
        <StatTile label="FILES" value={data.systemStats.totalFiles} sublabel={`${(data.systemStats.totalSizeKb / 1024).toFixed(1)} MB`} accent="cyan" icon={<HardDrive className="w-5 h-5" />} />
        <StatTile label="AUDIT ENTRIES" value={data.systemStats.auditEntries} accent="amber" icon={<HistoryIcon className="w-5 h-5" />} />
        <StatTile label="CHECKLIST ITEMS" value={data.systemStats.checklistItems} accent="green" icon={<ListChecks className="w-5 h-5" />} />
      </div>

      {/* AI engine + storage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard tickCorners>
          <SectionHeader eyebrow={t("admin.ai", lang)} title="AI engine status" />
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="lkl-eyebrow">Engine</div>
              <div className="lkl-mono font-semibold text-slate-900 mt-0.5 flex items-center gap-1"><Cpu className="w-3.5 h-3.5 text-blue-700" />{data.ai.engine}</div>
            </div>
            <div>
              <div className="lkl-eyebrow">Model</div>
              <div className="lkl-mono font-semibold text-slate-900 mt-0.5">{data.ai.model}</div>
            </div>
            <div>
              <div className="lkl-eyebrow">Endpoint</div>
              <div className="lkl-mono font-semibold text-slate-900 mt-0.5">{data.ai.endpoint}</div>
            </div>
            <div>
              <div className="lkl-eyebrow">Timeout</div>
              <div className="lkl-mono font-semibold text-slate-900 mt-0.5">{data.ai.timeout}</div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="lkl-eyebrow mb-1.5">Capabilities</div>
            <div className="flex flex-wrap gap-1.5">
              {data.ai.capabilities.map((c: string) => (
                <span key={c} className="px-1.5 py-0.5 rounded border border-blue-200 bg-blue-50 text-blue-700 text-[10px] lkl-mono">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <SectionHeader eyebrow={t("admin.storage", lang)} title={lang === "bm" ? "Pecahan storan" : "Storage breakdown"} />
          {fileTypeData.length === 0 ? (
            <div className="text-xs text-slate-400 text-center py-6">{lang === "bm" ? "Tiada fail" : "No files"}</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={fileTypeData} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#d4dbe6" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fill: "#5a6a82", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: "#5a6a82", fontSize: 10 }} axisLine={false} tickLine={false} width={36} />
                <Tooltip
                  contentStyle={{ background: "#fff", border: "1px solid #d4dbe6", borderRadius: 6, fontSize: 12 }}
                  cursor={{ fill: "rgba(0,102,180,0.06)" }}
                />
                <Bar dataKey="count" fill="#0066b4" radius={[0, 3, 3, 0]} name="Files" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </GlassCard>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard>
          <SectionHeader eyebrow={t("dash.byStatus", lang)} title={lang === "bm" ? "Lukisan mengikut status" : "Drawings by status"} />
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={42} outerRadius={78} paddingAngle={2}>
                {statusData.map((d, i) => (
                  <Cell key={i} fill={d.color} stroke="#fff" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #d4dbe6", borderRadius: 6, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#5a6a82" }} />
            </PieChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard>
          <SectionHeader eyebrow={t("dash.byCategory", lang)} title={lang === "bm" ? "Lukisan mengikut kategori" : "Drawings by category"} />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={catData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid stroke="#d4dbe6" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#5a6a82", fontSize: 10 }} axisLine={{ stroke: "#d4dbe6" }} tickLine={false} />
              <YAxis tick={{ fill: "#5a6a82", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #d4dbe6", borderRadius: 6, fontSize: 12 }} cursor={{ fill: "rgba(0,102,180,0.06)" }} />
              <Bar dataKey="value" fill="#0066b4" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {/* Users */}
      <GlassCard>
        <SectionHeader eyebrow={t("admin.users", lang)} title={`${data.users.length} ${lang === "bm" ? "pengguna berdaftar" : "registered users"}`} />
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <th className="px-2 py-2 font-semibold">USER</th>
                <th className="px-2 py-2 font-semibold">EMAIL</th>
                <th className="px-2 py-2 font-semibold">ROLE</th>
                <th className="px-2 py-2 font-semibold hidden sm:table-cell">LAST SEEN</th>
                <th className="px-2 py-2 font-semibold text-center">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map((u: any, i: number) => (
                <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-2 py-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${AVATAR_COLORS[i % AVATAR_COLORS.length]} text-white grid place-items-center text-[10px] font-bold`}>
                        {u.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-xs font-semibold text-slate-900">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-2 py-2 lkl-mono text-[11px] text-slate-600">{u.email}</td>
                  <td className="px-2 py-2 text-xs text-slate-700">{u.role}</td>
                  <td className="px-2 py-2 text-[11px] text-slate-500 lkl-mono hidden sm:table-cell">{timeAgo(u.lastSeen, lang)}</td>
                  <td className="px-2 py-2 text-center">
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                      u.active ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500 border border-slate-200"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.active ? "bg-emerald-500" : "bg-slate-400"}`} />
                      {u.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
