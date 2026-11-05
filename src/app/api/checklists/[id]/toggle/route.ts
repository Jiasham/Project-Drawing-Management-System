import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const user = String(body.user || "SHZ").trim();
  const item = await db.checklistItem.findUnique({ where: { id } });
  if (!item) return NextResponse.json({ error: "Checklist item not found" }, { status: 404 });
  const next = !item.checked;
  const updated = await db.checklistItem.update({
    where: { id },
    data: {
      checked: next,
      checkedBy: next ? user : null,
      checkedAt: next ? new Date() : null,
    },
  });
  await db.auditTrail.create({
    data: {
      drawingId: item.drawingId,
      user,
      action: next ? "checklist_tick" : "checklist_untick",
      detail: `${next ? "Ticked" : "Unticked"} '${item.label}'`,
    },
  });
  return NextResponse.json({ ok: true, item: updated });
}
