import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// POST /api/drawings/[id]/new-version
// Accepts multipart/form-data:
//   file (File, required) — the new revision file
//   changeDescription (string, required) — what changed
//   changeDescriptionBm (string, optional) — BM translation
//
// What it does:
//   1. Bumps the drawing version (00 → 01 → 02 → ...)
//   2. Saves the new file to disk
//   3. Creates a File record for the new file
//   4. Logs an audit-trail entry: "version_bump: V00 → V01 — <changeDescription>"
//   5. Updates the drawing's updatedAt timestamp
//   6. (Sign-off reset is handled by the sign-off API which derives state from version hash)
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const drawing = await db.drawing.findUnique({ where: { id } });
  if (!drawing) return NextResponse.json({ error: "Drawing not found" }, { status: 404 });

  const formData = await req.formData();
  const file = formData.get("file");
  const changeDescription = (formData.get("changeDescription") as string | null)?.trim();
  const changeDescriptionBm = (formData.get("changeDescriptionBm") as string | null)?.trim() || changeDescription || "";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided — expected a 'file' field in multipart form data." }, { status: 400 });
  }
  if (!changeDescription) {
    return NextResponse.json({ error: "Change description is required." }, { status: 400 });
  }

  // Validate file type
  const filename = file.name;
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const allowed = ["dwg", "pdf", "step", "stp", "stl", "igs", "iges", "jpg", "png", "zip"];
  if (!allowed.includes(ext)) {
    return NextResponse.json({ error: `File type '.${ext}' not allowed. Allowed: ${allowed.join(", ")}` }, { status: 400 });
  }
  if (file.size > 50 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large — max 50 MB." }, { status: 400 });
  }

  // Bump version: "00" → "01", "01" → "02", "02B" → "03" etc.
  // Parse the numeric prefix, increment, keep it zero-padded to 2 digits
  const oldVersion = drawing.version;
  const versionNum = parseInt(oldVersion.replace(/\D/g, ""), 10) || 0;
  const newVersion = String(versionNum + 1).padStart(2, "0");

  // Save file to disk
  const dir = path.join("/home/z/my-project/uploads", drawing.id);
  await mkdir(dir, { recursive: true });
  const bytes = await file.arrayBuffer();
  await writeFile(path.join(dir, filename), Buffer.from(bytes));

  // Create File record
  const sizeKb = Math.max(1, Math.round(file.size / 1024));
  const fileRecord = await db.file.create({
    data: {
      drawingId: drawing.id,
      filename,
      fileType: ext,
      sizeKb,
      uploadedBy: "SHZ",
      uploadedAt: new Date(),
    },
  });

  // Bump the drawing version + update timestamp
  const updated = await db.drawing.update({
    where: { id: drawing.id },
    data: { version: newVersion, updatedAt: new Date() },
  });

  // Audit trail: version bump
  const audit = await db.auditTrail.create({
    data: {
      drawingId: drawing.id,
      user: "SHZ",
      action: "version_bump",
      detail: `V${oldVersion} → V${newVersion} — ${changeDescription}`,
    },
  });

  return NextResponse.json({
    ok: true,
    drawing: {
      id: updated.id,
      number: updated.number,
      version: updated.version,
      oldVersion,
      updatedAt: updated.updatedAt,
    },
    file: {
      id: fileRecord.id,
      filename: fileRecord.filename,
      fileType: fileRecord.fileType,
      sizeKb: fileRecord.sizeKb,
    },
    audit: { id: audit.id, when: audit.createdAt, user: audit.user, action: audit.action, detail: audit.detail },
    changeDescription,
    changeDescriptionBm,
  });
}
