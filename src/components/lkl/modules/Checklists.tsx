"use client";
import { useEffect, useState } from "react";
import { GlassCard, SectionHeader } from "../ui/glass";
import { VersionBadge, StatusChip } from "../ui/badges";
import { useLkl } from "@/lib/store";
import { t } from "@/lib/i18n";
import { ListChecks, ChevronDown, ChevronRight, Check, Loader2 } from "lucide-react";

const CATS = ["Dimensional", "Documentation", "Manufacturing", "Quality"] as const;

export function Checklists() {
  const { lang, openDrawing } = useLkl();
  const [drawings, setDrawings] = useState<any[]>([]);
  const [itemsByDrawing, setItemsByDrawing] = useState<Record<string, any[]>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/drawings")
      .then((r) => r.json())
      .then(async (d) => {
        const drs = d.drawings ?? [];
        setDrawings(drs);
        const all = await Promise.all(
          drs.map((dr: any) => fetch(`/api/checklists?drawingId=${dr.id}`).then((r) => r.json())),
        );
        const map: Record<string, any[]> = {};
        drs.forEach((dr: any, i: number) => {
          map[dr.id] = all[i].items ?? [];
        });
        setItemsByDrawing(map);
        // expand first 3
        const exp: Record<string, boolean> = {};
        drs.slice(0, 3).forEach((dr: any) => (exp[dr.id] = true));
        setExpanded(exp);
        setLoading(false);
      });
  }, []);

  const toggle = async (id: string, drawingId: string) => {
    setToggling(id);
    await fetch(`/api/checklists/${id}/toggle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: "SHZ" }),
    });
    setItemsByDrawing((prev) => ({
      ...prev,
      [drawingId]: (prev[drawingId] ?? []).map((it) =>
        it.id === id ? { ...it, checked: !it.checked, checkedBy: !it.checked ? "SHZ" : null, checkedAt: !it.checked ? new Date().toISOString() : null } : it,
      ),
    }));
    setToggling(null);
  };

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
        <div className="lkl-eyebrow mb-1">FAC118 · REVIEW CHECKLISTS</div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{t("chk.title", lang)}</h1>
        <p className="text-xs text-slate-500 mt-1">{t("chk.subtitle", lang)}</p>
      </div>

      <div className="space-y-2">
        {drawings.map((d) => {
          const items = itemsByDrawing[d.id] ?? [];
          const done = items.filter((i) => i.checked).length;
          const pct = items.length ? Math.round((done / items.length) * 100) : 0;
          const isOpen = expanded[d.id];
          return (
            <GlassCard key={d.id} className="p-0 overflow-hidden">
              <button
                className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 text-left"
                onClick={() => setExpanded({ ...expanded, [d.id]: !isOpen })}
              >
                {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="lkl-mono text-xs font-bold text-blue-700 truncate">{d.number}</span>
                    <VersionBadge version={d.version} />
                    <StatusChip status={d.status} lang={lang} />
                  </div>
                  <div className="text-xs text-slate-700 truncate mt-0.5">{lang === "bm" ? d.titleBm : d.title}</div>
                </div>
                <div className="hidden sm:flex items-center gap-2 w-48 shrink-0">
                  <div className="h-1.5 flex-1 rounded-full bg-slate-100 overflow-hidden">
                    <div className={`h-full transition-all ${pct === 100 ? "bg-emerald-500" : "bg-blue-600"}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="lkl-mono text-[11px] font-semibold text-slate-700 shrink-0">{done}/{items.length}</span>
                  <span className="lkl-mono text-[11px] text-slate-400 shrink-0">{pct}%</span>
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-slate-100 p-3 space-y-3 bg-slate-50/40">
                  {CATS.map((cat) => {
                    const catItems = items.filter((i) => i.category === cat);
                    if (catItems.length === 0) return null;
                    const catDone = catItems.filter((i) => i.checked).length;
                    return (
                      <div key={cat}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="lkl-eyebrow text-slate-700">{t(`chk.cat.${cat}`, lang)}</span>
                          <span className="lkl-mono text-[10px] text-slate-500">{catDone}/{catItems.length}</span>
                        </div>
                        <ul className="space-y-1">
                          {catItems.map((it) => (
                            <li key={it.id}>
                              <button
                                className={`w-full flex items-start gap-2.5 p-2 rounded border transition-colors text-left ${
                                  it.checked
                                    ? "border-emerald-200 bg-emerald-50/40"
                                    : "border-slate-200 bg-white hover:border-blue-400"
                                } ${toggling === it.id ? "opacity-60" : ""}`}
                                onClick={() => toggle(it.id, d.id)}
                                disabled={toggling === it.id}
                              >
                                <span className={`w-4 h-4 mt-0.5 rounded grid place-items-center text-[9px] shrink-0 ${
                                  it.checked ? "bg-emerald-500 text-white" : "bg-white border border-slate-300 text-transparent"
                                }`}>
                                  {toggling === it.id ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Check className="w-3 h-3" />}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <div className={`text-xs ${it.checked ? "text-slate-500 line-through" : "text-slate-800"}`}>
                                    {lang === "bm" ? it.labelBm : it.label}
                                  </div>
                                  {it.checked && it.checkedBy && (
                                    <div className="text-[10px] text-slate-400 lkl-mono mt-0.5">
                                      ✓ {it.checkedBy} · {it.checkedAt ? new Date(it.checkedAt).toISOString().slice(0, 10) : ""}
                                    </div>
                                  )}
                                </div>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                  <button
                    className="lkl-btn lkl-btn-ghost text-xs w-full"
                    onClick={() => openDrawing(d.id, d.number)}
                  >
                    <ListChecks className="w-3.5 h-3.5" /> {lang === "bm" ? "Buka detail lukisan" : "Open drawing detail"}
                  </button>
                </div>
              )}
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
