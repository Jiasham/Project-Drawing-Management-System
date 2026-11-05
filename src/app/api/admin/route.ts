import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const [drawings, files, auditTrails, checklistItems, bomItems, users] = await Promise.all([
    db.drawing.findMany(),
    db.file.findMany(),
    db.auditTrail.findMany(),
    db.checklistItem.findMany(),
    db.bomItem.findMany(),
    db.user.findMany(),
  ]);

  const byStatus: Record<string, number> = {};
  for (const d of drawings) byStatus[d.status] = (byStatus[d.status] ?? 0) + 1;

  const byCategory: Record<string, number> = {};
  for (const d of drawings) byCategory[d.category] = (byCategory[d.category] ?? 0) + 1;

  const byFileType: Record<string, { count: number; sizeKb: number }> = {};
  for (const f of files) {
    if (!byFileType[f.fileType]) byFileType[f.fileType] = { count: 0, sizeKb: 0 };
    byFileType[f.fileType].count++;
    byFileType[f.fileType].sizeKb += f.sizeKb;
  }

  return NextResponse.json({
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      active: u.active,
      lastSeen: u.lastSeen,
      createdAt: u.createdAt,
    })),
    systemStats: {
      totalDrawings: drawings.length,
      totalFiles: files.length,
      totalSizeKb: files.reduce((s, f) => s + f.sizeKb, 0),
      auditEntries: auditTrails.length,
      checklistItems: checklistItems.length,
      bomItems: bomItems.length,
    },
    ai: {
      engine: "z-ai-web-dev-sdk · GLM-4.6",
      endpoint: "/api/ai/chat",
      model: "glm-4.6",
      timeout: "30000ms",
      status: "online",
      capabilities: ["drawing lookup", "status count", "category filter", "naming helper"],
    },
    byStatus,
    byCategory,
    byFileType,
  });
}
