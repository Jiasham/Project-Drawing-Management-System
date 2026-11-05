import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const message: string = String(body.message || "").trim();
  const lang: "en" | "bm" = body.lang === "bm" ? "bm" : "en";
  const start = Date.now();
  await sleep(600 + Math.random() * 600);

  const drawings = await db.drawing.findMany({ include: { files: true } });
  const msg = message.toLowerCase();
  const isBm = lang === "bm";

  // Helper: drawing card text
  const fmt = (d: (typeof drawings)[number]) =>
    `• **${d.number}** — ${isBm ? d.titleBm : d.title} · V${d.version} · ${d.status} · ${d.files.length} file(s)`;

  // pattern: how many approved/released/construction/etc
  const statusMatch = msg.match(/(how many|berapa)\s+(approved|released|construction|draft|for review|submission|tender|as-built|as built|obsolete|diluluskan|dilepaskan|pembinaan|draf|usang)/);
  if (statusMatch) {
    let st = statusMatch[2];
    const map: Record<string, string> = {
      "as built": "As-Built",
      diluluskan: "Approved",
      dilepaskan: "Released",
      pembinaan: "Construction",
      draf: "Draft",
      usang: "Obsolete",
    };
    st = map[st] || st.charAt(0).toUpperCase() + st.slice(1);
    const matches = drawings.filter((d) => d.status.toLowerCase() === st.toLowerCase());
    const reply = isBm
      ? `Terdapat **${matches.length}** lukisan dengan status *${st}*.\n\n${matches.slice(0, 8).map(fmt).join("\n")}${matches.length > 8 ? `\n…and ${matches.length - 8} more.` : ""}`
      : `There are **${matches.length}** drawings with status *${st}*.\n\n${matches.slice(0, 8).map(fmt).join("\n")}${matches.length > 8 ? `\n…and ${matches.length - 8} more.` : ""}`;
    return NextResponse.json({ reply, ms: Date.now() - start });
  }

  // pattern: show <category> drawings (ACMV, CWSP, FPS, IV ...)
  const catMap: Record<string, string> = {
    acmv: "ACMV", cwsp: "CWSP", fps: "FPS", general: "General",
    infrastructure: "Infrastructure", infra: "Infrastructure",
    lighting: "Lighting", "small power": "Small Power", "smallpower": "Small Power",
    db: "DB/SLD", sld: "DB/SLD", "db/sld": "DB/SLD", lps: "LPS",
  };
  for (const k of Object.keys(catMap)) {
    if (msg.includes(k)) {
      const cat = catMap[k];
      const matches = drawings.filter((d) => d.category === cat);
      const reply = isBm
        ? `**${matches.length}** lukisan dalam kategori *${cat}*:\n\n${matches.map(fmt).join("\n")}`
        : `**${matches.length}** drawings in the *${cat}* category:\n\n${matches.map(fmt).join("\n")}`;
      return NextResponse.json({ reply, ms: Date.now() - start });
    }
  }

  // pattern: which obsolete
  if (msg.includes("obsolete") || msg.includes("usang")) {
    const matches = drawings.filter((d) => d.status === "Obsolete");
    if (matches.length === 0) {
      return NextResponse.json({
        reply: isBm ? "Tiada lukisan dengan status *Obsolete* buat masa ini." : "No drawings are currently marked *Obsolete*.",
        ms: Date.now() - start,
      });
    }
    return NextResponse.json({ reply: matches.map(fmt).join("\n"), ms: Date.now() - start });
  }

  // pattern: latest version of <number>
  const dvMatch = msg.match(/(latest version|versi terkini)\s+(?:of\s+|bagi\s+)?([A-Z0-9\-]+)/i);
  if (dvMatch) {
    const num = msg.match(/fac118[\-a-z0-9]+/)?.toUpperCase().replace(/-/g, "-");
    if (num) {
      const d = drawings.find((x) => x.number.toLowerCase() === num.toLowerCase());
      if (d) {
        const reply = isBm
          ? `Versi terkini **${d.number}** ialah **V${d.version}** — *${d.titleBm}*.\n\nStatus: ${d.status}\nDilukis oleh: ${d.drawnBy}\nDikemaskini: ${d.updatedAt.toISOString().slice(0, 10)}`
          : `Latest version of **${d.number}** is **V${d.version}** — *${d.title}*.\n\nStatus: ${d.status}\nDrawn by: ${d.drawnBy}\nUpdated: ${d.updatedAt.toISOString().slice(0, 10)}`;
        return NextResponse.json({ reply, ms: Date.now() - start });
      }
    }
  }

  // direct drawing number lookup
  const directNum = msg.match(/fac118[\-a-z0-9]+/i);
  if (directNum) {
    const num = directNum[0].toUpperCase();
    const d = drawings.find((x) => x.number.toLowerCase() === num.toLowerCase());
    if (d) {
      const reply = isBm
        ? `**${d.number}** — ${d.titleBm}\n\n• Kategori: ${d.category}\n• Status: ${d.status}\n• Versi: V${d.version}\n• Dilukis oleh: ${d.drawnBy}\n• Fail: ${d.files.length}`
        : `**${d.number}** — ${d.title}\n\n• Category: ${d.category}\n• Status: ${d.status}\n• Version: V${d.version}\n• Drawn by: ${d.drawnBy}\n• Files: ${d.files.length}`;
      return NextResponse.json({ reply, ms: Date.now() - start });
    } else {
      return NextResponse.json({
        reply: isBm ? `Tiada lukisan dengan nombor *${num}* dijumpai.` : `No drawing found with number *${num}*.`,
        ms: Date.now() - start,
      });
    }
  }

  // pattern: list all drawings / show all
  if (msg.includes("all drawings") || msg.includes("semua lukisan") || msg.includes("list drawings") || msg.includes("senarai lukisan")) {
    const reply = isBm
      ? `Terdapat **${drawings.length}** lukisan dalam projek FAC118:\n\n${drawings.slice(0, 14).map(fmt).join("\n")}\n…and ${Math.max(0, drawings.length - 14)} more.`
      : `There are **${drawings.length}** drawings in the FAC118 project:\n\n${drawings.slice(0, 14).map(fmt).join("\n")}\n…and ${Math.max(0, drawings.length - 14)} more.`;
    return NextResponse.json({ reply, ms: Date.now() - start });
  }

  // pattern: total count
  if (msg.includes("total") || msg.includes("berapa jumlah") || msg.includes("how many drawings")) {
    const reply = isBm
      ? `Jumlah keseluruhan: **${drawings.length}** lukisan, dengan **${drawings.reduce((s, d) => s + d.files.length, 0)}** fail disimpan.`
      : `Grand total: **${drawings.length}** drawings, with **${drawings.reduce((s, d) => s + d.files.length, 0)}** files stored.`;
    return NextResponse.json({ reply, ms: Date.now() - start });
  }

  // fallback
  const fallback = isBm
    ? `Saya boleh membantu anda dengan:\n\n• Mengira lukisan mengikut status (cth. "berapa diluluskan")\n• Mencari mengikut kategori (ACMV, CWSP, FPS, LPS…)\n• Mencari nombor lukisan (cth. FAC118-M-ACMV-C-G-001)\n• Menunjukkan versi terkini sesuatu lukisan\n\nCuba tanya: "Tunjukkan lukisan ACMV" atau "Berapa diluluskan?"`
    : `I can help you with:\n\n• Counting drawings by status (e.g. "how many approved")\n• Filtering by category (ACMV, CWSP, FPS, LPS…)\n• Looking up a drawing number (e.g. FAC118-M-ACMV-C-G-001)\n• Showing the latest version of a drawing\n\nTry asking: "Show ACMV drawings" or "How many are approved?"`;
  return NextResponse.json({ reply: fallback, ms: Date.now() - start });
}
