"use client";
import { useEffect, useState } from "react";
import { GlassCard, SectionHeader, StatTile } from "../ui/glass";
import { VersionBadge } from "../ui/badges";
import { useLkl } from "@/lib/store";
import { t, tCategory } from "@/lib/i18n";
import { ListChecks, Hash, Weight, FolderTree, Loader2, Download } from "lucide-react";

export function AutoBOM() {
  const { lang } = useLkl();
  const [drawings, setDrawings] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [bom, setBom] = useState<{ drawing: any; bomItems: any[]; totals: any } | null>(null);

  useEffect(() => {
    fetch("/api/drawings")
      .then((r) => r.json())
      .then((d) => {
        // Show all drawings — user can pick any
        setDrawings(d.drawings ?? []);
        if (d.drawings?.[0]) setSelectedId(d.drawings[0].id);
        setLoading(false);
      });
  }, []);

  const generate = async () => {
    if (!selectedId || generating) return;
    setGenerating(true);
    setBom(null);
    try {
      const res = await fetch("/api/bom/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drawingId: selectedId, lang }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setBom(data);
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const csv = () => {
    if (!bom) return;
    const rows = [
      ["Part No.", "Description", "Qty", "Material", "Unit Mass (kg)", "Total Mass (kg)", "Category"],
      ...bom.bomItems.map((b) => [
        b.partNumber, b.description, b.qty, b.material || "—",
        (b.mass ?? 0).toFixed(2), ((b.mass ?? 0) * b.qty).toFixed(2), b.category || "—",
      ]),
      ["TOTAL", "", bom.totals.totalQty, "", "", bom.totals.totalMass.toFixed(2), ""],
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `BOM-${bom.drawing.number}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
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

  const selected = drawings.find((d) => d.id === selectedId);

  return (
    <div className="space-y-4">
      <div>
        <div className="lkl-eyebrow mb-1">FAC118 · AUTO BOM ENGINE</div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{t("bom.title", lang)}</h1>
        <p className="text-xs text-slate-500 mt-1">{t("bom.subtitle", lang)}</p>
      </div>

      {/* Drawing selector */}
      <GlassCard>
        <SectionHeader eyebrow={t("dc.selectDrawing", lang)} title={lang === "bm" ? "Pilih lukisan pemasangan" : "Pick a drawing"} />
        <div className="flex flex-wrap gap-2 items-center">
          <select
            className="lkl-input lkl-mono max-w-md"
            value={selectedId || ""}
            onChange={(e) => {
              setSelectedId(e.target.value);
              setBom(null);
            }}
          >
            {drawings.map((d) => (
              <option key={d.id} value={d.id}>{d.number} — {lang === "bm" ? d.titleBm : d.title}</option>
            ))}
          </select>
          {selected && <VersionBadge version={selected.version} />}
          <button className="lkl-btn lkl-btn-primary ml-auto" onClick={generate} disabled={generating || !selectedId}>
            {generating ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> {t("ai.thinking", lang)}</>
            ) : (
              <><ListChecks className="w-4 h-4" /> {t("bom.generate", lang)}</>
            )}
          </button>
        </div>
      </GlassCard>

      {/* Stats */}
      {bom ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatTile label={t("bom.col.qty", lang)} value={bom.totals.lineItems} accent="blue" icon={<Hash className="w-5 h-5" />} />
            <StatTile label="TOTAL QTY" value={bom.totals.totalQty} accent="cyan" icon={<ListChecks className="w-5 h-5" />} />
            <StatTile label="TOTAL MASS (kg)" value={bom.totals.totalMass.toFixed(2)} accent="amber" icon={<Weight className="w-5 h-5" />} />
            <StatTile label="CATEGORIES" value={bom.totals.categories.length} accent="green" icon={<FolderTree className="w-5 h-5" />} />
          </div>

          {/* BOM table */}
          <GlassCard>
            <SectionHeader
              eyebrow={`${bom.drawing.number} · V${bom.drawing.version}`}
              title={lang === "bm" ? bom.drawing.titleBm : bom.drawing.title}
              action={
                <button className="lkl-btn lkl-btn-ghost text-xs" onClick={csv}>
                  <Download className="w-3.5 h-3.5" /> CSV
                </button>
              }
            />
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <th className="px-2 py-2 font-semibold">{t("bom.col.partNo", lang)}</th>
                    <th className="px-2 py-2 font-semibold">{t("bom.col.description", lang)}</th>
                    <th className="px-2 py-2 font-semibold text-center">{t("bom.col.qty", lang)}</th>
                    <th className="px-2 py-2 font-semibold hidden sm:table-cell">{t("bom.col.material", lang)}</th>
                    <th className="px-2 py-2 font-semibold text-right">{t("bom.col.unitMass", lang)}</th>
                    <th className="px-2 py-2 font-semibold text-right">TOTAL (kg)</th>
                  </tr>
                </thead>
                <tbody>
                  {bom.bomItems.map((b) => (
                    <tr key={b.id} className="border-b border-slate-100 hover:bg-blue-50/40">
                      <td className="px-2 py-2 lkl-mono font-semibold text-blue-700">{b.partNumber}</td>
                      <td className="px-2 py-2 text-slate-700">{b.description}</td>
                      <td className="px-2 py-2 lkl-mono text-center font-semibold">{b.qty}</td>
                      <td className="px-2 py-2 text-slate-600 hidden sm:table-cell">{b.material || "—"}</td>
                      <td className="px-2 py-2 lkl-mono text-right text-slate-600">{(b.mass ?? 0).toFixed(2)}</td>
                      <td className="px-2 py-2 lkl-mono text-right font-semibold text-slate-900">{((b.mass ?? 0) * b.qty).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-300 bg-slate-50 font-bold">
                    <td className="px-2 py-2.5" colSpan={2}>TOTAL ({bom.totals.lineItems} {lang === "bm" ? "baris" : "items"})</td>
                    <td className="px-2 py-2.5 lkl-mono text-center">{bom.totals.totalQty}</td>
                    <td className="px-2 py-2.5 hidden sm:table-cell"></td>
                    <td className="px-2 py-2.5"></td>
                    <td className="px-2 py-2.5 lkl-mono text-right text-blue-700">{bom.totals.totalMass.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </GlassCard>
        </>
      ) : (
        <GlassCard className="text-center py-12">
          <ListChecks className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <div className="text-sm text-slate-500">
            {generating ? (lang === "bm" ? "Menjana BOM…" : "Generating BOM…") : (lang === "bm" ? "Pilih lukisan dan jana BOM" : "Pick a drawing and generate the BOM")}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
