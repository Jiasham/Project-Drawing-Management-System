"use client";
import { useLkl, type ModuleId, ROLES } from "@/lib/store";
import { t } from "@/lib/i18n";
import {
  LayoutDashboard, FileStack, FileSearch, GitCompare, ClipboardList, FileCheck,
  Bot, PenTool, ListChecks, History, Settings, Zap, FlaskConical,
  Menu, X, LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV: { id: ModuleId; icon: any; key: string }[] = [
  { id: "dashboard", icon: LayoutDashboard, key: "nav.dashboard" },
  { id: "drawings", icon: FileStack, key: "nav.drawings" },
  { id: "drawingDetail", icon: FileSearch, key: "nav.drawingDetail" },
  { id: "designChange", icon: GitCompare, key: "nav.designChange" },
  { id: "schedule", icon: ClipboardList, key: "nav.schedule" },
  { id: "signOff", icon: FileCheck, key: "nav.signOff" },
  { id: "aiAssistant", icon: Bot, key: "nav.aiAssistant" },
  { id: "promptToAutocad", icon: PenTool, key: "nav.promptToAutocad" },
  { id: "autoBom", icon: ListChecks, key: "nav.autoBom" },
  { id: "checklists", icon: ListChecks, key: "nav.checklists" },
  { id: "auditTrail", icon: History, key: "nav.auditTrail" },
  { id: "admin", icon: Settings, key: "nav.admin" },
];

const JOBS: { id: ModuleId; icon: any; key: string }[] = [
  { id: "designChange", icon: Zap, key: "pickAJob.designChange" },
  { id: "autoBom", icon: ListChecks, key: "pickAJob.bom" },
  { id: "checklists", icon: FlaskConical, key: "pickAJob.testing" },
];

export function Sidebar() {
  const { activeModule, setActiveModule, lang, setLang, sidebarOpen, setSidebarOpen, role, setRole } = useLkl();
  const currentRole = ROLES.find((r) => r.id === role);

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && <div className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-50 lg:z-30 h-screen w-[260px] shrink-0 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Logo */}
        <div className="px-4 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-gradient-to-br from-blue-700 to-blue-500 text-white grid place-items-center font-extrabold text-lg shadow-sm">
              N
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-slate-900 tracking-tight leading-tight">NCT CAD</div>
              <div className="lkl-eyebrow truncate">{t("app.title", lang)}</div>
            </div>
            <button
              className="ml-auto lg:hidden text-slate-500 hover:text-slate-900"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Lang toggle */}
          <div className="mt-3 grid grid-cols-2 gap-1 p-1 rounded-md bg-slate-100 border border-slate-200">
            {(["en", "bm"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={cn(
                  "text-xs font-semibold py-1 rounded transition-colors",
                  lang === l ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700",
                )}
              >
                {l === "en" ? "English" : "Bahasa"}
              </button>
            ))}
          </div>

          {/* Demo mode badge */}
          <div className="mt-2 flex items-center gap-2 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-2 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 lkl-blink" />
            <span className="font-semibold">{t("app.demoMode", lang)}</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="lkl-eyebrow mb-2 px-2">{t("nav.menu", lang)}</div>
          <div className="flex flex-col gap-0.5">
            {NAV.map(({ id, icon: Icon, key }) => (
              <button
                key={id}
                className="lkl-nav-item"
                data-active={activeModule === id}
                onClick={() => setActiveModule(id)}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{t(key, lang)}</span>
              </button>
            ))}
          </div>

          <div className="lkl-eyebrow mt-5 mb-1 px-2">{t("pickAJob.title", lang)}</div>
          <div className="text-[10px] text-slate-400 px-2 mb-2 leading-snug">{t("pickAJob.subtitle", lang)}</div>
          <div className="flex flex-col gap-1">
            {JOBS.map(({ id, icon: Icon, key }) => (
              <button
                key={id}
                className="lkl-nav-item"
                onClick={() => setActiveModule(id)}
              >
                <Icon className="w-4 h-4 shrink-0 text-blue-700" />
                <span className="truncate">{t(key, lang)}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* User card + Role switcher */}
        <div className="border-t border-slate-100 p-3 space-y-2">
          {/* Role switcher */}
          <div className="space-y-1">
            <div className="lkl-eyebrow px-1 mb-1">{lang === "bm" ? "Tukar Peranan" : "Switch Role"}</div>
            <div className="max-h-40 overflow-y-auto space-y-0.5 pr-1">
              {ROLES.map((r) => {
                const isActive = role === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => setRole(r.id)}
                    className={cn(
                      "w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs font-medium transition border",
                      isActive
                        ? "bg-blue-50 text-blue-700 border-blue-300 font-semibold"
                        : "text-slate-500 border-transparent hover:bg-slate-50 hover:text-slate-700",
                    )}
                  >
                    <span className={cn("w-2 h-2 rounded-full bg-gradient-to-br shrink-0", r.color)} />
                    <span className="truncate">{lang === "bm" ? r.labelBm : r.label}</span>
                    {r.step && <span className="lkl-mono text-[9px] text-slate-400 ml-auto shrink-0">S{r.step}</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current user card */}
          <div className="flex items-center gap-2.5 p-2 rounded-md bg-slate-50">
            <div className={cn("w-8 h-8 rounded-full bg-gradient-to-br text-white grid place-items-center text-xs font-bold shrink-0", currentRole?.color ?? "from-slate-500 to-slate-700")}>
              {currentRole?.name?.split(" ").map((w) => w[0]).slice(0, 2).join("") ?? "U"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-slate-900 truncate">{currentRole?.name ?? "User"}</div>
              <div className="text-[10px] text-slate-500 truncate">{lang === "bm" ? currentRole?.labelBm : currentRole?.label}</div>
            </div>
            <button className="text-slate-400 hover:text-red-600 p-1" aria-label={t("app.signOut", lang)} title={t("app.signOut", lang)}>
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export function SidebarTrigger() {
  const { setSidebarOpen } = useLkl();
  return (
    <button
      className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900"
      onClick={() => setSidebarOpen(true)}
      aria-label="Open menu"
    >
      <Menu className="w-5 h-5" />
    </button>
  );
}
