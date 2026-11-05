"use client";
import { useEffect, useRef, useState } from "react";
import { GlassCard, SectionHeader } from "../ui/glass";
import { useLkl } from "@/lib/store";
import { t } from "@/lib/i18n";
import { timeAgo, fmtDateTime } from "../ui/time";
import { Bot, Send, Trash2, Loader2, Sparkles, Wand2, History as HistoryIcon, Cpu } from "lucide-react";

type Msg = { role: "user" | "ai"; text: string; ms?: number; ts: number };

const SUGGESTED = [
  { en: "How many drawings are Approved?", bm: "Berapa lukisan yang Diluluskan?" },
  { en: "Show ACMV drawings", bm: "Tunjukkan lukisan ACMV" },
  { en: "Which drawings are Obsolete?", bm: "Lukisan mana yang Usang?" },
  { en: "Latest version of FAC118-M-ACMV-C-G-003", bm: "Versi terkini FAC118-M-ACMV-C-G-003" },
  { en: "Show CWSP category", bm: "Tunjukkan kategori CWSP" },
];

export function AIAssistant() {
  const { lang } = useLkl();
  const [tab, setTab] = useState<"chat" | "naming" | "activity">("chat");
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "ai",
      text: lang === "bm"
        ? "Selamat datang ke Pembantu AI NCT CAD. Saya boleh membantu anda mencari lukisan, mengira status, dan menerangkan perubahan reka."
        : "Welcome to NCT CAD AI Assistant. I can help you find drawings, count by status, and explain design changes.",
      ts: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // naming state
  const [namingInput, setNamingInput] = useState("");
  const [namingResult, setNamingResult] = useState<string | null>(null);
  const [namingLoading, setNamingLoading] = useState(false);

  // activity
  const [audit, setAudit] = useState<any[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);

  useEffect(() => {
    if (tab === "activity" && audit.length === 0) {
      setAuditLoading(true);
      fetch("/api/audit?limit=20")
        .then((r) => r.json())
        .then((d) => {
          setAudit(d.items ?? []);
          setAuditLoading(false);
        });
    }
  }, [tab, audit.length]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || thinking) return;
    setInput("");
    const userMsg: Msg = { role: "user", text: msg, ts: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setThinking(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, lang }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "ai", text: data.reply, ms: data.ms, ts: Date.now() }]);
    } catch {
      setMessages((m) => [...m, { role: "ai", text: "Error: could not reach AI engine.", ts: Date.now() }]);
    } finally {
      setThinking(false);
    }
  };

  const renderText = (text: string) => {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("•")) {
        return <div key={i} className="text-xs leading-snug pl-2 my-0.5 text-slate-700">{line}</div>;
      }
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <div key={i} className="text-xs leading-relaxed my-0.5">
          {parts.map((p, j) =>
            p.startsWith("**") && p.endsWith("**") ? (
              <strong key={j} className="font-bold text-slate-900">{p.slice(2, -2)}</strong>
            ) : (
              <span key={j}>{p}</span>
            ),
          )}
        </div>
      );
    });
  };

  const genNaming = async () => {
    if (!namingInput.trim() || namingLoading) return;
    setNamingLoading(true);
    setNamingResult(null);
    // local mock — generate FAC118 number
    const txt = namingInput.toLowerCase();
    let disc = "M", sys = "GEN", seq = "005";
    if (/(acmv|air cond|hvac|penghawa)/.test(txt)) { disc = "M"; sys = "ACMV"; seq = "005"; }
    else if (/(cwsp|water|plumb|sanitari|paip air)/.test(txt)) { disc = "M"; sys = "CWSP"; seq = "009"; }
    else if (/(fire|fps|kebakaran)/.test(txt)) { disc = "M"; sys = "FP"; seq = "003"; }
    else if (/(light|pencahayaan)/.test(txt)) { disc = "E"; sys = "L"; seq = "003"; }
    else if (/(small power|kuasa kecil|socket)/.test(txt)) { disc = "E"; sys = "S"; seq = "002"; }
    else if (/(db|distribution board|switchboard)/.test(txt)) { disc = "E"; sys = "DB"; seq = "002"; }
    else if (/(sld|single line|garis tunggal)/.test(txt)) { disc = "E"; sys = "SLD"; seq = "004"; }
    else if (/(lps|lightning|kilat)/.test(txt)) { disc = "E"; sys = "LPS"; seq = "005"; }
    const suggested = `FAC118-${disc}-${sys}-C-G-${seq}`;
    setTimeout(() => {
      setNamingResult(
        lang === "bm"
          ? `Berdasarkan huraian anda, nombor lukisan yang dicadangkan ialah:\n\n**${suggested}**\n\n• Disiplin: ${disc === "M" ? "Mekanikal" : "Elektrikal"}\n• Sistem: ${sys}\n• Peringkat: C (Pembinaan)\n• Lokasi: G (Tingkat Tanah)\n• Urutan: ${seq}`
          : `Based on your description, the suggested drawing number is:\n\n**${suggested}**\n\n• Discipline: ${disc === "M" ? "Mechanical" : "Electrical"}\n• System: ${sys}\n• Stage: C (Construction)\n• Location: G (Ground Floor)\n• Sequence: ${seq}`,
      );
      setNamingLoading(false);
    }, 700);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-md bg-blue-50 border border-blue-200 grid place-items-center text-blue-700">
          <Bot className="w-5 h-5" />
        </div>
        <div>
          <div className="lkl-eyebrow mb-0.5">GLM-4.6 · NCT CAD</div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{t("ai.title", lang)}</h1>
        </div>
      </div>

      {/* Engine info */}
      <GlassCard tickCorners>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <div className="lkl-eyebrow">Engine</div>
            <div className="lkl-mono font-semibold text-slate-900 mt-0.5 flex items-center gap-1"><Cpu className="w-3.5 h-3.5 text-blue-700" />z-ai-web-dev-sdk</div>
          </div>
          <div>
            <div className="lkl-eyebrow">Endpoint</div>
            <div className="lkl-mono font-semibold text-slate-900 mt-0.5">/api/ai/chat</div>
          </div>
          <div>
            <div className="lkl-eyebrow">Model</div>
            <div className="lkl-mono font-semibold text-slate-900 mt-0.5">glm-4.6</div>
          </div>
          <div>
            <div className="lkl-eyebrow">Status</div>
            <div className="font-semibold text-emerald-700 mt-0.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 lkl-blink" />
              Online
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {([
          { id: "chat", icon: Bot, key: "ai.tab.chat" },
          { id: "naming", icon: Wand2, key: "ai.tab.naming" },
          { id: "activity", icon: HistoryIcon, key: "ai.tab.activity" },
        ] as const).map(({ id, icon: Icon, key }) => (
          <button key={id} className={`lkl-tab ${tab === id ? "lkl-tab-[data-active=true]" : ""}`} data-active={tab === id} onClick={() => setTab(id)}>
            <Icon className="w-3.5 h-3.5 inline mr-1.5" />
            {t(key, lang)}
          </button>
        ))}
      </div>

      {/* Chat tab */}
      {tab === "chat" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <GlassCard className="lg:col-span-2 p-3 flex flex-col h-[560px]">
            <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pr-1">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={m.role === "user" ? "lkl-bubble-user max-w-[80%]" : "lkl-bubble-ai max-w-[85%]"}>
                    {m.role === "ai" && (
                      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-blue-700 font-bold mb-1">
                        <Sparkles className="w-3 h-3" /> AI
                        {m.ms && <span className="ml-auto text-slate-400 lkl-mono normal-case">{m.ms}ms</span>}
                      </div>
                    )}
                    {renderText(m.text)}
                  </div>
                </div>
              ))}
              {thinking && (
                <div className="flex justify-start">
                  <div className="lkl-bubble-ai flex items-center gap-2 text-xs text-slate-500">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                    {t("ai.thinking", lang)}
                  </div>
                </div>
              )}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                className="lkl-input"
                placeholder={t("ai.placeholder", lang)}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
              />
              <button className="lkl-btn lkl-btn-primary shrink-0" onClick={() => send()} disabled={thinking}>
                <Send className="w-4 h-4" /> {t("ai.send", lang)}
              </button>
            </div>
            <div className="mt-2 flex justify-between items-center">
              <div className="text-[10px] text-slate-400 lkl-mono">{messages.length - 1} messages · session {Math.floor((Date.now() - (messages[0]?.ts ?? Date.now())) / 60000)}min</div>
              <button className="text-[11px] text-slate-500 hover:text-red-600 flex items-center gap-1" onClick={() => setMessages(messages.slice(0, 1))}>
                <Trash2 className="w-3 h-3" /> {t("ai.clear", lang)}
              </button>
            </div>
          </GlassCard>

          <GlassCard>
            <SectionHeader eyebrow={t("ai.suggested", lang)} title={lang === "bm" ? "Cuba soalan ini" : "Try these"} />
            <div className="space-y-1.5">
              {SUGGESTED.map((s, i) => (
                <button key={i} className="lkl-prompt-chip" onClick={() => send(lang === "bm" ? s.bm : s.en)}>
                  {lang === "bm" ? s.bm : s.en}
                </button>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      {/* Naming tab */}
      {tab === "naming" && (
        <GlassCard className="max-w-2xl">
          <SectionHeader eyebrow={t("ai.tab.naming", lang)} title={lang === "bm" ? "Penjana nombor lukisan FAC118" : "FAC118 drawing number generator"} />
          <p className="text-xs text-slate-600 mb-3">
            {lang === "bm"
              ? "Huraikan Lukisan anda dan kami akan mencadangkan nombor mengikut format FAC118-<DISC>-<SYS>-C-G-<SEQ>."
              : "Describe your drawing and we'll suggest a number following the FAC118-<DISC>-<SYS>-C-G-<SEQ> format."}
          </p>
          <textarea
            className="lkl-input min-h-[80px]"
            placeholder={lang === "bm" ? "cth. Pelan susun atur pencahayaan tingkat tanah" : "e.g. Ground floor lighting layout plan"}
            value={namingInput}
            onChange={(e) => setNamingInput(e.target.value)}
          />
          <button className="lkl-btn lkl-btn-primary mt-2 w-full" onClick={genNaming} disabled={namingLoading || !namingInput.trim()}>
            {namingLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> {t("ai.thinking", lang)}</> : <><Wand2 className="w-4 h-4" /> Generate</>}
          </button>
          {namingResult && (
            <div className="mt-3 lkl-bubble-ai">
              {renderText(namingResult)}
            </div>
          )}
        </GlassCard>
      )}

      {/* Activity tab */}
      {tab === "activity" && (
        <GlassCard>
          <SectionHeader eyebrow={t("ai.tab.activity", lang)} title={lang === "bm" ? "Aktiviti terkini" : "Recent activity"} />
          {auditLoading ? (
            <div className="text-center py-8"><Loader2 className="w-5 h-5 animate-spin text-blue-600 mx-auto" /></div>
          ) : (
            <ul className="space-y-1.5 max-h-[480px] overflow-y-auto">
              {audit.map((a) => (
                <li key={a.id} className="flex items-center gap-3 text-xs p-2 rounded hover:bg-slate-50">
                  <span className="lkl-mono font-semibold text-slate-700 w-12 shrink-0">{a.user}</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[9px] uppercase tracking-wider text-slate-600">{a.action}</span>
                  <span className="text-slate-700 truncate flex-1">{a.detail}</span>
                  <span className="text-[10px] text-slate-400 lkl-mono shrink-0">{timeAgo(a.createdAt, lang)}</span>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>
      )}
    </div>
  );
}
