import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Generate BOM items for a drawing based on its category + number
function generateBom(drawing: any) {
  const num = drawing.number;
  const cat = drawing.category;
  if (cat === "ACMV") {
    if (num.endsWith("-G-003")) {
      return [
        { partNumber: "FCU-GER-OFF-01", description: "Fan Coil Unit, 11900 BTU/h, ceiling exposed", qty: 1, material: "Galv. Steel", mass: 28.0, category: "ACMV" },
        { partNumber: "FCU-GER-OFF-02", description: "Fan Coil Unit, 11900 BTU/h, ceiling exposed", qty: 1, material: "Galv. Steel", mass: 28.0, category: "ACMV" },
        { partNumber: "CU-GER-OFF-01", description: "Condensing Unit, 1.5 HP, R410A", qty: 1, material: "Galv. Steel", mass: 42.0, category: "ACMV" },
        { partNumber: "CU-GER-OFF-02", description: "Condensing Unit, 1.5 HP, R410A", qty: 1, material: "Galv. Steel", mass: 42.0, category: "ACMV" },
        { partNumber: "REF-PIPE-3/8", description: "Refrigerant pipe, Cu ASTM B280, 3/8\"", qty: 12, material: "Copper", mass: 0.45, category: "Pipework" },
        { partNumber: "REF-PIPE-5/8", description: "Refrigerant pipe, Cu ASTM B280, 5/8\"", qty: 12, material: "Copper", mass: 0.68, category: "Pipework" },
        { partNumber: "DRAIN-PVC-25", description: "Drain pipe, PVC-U MS 628, DN25", qty: 8, material: "PVC-U", mass: 0.32, category: "Pipework" },
        { partNumber: "INS-ARMFLEX-13", description: "Insulation, Armaflex, 13mm thick", qty: 24, material: "Elastomeric", mass: 0.18, category: "Insulation" },
      ];
    }
    if (num.endsWith("-G-004")) {
      return [
        { partNumber: "BRACKET-CU", description: "Wall bracket for condensing unit", qty: 2, material: "SS304", mass: 3.2, category: "Bracket" },
        { partNumber: "VIB-ISOL-25", description: "Vibration isolator, 25mm deflection", qty: 4, material: "Rubber/Steel", mass: 0.8, category: "Accessory" },
        { partNumber: "DRAIN-TRAP-P", description: "Drain trap, PVC-U, DN25", qty: 2, material: "PVC-U", mass: 0.25, category: "Pipework" },
        { partNumber: "PIPE-CLAMP-25", description: "Pipe clamp, Galv., for DN25", qty: 16, material: "Galv. Steel", mass: 0.12, category: "Accessory" },
      ];
    }
    return [
      { partNumber: "ACMV-NOTE-01", description: "Notes & legend reference sheet", qty: 1, material: "—", mass: 0, category: "Documentation" },
    ];
  }
  if (cat === "CWSP") {
    if (num.endsWith("-G-003")) {
      return [
        { partNumber: "HDPE-75", description: "Incoming water pipe, HDPE, DN75", qty: 6, material: "HDPE", mass: 1.4, category: "Pipework" },
        { partNumber: "HDPE-25", description: "Distribution pipe, HDPE, DN25", qty: 24, material: "HDPE", mass: 0.35, category: "Pipework" },
        { partNumber: "WC-SET", description: "Water closet, single piece, s-trap", qty: 2, material: "Vitreous China", mass: 38.0, category: "Fixture" },
        { partNumber: "BASIN-600", description: "Wash basin, 600mm countertop", qty: 2, material: "Vitreous China", mass: 18.0, category: "Fixture" },
        { partNumber: "SINK-SS-800", description: "Stainless steel sink, 800mm", qty: 1, material: "SS304", mass: 6.5, category: "Fixture" },
        { partNumber: "FT-100", description: "Floor trap, 100mm, brass body", qty: 3, material: "Brass", mass: 0.6, category: "Accessory" },
        { partNumber: "GV-25", description: "Gate valve, DN25, brass", qty: 4, material: "Brass", mass: 0.4, category: "Valve" },
      ];
    }
    if (num.endsWith("-G-004")) {
      return [
        { partNumber: "TANK-1000L", description: "Cold water storage tank, 1000L, GRP", qty: 1, material: "GRP", mass: 65.0, category: "Tank" },
        { partNumber: "PUMP-SET-1.5HP", description: "Booster pump set, 1.5HP, 2 pumps duty+standby", qty: 1, material: "Cast Iron/SS", mass: 32.0, category: "Pump" },
        { partNumber: "FLOAT-SW", description: "Float switch, tank level control", qty: 2, material: "Plastic", mass: 0.3, category: "Accessory" },
      ];
    }
    return [
      { partNumber: "CWSP-NOTE-01", description: "Notes & legend reference sheet", qty: 1, material: "—", mass: 0, category: "Documentation" },
    ];
  }
  if (cat === "FPS") {
    return [
      { partNumber: "ABC-9KG", description: "ABC dry powder extinguisher, 9kg", qty: 2, material: "Steel", mass: 12.5, category: "Extinguisher" },
      { partNumber: "CO2-2KG", description: "CO2 extinguisher, 2kg", qty: 1, material: "Steel", mass: 6.0, category: "Extinguisher" },
      { partNumber: "SPR-HEAD", description: "Sprinkler head, pendent, 68°C", qty: 6, material: "Brass", mass: 0.15, category: "Sprinkler" },
      { partNumber: "BRACKET-FP", description: "Wall bracket for extinguisher", qty: 3, material: "SS304", mass: 0.5, category: "Bracket" },
    ];
  }
  if (cat === "Lighting") {
    return [
      { partNumber: "LED-150W", description: "LED high bay, 150W, 5000K, IP65", qty: 8, material: "Al/PC", mass: 2.8, category: "Lighting" },
      { partNumber: "LED-40W", description: "LED bulkhead, 40W, 4000K, IP54", qty: 6, material: "Al/PC", mass: 1.2, category: "Lighting" },
      { partNumber: "EM-EXIT", description: "Exit sign, LED, maintained, 3hr battery", qty: 4, material: "ABS", mass: 0.7, category: "Lighting" },
      { partNumber: "1G-SWITCH-13A", description: "1-gang switch, 13A, SP", qty: 8, material: "PC", mass: 0.1, category: "Switch" },
    ];
  }
  if (cat === "Small Power") {
    return [
      { partNumber: "13A-SO-2G", description: "13A socket outlet, 2-gang, with earth", qty: 12, material: "PC", mass: 0.18, category: "Socket" },
      { partNumber: "13A-SO-ISO", description: "13A isolated earth socket outlet", qty: 4, material: "PC", mass: 0.20, category: "Socket" },
      { partNumber: "COND-20", description: "Conduit, GI, 20mm", qty: 60, material: "Galv. Steel", mass: 0.42, category: "Conduit" },
    ];
  }
  if (cat === "DB/SLD") {
    if (num.startsWith("FAC118-E-SLD")) {
      return [
        { partNumber: "MSB-250A", description: "Main Switch Board, 250A, TPN", qty: 1, material: "Sheet Steel", mass: 180.0, category: "Switchboard" },
        { partNumber: "EMSB-125A", description: "Emergency MSB, 125A, TPN", qty: 1, material: "Sheet Steel", mass: 140.0, category: "Switchboard" },
        { partNumber: "MCCB-100A", description: "MCCB, 100A, 3-pole, 10kA", qty: 4, material: "Moulded Case", mass: 1.8, category: "Breaker" },
        { partNumber: "MCCB-63A", description: "MCCB, 63A, 3-pole, 10kA", qty: 6, material: "Moulded Case", mass: 1.4, category: "Breaker" },
        { partNumber: "MCB-32A", description: "MCB, 32A, 1-pole, 6kA", qty: 16, material: "Moulded Case", mass: 0.25, category: "Breaker" },
      ];
    }
    return [
      { partNumber: "DB-63A", description: "Distribution Board, 63A, TPN, 12-way", qty: 1, material: "Sheet Steel", mass: 22.0, category: "Switchboard" },
      { partNumber: "RCBO-16A", description: "RCBO, 16A, 30mA, 1-pole", qty: 8, material: "Moulded Case", mass: 0.22, category: "Breaker" },
    ];
  }
  if (cat === "LPS") {
    return [
      { partNumber: "AIR-TERM-500", description: "Air terminal, 500mm finial, SS304", qty: 4, material: "SS304", mass: 1.2, category: "LPS" },
      { partNumber: "DC-25", description: "Down conductor, Cu, 25mm² stranded", qty: 24, material: "Copper", mass: 0.32, category: "LPS" },
      { partNumber: "EARTH-ROD", description: "Earth rod, Cu-clad, 1.2m × 15mm", qty: 6, material: "Cu-clad Steel", mass: 2.4, category: "LPS" },
      { partNumber: "EARTH-PIT", description: "Earth pit inspection chamber, 200x200mm", qty: 3, material: "Concrete/Plastic", mass: 4.5, category: "LPS" },
    ];
  }
  return [
    { partNumber: "GEN-SHEET", description: "General layout sheet reference", qty: 1, material: "—", mass: 0, category: "Documentation" },
  ];
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const drawingId: string = String(body.drawingId || "").trim();
  const lang: "en" | "bm" = body.lang === "bm" ? "bm" : "en";
  await sleep(700);

  const drawing = await db.drawing.findUnique({ where: { id: drawingId }, include: { files: true } });
  if (!drawing) return NextResponse.json({ error: "Drawing not found" }, { status: 404 });

  let bomItems = await db.bomItem.findMany({ where: { drawingId } });
  if (bomItems.length === 0) {
    const gen = generateBom(drawing);
    bomItems = await Promise.all(
      gen.map((b) =>
        db.bomItem.create({
          data: {
            drawingId,
            partNumber: b.partNumber,
            description: b.description,
            qty: b.qty,
            material: b.material,
            mass: b.mass,
            category: b.category,
          },
        }),
      ),
    );
  }

  const totals = {
    lineItems: bomItems.length,
    totalQty: bomItems.reduce((s, b) => s + b.qty, 0),
    totalMass: bomItems.reduce((s, b) => s + (b.mass ?? 0) * b.qty, 0),
    categories: Array.from(new Set(bomItems.map((b) => b.category || "Uncategorised"))),
  };

  return NextResponse.json({ ok: true, drawing, bomItems, totals, lang });
}
