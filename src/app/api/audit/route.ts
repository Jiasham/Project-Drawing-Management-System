import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "200", 10);
  const rows = await db.auditTrail.findMany({
    include: { drawing: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return NextResponse.json({
    items: rows.map((r) => ({
      id: r.id,
      user: r.user,
      action: r.action,
      detail: r.detail,
      createdAt: r.createdAt,
      drawing: r.drawing ? { id: r.drawing.id, number: r.drawing.number, title: r.drawing.title } : null,
    })),
  });
}
