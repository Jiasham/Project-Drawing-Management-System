"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Lang } from "./i18n";

export type ModuleId =
  | "dashboard" | "drawings" | "drawingDetail" | "designChange" | "schedule" | "signOff"
  | "aiAssistant" | "promptToAutocad" | "autoBom" | "checklists" | "auditTrail" | "admin";

export type Role =
  | "architect"
  | "technical"
  | "me"
  | "qs"
  | "salesAdmin"
  | "salesMarketing"
  | "superadmin";

export const ROLES: { id: Role; label: string; labelBm: string; name: string; step: number | null; color: string }[] = [
  { id: "architect",       label: "Architect",                labelBm: "Arkitek",              name: "Ar. Ahmad Fauzi",    step: 1, color: "from-blue-500 to-blue-700" },
  { id: "technical",       label: "NCT Project Planning Team", labelBm: "Pasukan Perancang Projek NCT", name: "Razali Rashid", step: 2, color: "from-indigo-500 to-indigo-700" },
  { id: "me",              label: "M&E Department",            labelBm: "Jabatan M&E",          name: "Ir. Yau Chau Fong",  step: 3, color: "from-cyan-500 to-cyan-700" },
  { id: "qs",              label: "QS / Contract",             labelBm: "QS / Kontrak",         name: "Siti Khadijah",      step: 4, color: "from-amber-500 to-amber-700" },
  { id: "salesAdmin",      label: "Sales Admin",               labelBm: "Pentadbir Jualan",     name: "Noraishah",          step: 5, color: "from-purple-500 to-purple-700" },
  { id: "salesMarketing",  label: "Sales & Marketing",         labelBm: "Jualan & Pemasaran",   name: "Farid Rahman",       step: 6, color: "from-pink-500 to-pink-700" },
  { id: "superadmin",      label: "Super Admin",               labelBm: "Pentadbir Utama",      name: "Document Controller", step: null, color: "from-slate-700 to-slate-900" },
];

type LklState = {
  activeModule: ModuleId;
  setActiveModule: (m: ModuleId) => void;
  lang: Lang;
  setLang: (l: Lang) => void;
  role: Role;
  setRole: (r: Role) => void;
  selectedDrawingId: string | null;
  selectedDrawingNumber: string | null;
  openDrawing: (id: string, number: string) => void;
  clearDrawing: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (b: boolean) => void;
};

export const useLkl = create<LklState>()(
  persist(
    (set, get) => ({
      activeModule: "dashboard",
      setActiveModule: (m) => set({ activeModule: m, sidebarOpen: false }),
      lang: "en",
      setLang: (l) => set({ lang: l }),
      role: "superadmin",
      setRole: (r) => set({ role: r }),
      selectedDrawingId: null,
      selectedDrawingNumber: null,
      openDrawing: (id, number) => set({ selectedDrawingId: id, selectedDrawingNumber: number, activeModule: "drawingDetail" }),
      clearDrawing: () => set({ selectedDrawingId: null, selectedDrawingNumber: null }),
      sidebarOpen: false,
      setSidebarOpen: (b) => set({ sidebarOpen: b }),
    }),
    { name: "nct-cad-state", partialize: (s) => ({ lang: s.lang, role: s.role }) },
  ),
);
