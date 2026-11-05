import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// The 6-step sign-off flow definition (matches the uploaded flow chart exactly)
export const SIGN_OFF_STEPS = [
  {
    step: 1,
    key: "architect",
    department: { en: "Architect", bm: "Arkitek" },
    description: { en: "Prepare / Design / update SPA drawings — design intent, unit plans, elevations, specifications", bm: "Sediakan / Reka / kemas kini lukisan SPA — niat reka, pelan unit, dongakan, spesifikasi" },
    approvers: { en: "Lead Architect", bm: "Arkitek Utama" },
    icon: "building",
  },
  {
    step: 2,
    key: "technical",
    department: { en: "Technical Department", bm: "Jabatan Teknikal" },
    description: { en: "Technical coordination & compliance — Architecture / ID / Landscape / C&S · BIM / drawing coordination", bm: "Koordinasi teknikal & pematuhan — Senibina / ID / Landskap / C&S · BIM / koordinasi lukisan" },
    approvers: { en: "Checked by Khaiqal / Aleif · Signed off by Razali Rashid", bm: "Disemak oleh Khaiqal / Aleif · Ditandatangani oleh Razali Rashid" },
    icon: "ruler",
  },
  {
    step: 3,
    key: "me",
    department: { en: "M&E Department", bm: "Jabatan M&E" },
    description: { en: "Services coordination — MEP layouts, risers, points, plant / equipment requirements", bm: "Koordinasi perkhidmatan — susun atur MEP, riser, titik, keperluan loji / peralatan" },
    approvers: { en: "M&E Coordinator", bm: "Penyelaras M&E" },
    icon: "wrench",
  },
  {
    step: 4,
    key: "qs",
    department: { en: "QS / Contract Department", bm: "Jabatan QS / Kontrak" },
    description: { en: "Cost & BOQ validation — scope alignment, quantities, specification / cost impact", bm: "Pengesahan kos & BOQ — penjajaran skop, kuantiti, spesifikasi / impak kos" },
    approvers: { en: "QS Manager", bm: "Pengurus QS" },
    icon: "calculator",
  },
  {
    step: 5,
    key: "salesAdmin",
    department: { en: "Sales Admin", bm: "Pentadbir Jualan" },
    description: { en: "SPA & sales documentation check — unit schedule, specifications, areas, parcel / accessory data", bm: "Semakan dokumentasi SPA & jualan — jadual unit, spesifikasi, kawasan, data lot / aksesori" },
    approvers: { en: "Sales Admin Manager", bm: "Pengurus Pentadbir Jualan" },
    icon: "clipboard",
  },
  {
    step: 6,
    key: "salesMarketing",
    department: { en: "Sales & Marketing", bm: "Jualan & Pemasaran" },
    description: { en: "Product & sales alignment — product positioning, sales materials, approved product information", bm: "Penjajaran produk & jualan — kedudukan produk, bahan jualan, maklumat produk diluluskan" },
    approvers: { en: "Sales & Marketing Director", bm: "Pengarah Jualan & Pemasaran" },
    icon: "megaphone",
  },
];

// Generate mock sign-off state per drawing based on its drawing number hash
// (deterministic so the same drawing always shows the same progress)
function getDrawingSignOffState(drawingNumber: string) {
  // Simple hash from drawing number to determine current step (1-7, where 7=issued)
  let hash = 0;
  for (let i = 0; i < drawingNumber.length; i++) {
    hash = ((hash << 5) - hash) + drawingNumber.charCodeAt(i);
    hash |= 0;
  }
  const currentStep = (Math.abs(hash) % 7) + 1; // 1-7 (7 = fully issued)
  const isIssued = currentStep > 6;

  const steps = SIGN_OFF_STEPS.map((s) => {
    if (s.step < currentStep) {
      return { ...s, status: "approved" as const, approvedBy: s.approvers.en, approvedDate: `2025-0${1 + s.step}-1${s.step}` };
    } else if (s.step === currentStep && !isIssued) {
      return { ...s, status: "inReview" as const, approvedBy: null, approvedDate: null };
    } else {
      return { ...s, status: "pending" as const, approvedBy: null, approvedDate: null };
    }
  });

  return {
    currentStep: isIssued ? 7 : currentStep,
    isIssued,
    steps,
    progress: Math.round((Math.min(currentStep - 1, 6) / 6) * 100),
  };
}

// GET /api/sign-off?drawingId=...  → returns sign-off state for a specific drawing
// GET /api/sign-off                 → returns the flow definition + summary across all drawings
export async function GET(req: NextRequest) {
  const drawingId = req.nextUrl.searchParams.get("drawingId");

  if (drawingId) {
    const drawing = await db.drawing.findUnique({
      where: { id: drawingId },
      select: { id: true, number: true, title: true, titleBm: true, status: true, version: true, updatedAt: true },
    });
    if (!drawing) return NextResponse.json({ error: "Drawing not found" }, { status: 404 });

    const state = getDrawingSignOffState(drawing.number);
    return NextResponse.json({ drawing, signOff: state, steps: SIGN_OFF_STEPS });
  }

  // Summary mode — return flow definition + per-drawing states
  const drawings = await db.drawing.findMany({
    select: { id: true, number: true, title: true, titleBm: true, category: true, status: true, version: true, updatedAt: true },
    orderBy: { number: "asc" },
  });

  const drawingStates = drawings.map((d) => ({
    ...d,
    signOff: getDrawingSignOffState(d.number),
  }));

  // Summary stats
  const summary = {
    total: drawings.length,
    issued: drawingStates.filter((d) => d.signOff.isIssued).length,
    inProgress: drawingStates.filter((d) => !d.signOff.isIssued && d.signOff.currentStep > 1).length,
    notStarted: drawingStates.filter((d) => d.signOff.currentStep === 1).length,
    byStep: Array.from({ length: 6 }, (_, i) => ({
      step: i + 1,
      count: drawingStates.filter((d) => d.signOff.currentStep === i + 1).length,
    })),
  };

  return NextResponse.json({
    steps: SIGN_OFF_STEPS,
    summary,
    drawings: drawingStates,
  });
}
