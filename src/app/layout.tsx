import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NCT CAD · Project Drawing Management System",
  description:
    "NCT CAD — Project drawing management system for the NCT LAND Managed Industrial Park project (FAC118). Covers all disciplines: Architectural, Structural, Civil, M&E, Landscape. Powered by NCT Group Sdn. Bhd.",
  keywords: ["NCT CAD", "Project Drawings", "FAC118", "NCT LAND", "Managed Industrial Park", "Architectural", "Structural", "Civil", "M&E", "ACMV", "CWSP", "FPS", "LPS"],
  authors: [{ name: "NCT Group Sdn. Bhd." }],
  icons: { icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
