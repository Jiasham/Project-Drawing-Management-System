import type { Lang } from "@/lib/i18n";

export function timeAgo(date: Date | string, lang: Lang): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60000), hr = Math.floor(min / 60), day = Math.floor(hr / 24);
  if (min < 1) return lang === "bm" ? "baru saja" : "just now";
  if (min < 60) return `${min} ${lang === "bm" ? "min lalu" : "min ago"}`;
  if (hr < 24) return `${hr} ${lang === "bm" ? "jam lalu" : "hr ago"}`;
  if (day < 2) return `${day} ${lang === "bm" ? "hari lalu" : "day ago"}`;
  return `${day} ${lang === "bm" ? "hari lalu" : "days ago"}`;
}

export function fmtDateTime(date: Date | string, _lang: Lang): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().slice(0, 16).replace("T", " ");
}

export function fmtDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().slice(0, 10);
}
