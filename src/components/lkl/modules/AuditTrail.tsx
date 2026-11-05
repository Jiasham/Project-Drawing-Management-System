"use client";
import { useEffect, useState } from "react";
import { GlassCard, SectionHeader } from "../ui/glass";
import { useLkl } from "@/lib/store";
import { t } from "@/lib/i18n";
import { timeAgo, fmtDateTime } from "../ui/time";
import { History as HistoryIcon, Search, X, Loader2 } from "lucide-react";

const ACTION_COLORS: Record<string, string> = {
  status_change: "border-blue-200 bg-blue-50 text-blue-700",
  upload: "border-emerald-200 bg-emerald-50 text-emerald-700",
  checklist_tick: "border-emerald-200 bg-emerald-50 text-emerald-700",
  checklist_untick: "border-amber-200 bg-amber-50 text-amber-700",
  version_bump: "border-purple-200 bg-purple-50 text-purple-700",
  login: "border-slate-200 bg-slate-100 text-slate-600",
  create: "border-cyan-200 bg-cyan-50 text-cyan-700",
};

const ACTION_LABEL: Record<string, { en: string; bm: string }> = {
  status_change: { en: "Status change", bm: "Perubahan status" },
  upload: { en: "Upload", bm: "Muat naik" },
  checklist_tick: { en: "Checklist tick", bm: "Tanda senarai" },
  checklist_untick: { en: "Checklist untick", bm: "Nyahtanda senarai" },
  version_bump: { en: "Version bump", bm: "Bump versi" },
  login: { en: "Login", bm: "Log masuk" },
  create: { en: "Create", bm: "Cipta" },
};

export function AuditTrail() {
  const { lang } = useLkl();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [userFilter, setUserFilter] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/audit?limit=200")
      .then((r) => r.json())
      .then((d) => {
        setItems(d.items ?? []);
        setLoading(false);
      });
  }, []);

  const users = Array.from(new Set(items.map((i) => i.user)));
  const actions = Array.from(new Set(items.map((i) => i.action)));

  const filtered = items.filter((i) => {
    if (userFilter && i.user !== userFilter) return false;
    if (actionFilter && i.action !== actionFilter) return false;
    if (query) {
      const q = query.toLowerCase();
      if (!`${i.detail} ${i.user} ${i.action} ${i.drawing?.number || ""}`.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="lkl-card p-4 h-12 animate-pulse bg-slate-100" />
        <div className="lkl-card h-96 animate-pulse bg-slate-100" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="lkl-eyebrow mb-1">FAC118 · COMPLETE AUDIT LOG</div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{t("audit.title", lang)}</h1>
        <p className="text-xs text-slate-500 mt-1">{t("audit.subtitle", lang)}</p>
      </div>

      <GlassCard>
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className="lkl-input pl-9"
              placeholder={lang === "bm" ? "Cari audit…" : "Search audit…"}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700" onClick={() => setQuery("")}>
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className={`lkl-mono text-[11px] px-2 py-0.5 rounded border ${!userFilter ? "border-blue-600/30 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-500"}`}
              onClick={() => setUserFilter(null)}
            >
              {t("drawings.all", lang)} users
            </button>
            {users.map((u) => (
              <button
                key={u}
                onClick={() => setUserFilter(userFilter === u ? null : u)}
                className={`lkl-mono text-[11px] px-2 py-0.5 rounded border ${userFilter === u ? "border-blue-600/30 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-500 hover:border-slate-400"}`}
              >
                {u}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className={`lkl-mono text-[11px] px-2 py-0.5 rounded border ${!actionFilter ? "border-blue-600/30 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-500"}`}
              onClick={() => setActionFilter(null)}
            >
              {t("drawings.all", lang)} actions
            </button>
            {actions.map((a) => (
              <button
                key={a}
                onClick={() => setActionFilter(actionFilter === a ? null : a)}
                className={`lkl-mono text-[11px] px-2 py-0.5 rounded border ${actionFilter === a ? "border-blue-600/30 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-500 hover:border-slate-400"}`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <SectionHeader
          eyebrow={`${filtered.length} ${lang === "bm" ? "entri" : "entries"}`}
          title={lang === "bm" ? "Jejak audit" : "Audit timeline"}
        />
        <div className="relative max-h-[600px] overflow-y-auto pr-1">
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-slate-200" />
          <ul className="space-y-2">
            {filtered.map((a) => (
              <li key={a.id} className="relative pl-6">
                <span className="absolute left-[3px] top-2 w-2.5 h-2.5 rounded-full bg-blue-600 ring-2 ring-blue-100" />
                <div className="flex items-center gap-2 text-xs flex-wrap">
                  <span className="lkl-mono font-bold text-slate-700 w-12 shrink-0">{a.user}</span>
                  <span className={`px-1.5 py-0.5 rounded border text-[9px] uppercase tracking-wider font-bold ${ACTION_COLORS[a.action] || "border-slate-200 bg-slate-100 text-slate-600"}`}>
                    {ACTION_LABEL[a.action]?.[lang] || a.action}
                  </span>
                  {a.drawing && (
                    <span className="lkl-mono text-[10px] text-blue-700">{a.drawing.number}</span>
                  )}
                  <span className="ml-auto text-[10px] text-slate-400 lkl-mono shrink-0">{timeAgo(a.createdAt, lang)}</span>
                </div>
                <div className="text-xs text-slate-700 mt-0.5 leading-snug">{a.detail}</div>
                <div className="text-[10px] text-slate-400 lkl-mono">{fmtDateTime(a.createdAt, lang)}</div>
              </li>
            ))}
          </ul>
        </div>
      </GlassCard>
    </div>
  );
}
