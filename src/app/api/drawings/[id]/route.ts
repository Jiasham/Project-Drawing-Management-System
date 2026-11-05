import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const drawing = await db.drawing.findUnique({
    where: { id },
    include: {
      files: { orderBy: { uploadedAt: "desc" } },
      checklistItems: { orderBy: { order: "asc" } },
      bomItems: { orderBy: { partNumber: "asc" } },
      auditTrails: { orderBy: { createdAt: "desc" }, take: 12 },
    },
  });
  if (!drawing) return NextResponse.json({ error: "Drawing not found" }, { status: 404 });
  return NextResponse.json({ drawing });
}
