import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const SCALES: Record<string, string> = {
  "notes-legend": "N.T.S (A1)",
  "site-plan": "1:100 (A1)",
  "floor-plan": "1:50 (A1)",
  schematic: "AS SHOWN (A1)",
  "single-line": "N.T.S (A1)",
  "standard-details": "N.T.S (A1)",
  schedule: "N.T.S (A1)",
};

type VHist = {
  version: string;
  date: string;
  drawnBy: string;
  changeDescription: string;
  changeDescriptionBm: string;
  status: string;
  sheetSize: string;
  scale: string;
  isCurrent: boolean;
  hasDiff: boolean;
  diffWithPrevious: boolean;
};

const HISTORY_TEMPLATES: Record<string, { desc: string; descBm: string; status: string }[]> = {
  "FAC118-M-ACMV-C-G-001": [
    { desc: "Initial issue for design coordination", descBm: "Keluaran awal untuk koordinasi reka", status: "Draft" },
    { desc: "Updated notes per consultant comments", descBm: "Nota dikemas kini mengikut komen perunding", status: "For Review" },
    { desc: "Issued for construction", descBm: "Dikeluarkan untuk pembinaan", status: "Construction" },
  ],
  "FAC118-M-ACMV-C-G-003": [
    { desc: "Initial AC layout — FCU/CU positions", descBm: "Susun atur AC awal — kedudukan FCU/CU", status: "Draft" },
    { desc: "Added schedule of equipment table; refrigerant pipe routing revised", descBm: "Tambah jadual peralatan; laluan paip refrigeran disemak", status: "For Review" },
    { desc: "Drain pipe slope corrected to 1:100; issued for construction", descBm: "Kemiringan paip air ditetapkan kepada 1:100; dikeluarkan untuk pembinaan", status: "Construction" },
  ],
  "FAC118-M-CWSP-C-G-003": [
    { desc: "Initial cold water layout plan", descBm: "Pelan air sejuk awal", status: "Draft" },
    { desc: "Incoming pipe size revised from 50mm to 75mm HDPE", descBm: "Saiz paip masuk diubah dari 50mm ke 75mm HDPE", status: "For Review" },
    { desc: "Added water meter detail; issued for construction", descBm: "Tambah butiran meter air; dikeluarkan untuk pembinaan", status: "Construction" },
  ],
  "FAC118-M-FP-C-G-001": [
    { desc: "Initial fire protection layout", descBm: "Susun atur perlindungan kebakaran awal", status: "Draft" },
    { desc: "Added ABC dry powder and CO2 extinguisher schedule", descBm: "Tambah jadual ABC dry powder dan CO2", status: "For Review" },
    { desc: "Sprinkler head locations coordinated with ceiling grid", descBm: "Lokasi sprinkler diselaraskan dengan grid siling", status: "Construction" },
  ],
  "FAC118-E-SLD-C-G-001": [
    { desc: "Initial single line diagram", descBm: "Gambarajah garis tunggal awal", status: "Draft" },
    { desc: "Updated MSB busbar rating to 250A; added EMSB interlocking notes", descBm: "Kemas kini rating busbar MSB ke 250A; tambah nota interlock EMSB", status: "Construction" },
  ],
};

function defaultHistory(): { desc: string; descBm: string; status: string }[] {
  return [
    { desc: "Initial issue", descBm: "Keluaran awal", status: "Draft" },
    { desc: "Updated per consultant review", descBm: "Dikemas kini mengikut semakan perunding", status: "For Review" },
    { desc: "Issued for construction", descBm: "Dikeluarkan untuk pembinaan", status: "Construction" },
  ];
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const drawing = await db.drawing.findUnique({ where: { id } });
  if (!drawing) return NextResponse.json({ error: "Drawing not found" }, { status: 404 });

  const tmpl = HISTORY_TEMPLATES[drawing.number] ?? defaultHistory();
  // Use drawing number to deterministically pick a count
  const seed = drawing.number.charCodeAt(drawing.number.length - 1) % 3;
  const list = tmpl.slice(0, Math.max(2, tmpl.length - seed));
  const now = Date.now();

  const versions: VHist[] = list
    .map((v, i) => {
      const ver = String(i).padStart(2, "0");
      const isCurrent = i === list.length - 1;
      const daysAgo = (list.length - i) * 4 + 2;
      return {
        version: ver,
        date: new Date(now - daysAgo * 86400000).toISOString(),
        drawnBy: drawing.drawnBy || "SHZ",
        changeDescription: v.desc,
        changeDescriptionBm: v.descBm,
        status: isCurrent ? drawing.status : v.status,
        sheetSize: "A1",
        scale: drawing.scale || "1:50 (A1)",
        isCurrent,
        hasDiff: i > 0,
        diffWithPrevious: i > 0,
      };
    })
    .reverse();

  return NextResponse.json({ versions, drawing: { id: drawing.id, number: drawing.number, currentVersion: drawing.version } });
}
