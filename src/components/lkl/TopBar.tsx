"use client";
import { useLkl, type ModuleId, ROLES } from "@/lib/store";
import { t } from "@/lib/i18n";
import { SidebarTrigger } from "./Sidebar";
import { Bell, Search, Wifi } from "lucide-react";

const MODULE_META: Record<ModuleId, { emoji: string; key: string }> = {
  dashboard: { emoji: "📊", key: "nav.dashboard" },
  drawings: { emoji: "📂", key: "nav.drawings" },
  drawingDetail: { emoji: "🔍", key: "nav.drawingDetail" },
  designChange: { emoji: "🔄", key: "nav.designChange" },
  schedule: { emoji: "📋", key: "nav.schedule" },
  signOff: { emoji: "✍️", key: "nav.signOff" },
  aiAssistant: { emoji: "🤖", key: "nav.aiAssistant" },
  promptToAutocad: { emoji: "✏️", key: "nav.promptToAutocad" },
  autoBom: { emoji: "🧮", key: "nav.autoBom" },
  checklists: { emoji: "✅", key: "nav.checklists" },
  auditTrail: { emoji: "📜", key: "nav.auditTrail" },
  admin: { emoji: "⚙️", key: "nav.admin" },
};

export function TopBar() {
  const { activeModule, lang, selectedDrawingNumber, role } = useLkl();
  const currentRole = ROLES.find((r) => r.id === role);
  const meta = MODULE_META[activeModule];
  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-slate-200">
      <div className="flex items-center gap-3 px-3 sm:px-5 h-14">
        <SidebarTrigger />
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base shrink-0" aria-hidden>
            {meta.emoji}
          </span>
          <h1 className="text-sm sm:text-base font-semibold text-slate-900 truncate">{t(meta.key, lang)}</h1>
        </div>

        {selectedDrawingNumber && activeModule === "drawingDetail" && (
          <span className="hidden sm:inline-flex lkl-mono text-[11px] font-semibold px-2 py-0.5 rounded border border-blue-600/30 bg-blue-50 text-blue-700 shrink-0">
            {selectedDrawingNumber}
          </span>
        )}

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-200 bg-slate-50 w-64">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              className="bg-transparent border-0 outline-none text-sm w-full text-slate-700 placeholder:text-slate-400"
              placeholder={t("drawings.search", lang)}
            />
          </div>
          <button className="relative p-1.5 text-slate-500 hover:text-slate-900" aria-label="Notifications">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-600" />
          </button>
          {/* Role badge */}
          {currentRole && (
            <div className={`hidden sm:flex items-center gap-1.5 text-[11px] font-semibold px-2 py-1 rounded border bg-gradient-to-r ${currentRole.color} text-white border-transparent`}>
              <span className="uppercase tracking-wider">{lang === "bm" ? currentRole.labelBm : currentRole.label}</span>
            </div>
          )}
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 px-2 py-1 rounded border border-emerald-200 bg-emerald-50">
            <Wifi className="w-3.5 h-3.5" />
            <span className="uppercase tracking-wider">Online</span>
          </div>
        </div>
      </div>
    </header>
  );
}
