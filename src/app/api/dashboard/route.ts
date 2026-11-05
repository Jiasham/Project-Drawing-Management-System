import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const statusOrder = ["Draft", "For Review", "Submission", "Tender", "Construction", "As-Built", "Approved", "Released", "Obsolete"];
  const categoryOrder = ["Architectural", "Structural", "Civil", "Site", "Landscape", "ACMV", "CWSP", "FPS", "General", "Infrastructure", "Lighting", "Small Power", "DB/SLD", "LPS", "TNB"];

  const [drawings, files, checklistItems, users] = await Promise.all([
    db.drawing.findMany({ include: { files: true, auditTrails: { orderBy: { createdAt: "desc" }, take: 1 } }, orderBy: { updatedAt: "desc" } }),
    db.file.findMany(),
    db.checklistItem.findMany(),
    db.user.findMany(),
  ]);

  const byStatus: Record<string, number> = {};
  for (const s of statusOrder) byStatus[s] = 0;
  for (const d of drawings) byStatus[d.status] = (byStatus[d.status] ?? 0) + 1;

  const byCategory: Record<string, number> = {};
  for (const c of categoryOrder) byCategory[c] = 0;
  for (const d of drawings) byCategory[d.category] = (byCategory[d.category] ?? 0) + 1;

  const totalFiles = files.length;
  const totalSizeKb = files.reduce((s, f) => s + f.sizeKb, 0);
  const openChecklist = checklistItems.filter((c) => !c.checked).length;
  const activeUsers = users.filter((u) => u.active).length;

  // upload series (last 30 days)
  const now = Date.now();
  const uploadSeries: { date: string; count: number; sizeKb: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const dayStart = new Date(now - i * 86400000);
    const dStr = dayStart.toISOString().slice(0, 10);
    const dayFiles = files.filter((f) => f.uploadedAt.toISOString().slice(0, 10) === dStr);
    uploadSeries.push({ date: dStr, count: dayFiles.length, sizeKb: dayFiles.reduce((s, f) => s + f.sizeKb, 0) });
  }

  const recentAuditRows = await db.auditTrail.findMany({
    include: { drawing: true },
    orderBy: { createdAt: "desc" },
    take: 8,
  });
  const recentAudit = recentAuditRows.map((r) => ({
    id: r.id,
    user: r.user,
    action: r.action,
    detail: r.detail,
    createdAt: r.createdAt,
    drawing: r.drawing ? { id: r.drawing.id, number: r.drawing.number, title: r.drawing.title } : null,
  }));

  const drawingsList = drawings.map((d) => ({
    id: d.id,
    number: d.number,
    title: d.title,
    titleBm: d.titleBm,
    category: d.category,
    status: d.status,
    version: d.version,
    mass: d.mass,
    material: d.material,
    updatedAt: d.updatedAt,
    fileCount: d.files.length,
  }));

  return NextResponse.json({
    totalDrawings: drawings.length,
    byStatus,
    byCategory,
    totalFiles,
    totalSizeKb,
    openChecklist,
    activeUsers,
    statusOrder,
    categoryOrder,
    uploadSeries,
    recentAudit,
    drawings: drawingsList,
  });
}
