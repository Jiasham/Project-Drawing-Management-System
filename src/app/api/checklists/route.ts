import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const drawingId = req.nextUrl.searchParams.get("drawingId");
  if (!drawingId) return NextResponse.json({ error: "drawingId required" }, { status: 400 });
  const items = await db.checklistItem.findMany({ where: { drawingId }, orderBy: { order: "asc" } });
  return NextResponse.json({ items });
}
