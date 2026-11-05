import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const ALLOWED = ["Draft", "For Review", "Submission", "Tender", "Construction", "As-Built", "Approved", "Released", "Obsolete"];

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json();
  const to = String(body.to || "").trim();
  const user = String(body.user || "SHZ").trim();
  if (!ALLOWED.includes(to)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  const drawing = await db.drawing.findUnique({ where: { id } });
  if (!drawing) return NextResponse.json({ error: "Drawing not found" }, { status: 404 });
  const from = drawing.status;
  if (from === to) return NextResponse.json({ ok: true, drawing, unchanged: true });
  const updated = await db.drawing.update({ where: { id }, data: { status: to } });
  await db.auditTrail.create({
    data: {
      drawingId: id,
      user,
      action: "status_change",
      detail: `${from} -> ${to}`,
    },
  });
  return NextResponse.json({ ok: true, drawing: updated });
}
