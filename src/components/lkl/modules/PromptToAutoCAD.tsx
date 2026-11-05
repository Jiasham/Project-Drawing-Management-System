"use client";
import { useState } from "react";
import { GlassCard, SectionHeader } from "../ui/glass";
import { useLkl } from "@/lib/store";
import { t } from "@/lib/i18n";
import { PenTool, Loader2, Copy, Check, Download, Cpu } from "lucide-react";

type PartType = "plate" | "lbracket" | "castor" | "ivpole";

const PART_META: Record<PartType, { label_en: string; label_bm: string; fields: { key: string; label_en: string; label_bm: string; default: number }[] }> = {
  plate: {
    label_en: "Mounting Plate", label_bm: "Plat Pemasangan",
    fields: [
      { key: "width", label_en: "Width", label_bm: "Lebar", default: 150 },
      { key: "height", label_en: "Height", label_bm: "Tinggi", default: 150 },
      { key: "thickness", label_en: "Thickness", label_bm: "Ketebalan", default: 3 },
    ],
  },
  lbracket: {
    label_en: "L-Bracket", label_bm: "Penyangak L",
    fields: [
      { key: "width", label_en: "Width", label_bm: "Lebar", default: 100 },
      { key: "height", label_en: "Height", label_bm: "Tinggi", default: 80 },
      { key: "thickness", label_en: "Thickness", label_bm: "Ketebalan", default: 3 },
      { key: "flange", label_en: "Flange", label_bm: "Flange", default: 40 },
    ],
  },
  castor: {
    label_en: "Castor Wheel", label_bm: "Roda Castor",
    fields: [
      { key: "dia", label_en: "Diameter", label_bm: "Diameter", default: 75 },
      { key: "loadKg", label_en: "Load (kg)", label_bm: "Beban (kg)", default: 60 },
    ],
  },
  ivpole: {
    label_en: "IV Pole", label_bm: "Tiang IV",
    fields: [
      { key: "length", label_en: "Length", label_bm: "Panjang", default: 2500 },
      { key: "dia", label_en: "Diameter", label_bm: "Diameter", default: 50 },
    ],
  },
};

const TEMPLATES: { type: PartType; prompt_en: string; prompt_bm: string }[] = [
  { type: "plate", prompt_en: "Mounting plate 150 × 150 × 3 mm with 4 M10 corner holes", prompt_bm: "Plat pemasangan 150 × 150 × 3 mm dengan 4 lubang M10" },
  { type: "lbracket", prompt_en: "L-bracket 100 × 80 × 3 mm with 5.5mm slots", prompt_bm: "Penyangak L 100 × 80 × 3 mm dengan slot 5.5mm" },
  { type: "castor", prompt_en: "Castor wheel Ø75mm rated 60kg with 4-bolt mount", prompt_bm: "Roda castor Ø75mm 60kg dengan 4 lubang bolt" },
  { type: "ivpole", prompt_en: "IV pole Ø50mm × 2500mm tall with 5-star base", prompt_bm: "Tiang IV Ø50mm × 2500mm dengan tapak 5-bintang" },
];

export function PromptToAutoCAD() {
  const { lang } = useLkl();
  const [type, setType] = useState<PartType>("plate");
  const [prompt, setPrompt] = useState("");
  const [params, setParams] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    for (const f of PART_META.plate.fields) init[f.key] = f.default;
    return init;
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ code: string; title: string; summary: any } | null>(null);
  const [copied, setCopied] = useState(false);

  const switchType = (t: PartType) => {
    setType(t);
    const init: Record<string, number> = {};
    for (const f of PART_META[t].fields) init[f.key] = f.default;
    setParams(init);
    setResult(null);
  };

  const generate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/autocad/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, params, prompt, lang }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult({ code: data.code, title: data.title, summary: data.summary });
    } catch (e: any) {
      setResult({
        code: `;;; Error: ${e?.message}`,
        title: "Error",
        summary: { lines: 0, commands: 0 },
      });
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const download = () => {
    if (!result) return;
    const blob = new Blob([result.code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lkl-${type}.lsp`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const applyTemplate = (tpl: (typeof TEMPLATES)[number]) => {
    switchType(tpl.type);
    setPrompt(lang === "bm" ? tpl.prompt_bm : tpl.prompt_en);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-md bg-blue-50 border border-blue-200 grid place-items-center text-blue-700">
          <PenTool className="w-5 h-5" />
        </div>
        <div>
          <div className="lkl-eyebrow mb-0.5">AUTOLISP GENERATOR</div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{t("ac.title", lang)}</h1>
          <p className="text-xs text-slate-500 mt-0.5">{t("ac.subtitle", lang)}</p>
        </div>
      </div>

      {/* Engine info */}
      <GlassCard tickCorners>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <div className="lkl-eyebrow">Engine</div>
            <div className="lkl-mono font-semibold text-slate-900 mt-0.5 flex items-center gap-1"><Cpu className="w-3.5 h-3.5 text-blue-700" />AutoLISP Synth</div>
          </div>
          <div>
            <div className="lkl-eyebrow">Endpoint</div>
            <div className="lkl-mono font-semibold text-slate-900 mt-0.5">/api/autocad/generate</div>
          </div>
          <div>
            <div className="lkl-eyebrow">Output</div>
            <div className="lkl-mono font-semibold text-slate-900 mt-0.5">.lsp · AutoCAD R2018+</div>
          </div>
          <div>
            <div className="lkl-eyebrow">Status</div>
            <div className="font-semibold text-emerald-700 mt-0.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 lkl-blink" /> Online
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="text-[11px] text-slate-500 lkl-mono bg-blue-50 border border-blue-200 rounded px-2 py-1 inline-block">
        📐 All dimensions in millimetres (mm)
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: input */}
        <GlassCard>
          <SectionHeader eyebrow={t("ac.needDrawn", lang)} title={lang === "bm" ? "Huraian bahagian" : "Part description"} />
          <textarea
            className="lkl-input min-h-[80px]"
            placeholder={t("ac.placeholder", lang)}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />

          {/* Part type selector */}
          <div className="mt-3">
            <div className="lkl-eyebrow mb-1.5">Part type</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {(Object.keys(PART_META) as PartType[]).map((pt) => (
                <button
                  key={pt}
                  onClick={() => switchType(pt)}
                  className={`px-2 py-2 rounded border text-xs font-semibold transition-colors ${
                    type === pt
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
                  }`}
                >
                  {lang === "bm" ? PART_META[pt].label_bm : PART_META[pt].label_en}
                </button>
              ))}
            </div>
          </div>

          {/* Dimensions */}
          <div className="mt-3">
            <div className="lkl-eyebrow mb-1.5">{t("ac.params", lang)}</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PART_META[type].fields.map((f) => (
                <div key={f.key}>
                  <label className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">
                    {lang === "bm" ? f.label_bm : f.label_en}
                  </label>
                  <input
                    type="number"
                    className="lkl-input lkl-mono mt-0.5"
                    value={params[f.key] ?? f.default}
                    onChange={(e) => setParams({ ...params, [f.key]: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            className="lkl-btn lkl-btn-primary w-full mt-4"
            onClick={generate}
            disabled={loading}
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> {t("ai.thinking", lang)}</>
            ) : (
              <><PenTool className="w-4 h-4" /> {t("ac.generate", lang)}</>
            )}
          </button>

          {/* Templates */}
          <div className="mt-4">
            <div className="lkl-eyebrow mb-1.5">{t("ac.examples", lang)}</div>
            <div className="space-y-1">
              {TEMPLATES.map((tpl, i) => (
                <button key={i} className="lkl-prompt-chip text-xs" onClick={() => applyTemplate(tpl)}>
                  <span className="lkl-mono text-[10px] text-blue-700 font-bold mr-1">[{tpl.type}]</span>
                  {lang === "bm" ? tpl.prompt_bm : tpl.prompt_en}
                </button>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Right: output */}
        <GlassCard>
          <SectionHeader
            eyebrow={t("ac.output", lang)}
            title={result ? result.title : "—"}
            action={
              result && (
                <div className="flex gap-1">
                  <button className="lkl-btn lkl-btn-ghost text-xs" onClick={copy}>
                    {copied ? <><Check className="w-3.5 h-3.5 text-emerald-600" /> {t("ac.copied", lang)}</> : <><Copy className="w-3.5 h-3.5" /> {t("ac.copy", lang)}</>}
                  </button>
                  <button className="lkl-btn lkl-btn-ghost text-xs" onClick={download}>
                    <Download className="w-3.5 h-3.5" /> .lsp
                  </button>
                </div>
              )
            }
          />

          {result && (
            <div className="grid grid-cols-3 gap-2 mb-3 text-center">
              <div className="rounded border border-slate-200 bg-slate-50 p-1.5">
                <div className="lkl-stat-number text-lg text-slate-900">{result.summary.lines}</div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500">Lines</div>
              </div>
              <div className="rounded border border-slate-200 bg-slate-50 p-1.5">
                <div className="lkl-stat-number text-lg text-slate-900">{result.summary.commands}</div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500">Commands</div>
              </div>
              <div className="rounded border border-slate-200 bg-slate-50 p-1.5">
                <div className="lkl-stat-number text-lg text-slate-900">{PART_META[type].fields.length}</div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500">Params</div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="lkl-code min-h-[300px] grid place-items-center">
              <div className="flex items-center gap-2 text-cyan-300">
                <Loader2 className="w-4 h-4 animate-spin" /> {t("ai.thinking", lang)}
              </div>
            </div>
          ) : result ? (
            <pre className="lkl-code max-h-[500px] overflow-auto">{result.code}</pre>
          ) : (
            <div className="lkl-code min-h-[300px] flex items-center justify-center text-slate-500 text-xs">
              {lang === "bm" ? "Hasil AutoLISP akan dipaparkan di sini…" : "AutoLISP output will appear here…"}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
