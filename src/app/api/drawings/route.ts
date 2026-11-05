import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  const drawings = await db.drawing.findMany({
    include: { files: true, _count: { select: { checklistItems: true, bomItems: true, auditTrails: true } } },
    orderBy: { number: "asc" },
  });
  return NextResponse.json({ drawings });
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const number = String(form.get("number") || "").trim();
    const title = String(form.get("title") || "").trim();
    const titleBm = String(form.get("titleBm") || title).trim();
    const category = String(form.get("category") || "General").trim();
    const version = String(form.get("version") || "00").trim();
    const description = String(form.get("description") || "").trim();
    const descriptionBm = String(form.get("descriptionBm") || description).trim();
    const material = String(form.get("material") || "—").trim();
    const mass = parseFloat(String(form.get("mass") || "0")) || 0;
    const drawnBy = String(form.get("drawnBy") || "SHZ").trim();
    const file = form.get("file") as File | null;

    if (!number || !title) {
      return NextResponse.json({ error: "number and title are required" }, { status: 400 });
    }
    const existing = await db.drawing.findUnique({ where: { number } });
    if (existing) {
      return NextResponse.json({ error: `Drawing ${number} already exists` }, { status: 409 });
    }

    const drawing = await db.drawing.create({
      data: {
        number,
        title,
        titleBm,
        category,
        status: "Draft",
        version,
        description,
        descriptionBm,
        material,
        mass,
        drawnBy,
        designedBy: "—",
        checkedBy: "—",
        approvedBy: "—",
        scale: "1:50 (A1)",
      },
    });

    // upload dir
    const uploadDir = path.join(process.cwd(), "uploads", drawing.id);
    await mkdir(uploadDir, { recursive: true });

    if (file && file.size > 0) {
      const ext = (file.name.split(".").pop() || "").toLowerCase();
      const filename = `${number}.${ext || "bin"}`;
      const buf = Buffer.from(await file.arrayBuffer());
      await writeFile(path.join(uploadDir, filename), buf);
      await db.file.create({
        data: {
          drawingId: drawing.id,
          filename,
          fileType: ext,
          sizeKb: Math.ceil(file.size / 1024),
          uploadedBy: drawnBy,
        },
      });
    }

    await db.auditTrail.create({
      data: {
        drawingId: drawing.id,
        user: drawnBy,
        action: "create",
        detail: `Created drawing ${number} (V${version})`,
      },
    });

    return NextResponse.json({ ok: true, drawing });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
