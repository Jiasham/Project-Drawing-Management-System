"use client";
import { Sidebar } from "@/components/lkl/Sidebar";
import { TopBar } from "@/components/lkl/TopBar";
import { useLkl } from "@/lib/store";
import { Dashboard } from "@/components/lkl/modules/Dashboard";
import { Drawings } from "@/components/lkl/modules/Drawings";
import { DrawingDetail } from "@/components/lkl/modules/DrawingDetail";
import { DesignChange } from "@/components/lkl/modules/DesignChange";
import { Schedule } from "@/components/lkl/modules/Schedule";
import { SignOffFlow } from "@/components/lkl/modules/SignOffFlow";
import { AIAssistant } from "@/components/lkl/modules/AIAssistant";
import { PromptToAutoCAD } from "@/components/lkl/modules/PromptToAutoCAD";
import { AutoBOM } from "@/components/lkl/modules/AutoBOM";
import { Checklists } from "@/components/lkl/modules/Checklists";
import { AuditTrail } from "@/components/lkl/modules/AuditTrail";
import { Admin } from "@/components/lkl/modules/Admin";

export default function Home() {
  const { activeModule } = useLkl();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex flex-1 w-full">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />
          <main className="flex-1 p-3 sm:p-5 lg:p-6">
            {activeModule === "dashboard" && <Dashboard />}
            {activeModule === "drawings" && <Drawings />}
            {activeModule === "drawingDetail" && <DrawingDetail />}
            {activeModule === "designChange" && <DesignChange />}
            {activeModule === "schedule" && <Schedule />}
            {activeModule === "signOff" && <SignOffFlow />}
            {activeModule === "aiAssistant" && <AIAssistant />}
            {activeModule === "promptToAutocad" && <PromptToAutoCAD />}
            {activeModule === "autoBom" && <AutoBOM />}
            {activeModule === "checklists" && <Checklists />}
            {activeModule === "auditTrail" && <AuditTrail />}
            {activeModule === "admin" && <Admin />}
          </main>
          <footer className="mt-auto border-t border-slate-200 bg-white/70 backdrop-blur-sm py-3 px-4">
            <div className="lkl-mono text-[10px] sm:text-[11px] text-slate-500 text-center tracking-wider uppercase">
              NCT CAD · PROJECT DRAWING MANAGEMENT SYSTEM · NCT GROUP · NCT LAND MANAGED INDUSTRIAL PARK (FAC118) · {new Date().getFullYear()}
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
