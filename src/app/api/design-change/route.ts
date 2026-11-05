import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

type Change = {
  id: number;
  type: "added" | "removed" | "modified" | "dimension";
  category: "Dimensional" | "Documentation" | "Manufacturing" | "Quality";
  title: string;
  titleBm: string;
  description: string;
  descriptionBm: string;
  oldSpec: string;
  newSpec: string;
  loc: { x: number; y: number; r: number };
};

const CHANGE_LIBRARY: Record<string, Change[]> = {
  "FAC118-M-ACMV-C-G-003": [
    {
      id: 1, type: "added", category: "Manufacturing",
      title: "Schedule of equipment table added",
      titleBm: "Jadual peralatan ditambah",
      description: "New schedule of equipment table placed top-right of the sheet listing all FCU and CU tags with capacity.",
      descriptionBm: "Jadual peralatan baharu diletakkan di bahagian atas-kanan helaian.",
      oldSpec: "—", newSpec: "Schedule table 4 rows × 3 cols",
      loc: { x: 640, y: 95, r: 22 },
    },
    {
      id: 2, type: "dimension", category: "Dimensional",
      title: "Refrigerant pipe length corrected",
      titleBm: "Panjang paip refrigeran diperbetulkan",
      description: "CU-01 refrigerant pipe length increased from 8m to 9.5m to reach new condensing unit position.",
      descriptionBm: "Panjang paip refrigeran CU-01 ditambah dari 8m ke 9.5m.",
      oldSpec: "8.0 m", newSpec: "9.5 m",
      loc: { x: 305, y: 140, r: 20 },
    },
    {
      id: 3, type: "modified", category: "Documentation",
      title: "Drain pipe slope note revised",
      titleBm: "Nota kemiringan paip air disemak",
      description: "Note 6 updated from 'min slope 1:80' to 'min slope 1:100' to comply with MS 1528.",
      descriptionBm: "Nota 6 dikemas kini dari 'kemiringan min 1:80' ke '1:100'.",
      oldSpec: "1:80", newSpec: "1:100",
      loc: { x: 130, y: 230, r: 18 },
    },
  ],
  "FAC118-M-ACMV-C-G-001": [
    {
      id: 1, type: "modified", category: "Documentation",
      title: "Note 9 updated",
      titleBm: "Nota 9 dikemas kini",
      description: "Note 9 'FIRE DAMPERS: 72 DEG C FUSIBLE' revised to 'FIRE DAMPERS: 72°C FUSIBLE LINK TO BS EN 1566'.",
      descriptionBm: "Nota 9 dikemas kini kepada rujukan BS EN 1566.",
      oldSpec: "72 DEG C FUSIBLE", newSpec: "72°C FUSIBLE LINK TO BS EN 1566",
      loc: { x: 130, y: 175, r: 18 },
    },
    {
      id: 2, type: "added", category: "Documentation",
      title: "Legend item added — Vibration Isolator",
      titleBm: "Item lagenda ditambah — Pengasing Getaran",
      description: "New legend entry 'Vibration Isolator' added at position 7 of legend block.",
      descriptionBm: "Item lagenda baharu 'Pengasing Getaran' ditambah.",
      oldSpec: "—", newSpec: "Vibration Isolator (7)",
      loc: { x: 500, y: 175, r: 16 },
    },
  ],
  "FAC118-M-CWSP-C-G-003": [
    {
      id: 1, type: "dimension", category: "Dimensional",
      title: "Incoming pipe size revised",
      titleBm: "Saiz paip masuk disemak",
      description: "Incoming water main upgraded from 50mm HDPE to 75mm HDPE to meet peak flow demand.",
      descriptionBm: "Paip masuk dinaik taraf dari 50mm ke 75mm HDPE.",
      oldSpec: "DN50 HDPE", newSpec: "DN75 HDPE",
      loc: { x: 130, y: 130, r: 22 },
    },
    {
      id: 2, type: "added", category: "Manufacturing",
      title: "Water meter detail added",
      titleBm: "Butiran meter air ditambah",
      description: "Water meter with bypass valve assembly detail added at the incoming connection.",
      descriptionBm: "Butiran meter air dengan injap pintasan ditambah.",
      oldSpec: "—", newSpec: "WM-50 with bypass DN50",
      loc: { x: 220, y: 130, r: 20 },
    },
    {
      id: 3, type: "modified", category: "Quality",
      title: "Fixture tag format changed",
      titleBm: "Format tag perlengkapan diubah",
      description: "WC tags updated from 'WC-1' to 'WC-GF-01' format per new naming convention.",
      descriptionBm: "Tag WC dikemas kini mengikut format penamaan baharu.",
      oldSpec: "WC-1", newSpec: "WC-GF-01",
      loc: { x: 410, y: 250, r: 16 },
    },
  ],
};

const AI_LIBRARY: Record<string, any> = {
  "FAC118-M-ACMV-C-G-003": {
    verdict: "Approve with conditions — minor re-checklist required for drain slope note.",
    verdictBm: "Lulus dengan syarat — semakan semula senarai diperlukan untuk nota kemiringan paip.",
    risk: "medium",
    manufacturingImpact: "Low — schedule table is documentation only; refrigerant pipe length change is within supplier tolerance.",
    checklistRecheckRequired: true,
    affectedItems: ["Note 6 — Drain pipe slope", "Schedule of equipment — row 1 & 2"],
    summary: "The refrigerant pipe length change increases total run by 1.5m. Verify oil return is adequate. Drain slope note now aligns with MS 1528. Re-tick Documentation checklist items 6 and 9.",
    summaryBm: "Perubahan panjang paip refrigeran meningkatkan laluan sebanyak 1.5m. Sahkan pulangan minyak mencukupi.",
  },
  "FAC118-M-ACMV-C-G-001": {
    verdict: "Approve — documentation-only change, no manufacturing impact.",
    verdictBm: "Lulus — perubahan dokumentasi sahaja.",
    risk: "low",
    manufacturingImpact: "None — changes are confined to notes and legend.",
    checklistRecheckRequired: false,
    affectedItems: ["Note 9 — Fire damper specification"],
    summary: "The fire damper specification now explicitly references BS EN 1566. Legend has a new entry but no symbol drawing change. No re-checklist required.",
    summaryBm: "Spesifikasi fire damper kini merujuk BS EN 1566 secara eksplisit.",
  },
  "FAC118-M-CWSP-C-G-003": {
    verdict: "Approve with conditions — dimensional change requires supplier confirmation.",
    verdictBm: "Lulus dengan syarat — perubahan dimensi memerlukan pengesahan pembekal.",
    risk: "high",
    manufacturingImpact: "Medium — incoming pipe size increase affects tapping saddle, water meter, and bypass valve selection. Confirm stock availability with supplier.",
    checklistRecheckRequired: true,
    affectedItems: ["Incoming pipe — HDPE DN75", "Water meter — WM-75", "Tapping saddle — DN75→DN25"],
    summary: "The incoming main has been upgraded to DN75. This requires: (1) confirmation from SAJ that the tapping is approved, (2) updated water meter size to WM-75, (3) revised bypass valve sizing. Re-tick Dimensional items 1-3.",
    summaryBm: "Paip masuk telah dinaik taraf ke DN75. Ini memerlukan pengesahan SAJ, saiz meter air dikemas kini.",
  },
};

export async function GET(req: NextRequest) {
  const drawingId = req.nextUrl.searchParams.get("drawingId");

  // Drawings that have diffs
  const diffDrawings = Object.keys(CHANGE_LIBRARY).map((num) => ({ number: num }));
  const drawingRows = await db.drawing.findMany({
    where: { number: { in: diffDrawings.map((d) => d.number) } },
    include: { files: true },
  });

  if (!drawingId) {
    return NextResponse.json({
      drawings: drawingRows.map((d) => ({
        id: d.id,
        number: d.number,
        title: d.title,
        titleBm: d.titleBm,
        category: d.category,
        status: d.status,
        oldVersion: "00",
        newVersion: "01",
        changeCount: CHANGE_LIBRARY[d.number]?.length ?? 0,
      })),
    });
  }

  const drawing = await db.drawing.findUnique({ where: { id: drawingId } });
  if (!drawing) return NextResponse.json({ error: "Drawing not found" }, { status: 404 });

  const changes = CHANGE_LIBRARY[drawing.number] ?? [];
  const aiAnalysis = AI_LIBRARY[drawing.number] ?? {
    verdict: "No analysis available.",
    risk: "low",
    manufacturingImpact: "—",
    checklistRecheckRequired: false,
    affectedItems: [],
    summary: "No design changes recorded for this drawing.",
  };

  return NextResponse.json({
    drawing: {
      id: drawing.id,
      number: drawing.number,
      title: drawing.title,
      titleBm: drawing.titleBm,
      category: drawing.category,
      oldVersion: "00",
      newVersion: "01",
    },
    changes,
    aiAnalysis,
  });
}
