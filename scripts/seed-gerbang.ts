// Durianê CAD — seed data for the NCT LAND Gerbang project (FAC118)
// Real M&E (Mechanical & Electrical) drawings by Durianê Professionals Sdn. Bhd.
// Run via `bun run scripts/seed-gerbang.ts`

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

// Project personnel (from the title blocks)
const users = [
  { id: "u-shz",    name: "SHZ (Shahira)",  email: "shz@duriane.com",       role: "Designer",  active: true, lastSeen: new Date("2026-01-15T10:00:00Z") },
  { id: "u-amirah", name: "Amirah",          email: "amirah@duriane.com",    role: "Engineer",  active: true, lastSeen: new Date("2026-01-15T09:30:00Z") },
  { id: "u-lck",    name: "LCK (Lee)",       email: "lck@duriane.com",       role: "Reviewer",  active: true, lastSeen: new Date("2026-01-14T16:00:00Z") },
  { id: "u-puka",   name: "PUKA (Puan K)",   email: "puka@duriane.com",      role: "Admin",     active: true, lastSeen: new Date("2026-01-15T11:00:00Z") },
];

// Drawing categories = M&E systems
type Cat = "ACMV" | "CWSP" | "FPS" | "General" | "Infrastructure" | "Lighting" | "Small Power" | "DB/SLD" | "LPS";

// Drawing-type renderers
type RenderType = "notes-legend" | "site-plan" | "floor-plan" | "schematic" | "single-line" | "standard-details" | "schedule";

type DrawingSeed = {
  number: string;
  title: string;
  titleBm: string;
  category: Cat;
  status: string;       // Construction drawings use: Submission / Tender / Construction / As-Built
  version: string;      // "00" for initial issue
  description: string;
  descriptionBm: string;
  drawnBy: string;
  designedBy: string;
  checkedBy: string;
  approvedBy: string;
  scale: string;
  renderType: RenderType;
  files: { filename: string; fileType: string; sizeKb: number; uploadedBy: string; daysAgo: number }[];
};

// 28 real drawings from the uploaded PDFs + Excel
const drawings: DrawingSeed[] = [
  // ── MECHANICAL — ACMV (Air Conditioning Mechanical Ventilation) ──────────
  {
    number: "FAC118-M-ACMV-C-G-001",
    title: "Air Conditioning System - Notes & Legend - List of Drawing",
    titleBm: "Sistem Penghawa Dingin - Nota & Lagenda - Senarai Lukisan",
    category: "ACMV", status: "Construction", version: "00",
    description: "Notes, legend, and list of drawings for the air conditioning system. Includes 55 numbered technical notes on ductwork, insulation, dampers, fire safety, and installation standards.",
    descriptionBm: "Nota, lagenda, dan senarai lukisan untuk sistem penghawa dingin. Termasuk 55 nota teknik berkaitan dukt, penebat, damper, keselamatan kebakaran, dan standard pemasangan.",
    drawnBy: "SHZ", designedBy: "AMIRAH", checkedBy: "LCK", approvedBy: "PUKA",
    scale: "N.T.S", renderType: "notes-legend",
    files: [
      { filename: "FAC118-M-ACMV-C-G-001.dwg", fileType: "dwg", sizeKb: 284, uploadedBy: "SHZ", daysAgo: 12 },
      { filename: "FAC118-M-ACMV-C-G-001.pdf", fileType: "pdf", sizeKb: 1196, uploadedBy: "SHZ", daysAgo: 12 },
    ],
  },
  {
    number: "FAC118-M-ACMV-C-G-002",
    title: "Air Conditioning System - Site Plan",
    titleBm: "Sistem Penghawa Dingin - Pelan Tapak",
    category: "ACMV", status: "Construction", version: "00",
    description: "Site plan showing the overall air conditioning system layout for the Gerbang project, including the Industrial Operation Centre (IOC) and guard house.",
    descriptionBm: "Pelan tapak menunjukkan susun atur keseluruhan sistem penghawa dingin untuk projek Gerbang, termasuk Pusat Operasi Industri (IOC) dan rumah pengawal.",
    drawnBy: "SHZ", designedBy: "AMIRAH", checkedBy: "LCK", approvedBy: "PUKA",
    scale: "1:100 (A1)", renderType: "site-plan",
    files: [
      { filename: "FAC118-M-ACMV-C-G-002.dwg", fileType: "dwg", sizeKb: 356, uploadedBy: "SHZ", daysAgo: 12 },
      { filename: "FAC118-M-ACMV-C-G-002.pdf", fileType: "pdf", sizeKb: 1240, uploadedBy: "SHZ", daysAgo: 12 },
    ],
  },
  {
    number: "FAC118-M-ACMV-C-G-003",
    title: "Air Conditioning System - Air Conditioning Layout Plan - Schedule of Equipment",
    titleBm: "Sistem Penghawa Dingin - Pelan Susun Atur Penghawa Dingin - Jadual Peralatan",
    category: "ACMV", status: "Construction", version: "00",
    description: "Ground floor air conditioning layout plan showing wall-mounted FCU-GER-OFF-01/02 (1.5 HP, 11,900 BTU/hr each) in the MPKL Office, condensing units CU-GER-OFF-01/02, refrigerant pipes, and Ø20mm drain pipes. Includes schedule of equipment.",
    descriptionBm: "Pelan susun atur penghawa dingin tingkat tanah menunjukkan FCU-GER-OFF-01/02 (1.5 HP, 11,900 BTU/jam) di Pejabat MPKL, unit pemeluwap CU-GER-OFF-01/02, paip refrigeran, dan paip saliran Ø20mm. Termasuk jadual peralatan.",
    drawnBy: "SHZ", designedBy: "AMIRAH", checkedBy: "LCK", approvedBy: "PUKA",
    scale: "1:50 (A1)", renderType: "floor-plan",
    files: [
      { filename: "FAC118-M-ACMV-C-G-003.dwg", fileType: "dwg", sizeKb: 412, uploadedBy: "SHZ", daysAgo: 10 },
      { filename: "FAC118-M-ACMV-C-G-003.pdf", fileType: "pdf", sizeKb: 1320, uploadedBy: "SHZ", daysAgo: 10 },
    ],
  },
  {
    number: "FAC118-M-ACMV-C-G-004",
    title: "Air Conditioning System - Standard Details",
    titleBm: "Sistem Penghawa Dingin - Butiran Standard",
    category: "ACMV", status: "Construction", version: "00",
    description: "Standard details for ACMV installation: condensing unit wall/floor mount, ceiling cassette FCU installation, refrigerant piping schematic, drain pipe details, vibration isolators, and GI trunking penetrations.",
    descriptionBm: "Butiran standard pemasangan ACMV: pemasangan dinding/lantai unit pemeluwap, pemasangan FCU kaset siling, skematik paip refrigeran, butiran paip saliran, pengasing getaran, danpenetrasi trunking GI.",
    drawnBy: "SHZ", designedBy: "AMIRAH", checkedBy: "LCK", approvedBy: "PUKA",
    scale: "N.T.S", renderType: "standard-details",
    files: [
      { filename: "FAC118-M-ACMV-C-G-004.dwg", fileType: "dwg", sizeKb: 528, uploadedBy: "SHZ", daysAgo: 10 },
      { filename: "FAC118-M-ACMV-C-G-004.pdf", fileType: "pdf", sizeKb: 1480, uploadedBy: "SHZ", daysAgo: 10 },
    ],
  },

  // ── MECHANICAL — CWSP (Cold Water & Sanitary Plumbing) ───────────────────
  {
    number: "FAC118-M-CWSP-C-G-001",
    title: "Cold Water & Sanitary Plumbing System - Notes & Legend - List of Drawing",
    titleBm: "Sistem Paip Air Sejuk & Paip Sanitari - Nota & Lagenda - Senarai Lukisan",
    category: "CWSP", status: "Construction", version: "00",
    description: "Notes, legend (cold water + sanitary symbols), and list of drawings. Legend includes urinal, basin, shower, WC, gate valve, water meter, floor trap, gully trap, grease interceptor, inspection chamber.",
    descriptionBm: "Nota, lagenda (simbol air sejuk + sanitari), dan senarai lukisan. Lagenda termasuk urinal, besen, pancuran, WC, injap gerbang, meter air, perangkap lantai, perangkap gully, perangkap gris, kebuk pemeriksaan.",
    drawnBy: "SHZ", designedBy: "AMIRAH", checkedBy: "LCK", approvedBy: "PUKA",
    scale: "N.T.S", renderType: "notes-legend",
    files: [
      { filename: "FAC118-M-CWSP-C-G-001.dwg", fileType: "dwg", sizeKb: 312, uploadedBy: "SHZ", daysAgo: 14 },
      { filename: "FAC118-M-CWSP-C-G-001.pdf", fileType: "pdf", sizeKb: 1380, uploadedBy: "SHZ", daysAgo: 14 },
    ],
  },
  {
    number: "FAC118-M-CWSP-C-G-002",
    title: "Cold Water and Sanitary Plumbing System - Site Plan",
    titleBm: "Sistem Paip Air Sejuk dan Sanitari - Pelan Tapak",
    category: "CWSP", status: "Construction", version: "00",
    description: "Site plan showing the cold water and sanitary plumbing layout for the Gerbang project.",
    descriptionBm: "Pelan tapak menunjukkan susun atur paip air sejuk dan sanitari untuk projek Gerbang.",
    drawnBy: "SHZ", designedBy: "AMIRAH", checkedBy: "LCK", approvedBy: "PUKA",
    scale: "1:100 (A1)", renderType: "site-plan",
    files: [
      { filename: "FAC118-M-CWSP-C-G-002.dwg", fileType: "dwg", sizeKb: 384, uploadedBy: "SHZ", daysAgo: 14 },
      { filename: "FAC118-M-CWSP-C-G-002.pdf", fileType: "pdf", sizeKb: 1420, uploadedBy: "SHZ", daysAgo: 14 },
    ],
  },
  {
    number: "FAC118-M-CWSP-C-G-003",
    title: "Cold Water and Sanitary Plumbing System - Ground Floor Plan (Cold Water Services)",
    titleBm: "Sistem Paip Air Sejuk dan Sanitari - Pelan Tingkat Tanah (Perkhidmatan Air Sejuk)",
    category: "CWSP", status: "Construction", version: "00",
    description: "Ground floor cold water layout plan. Incoming 75mm HDPE pipe to tank level, 25mm HDPE drop to ground floor. Fixtures: WC, basin, floor trap, sink in MPKL Office, Utilities, Prayer Room, Toilet, Security Guard Rooms.",
    descriptionBm: "Pelan susun atur air sejuk tingkat tanah. Paip HDPE 75mm masuk ke aras tangki, turun HDPE 25mm ke tingkat tanah. Periuk: WC, besen, perangkap lantai, sink di Pejabat MPKL, Utiliti, Surau, Tandas, Bilik Pengawal.",
    drawnBy: "SHZ", designedBy: "AMIRAH", checkedBy: "LCK", approvedBy: "PUKA",
    scale: "1:50 (A1)", renderType: "floor-plan",
    files: [
      { filename: "FAC118-M-CWSP-C-G-003.dwg", fileType: "dwg", sizeKb: 448, uploadedBy: "SHZ", daysAgo: 11 },
      { filename: "FAC118-M-CWSP-C-G-003.pdf", fileType: "pdf", sizeKb: 1520, uploadedBy: "SHZ", daysAgo: 11 },
    ],
  },
  {
    number: "FAC118-M-CWSP-C-G-004",
    title: "Cold Water and Sanitary Plumbing System - Cold Water Tank Layout Plan - Cold Water Schematic Diagram",
    titleBm: "Sistem Paip Air Sejuk dan Sanitari - Pelan Susun Atur Tangki Air Sejuk - Gambarajah Skematik Air Sejuk",
    category: "CWSP", status: "Construction", version: "00",
    description: "Cold water tank layout plan and schematic diagram showing the tank, pump set, and distribution piping to fixtures.",
    descriptionBm: "Pelan susun atur tangki air sejuk dan gambarajah skematik menunjukkan tangki, set pam, dan paip agihan ke peranti.",
    drawnBy: "SHZ", designedBy: "AMIRAH", checkedBy: "LCK", approvedBy: "PUKA",
    scale: "1:50 (A1)", renderType: "schematic",
    files: [
      { filename: "FAC118-M-CWSP-C-G-004.dwg", fileType: "dwg", sizeKb: 392, uploadedBy: "SHZ", daysAgo: 11 },
      { filename: "FAC118-M-CWSP-C-G-004.pdf", fileType: "pdf", sizeKb: 1460, uploadedBy: "SHZ", daysAgo: 11 },
    ],
  },
  {
    number: "FAC118-M-CWSP-C-G-005",
    title: "Cold Water and Sanitary Plumbing System - Ground Floor Layout Plan - Sanitary Plumbing Schematic Diagram",
    titleBm: "Sistem Paip Air Sejuk dan Sanitari - Pelan Tingkat Tanah - Gambarajah Skematik Paip Sanitari",
    category: "CWSP", status: "Construction", version: "00",
    description: "Ground floor sanitary plumbing layout plan and schematic diagram showing soil, waste, and vent pipe routing to inspection chambers.",
    descriptionBm: "Pelan susun atur paip sanitari tingkat tanah dan gambarajah skematik menunjukkan laluan paip tanah, sisa, dan ventilasi ke kebuk pemeriksaan.",
    drawnBy: "SHZ", designedBy: "AMIRAH", checkedBy: "LCK", approvedBy: "PUKA",
    scale: "AS SHOWN", renderType: "schematic",
    files: [
      { filename: "FAC118-M-CWSP-C-G-005.dwg", fileType: "dwg", sizeKb: 408, uploadedBy: "SHZ", daysAgo: 9 },
      { filename: "FAC118-M-CWSP-C-G-005.pdf", fileType: "pdf", sizeKb: 1500, uploadedBy: "SHZ", daysAgo: 9 },
    ],
  },
  {
    number: "FAC118-M-CWSP-C-G-006",
    title: "Cold Water and Sanitary Plumbing System - Standard Details 1",
    titleBm: "Sistem Paip Air Sejuk dan Sanitari - Butiran Standard 1",
    category: "CWSP", status: "Construction", version: "00",
    description: "Standard plumbing details part 1: pipe joints, valve boxes, water meter installation, trench details.",
    descriptionBm: "Butiran standard paip bahagian 1: sambungan paip, kotak injap, pemasangan meter air, butiran parit.",
    drawnBy: "SHZ", designedBy: "AMIRAH", checkedBy: "LCK", approvedBy: "PUKA",
    scale: "N.T.S", renderType: "standard-details",
    files: [
      { filename: "FAC118-M-CWSP-C-G-006.dwg", fileType: "dwg", sizeKb: 364, uploadedBy: "SHZ", daysAgo: 9 },
      { filename: "FAC118-M-CWSP-C-G-006.pdf", fileType: "pdf", sizeKb: 1440, uploadedBy: "SHZ", daysAgo: 9 },
    ],
  },
  {
    number: "FAC118-M-CWSP-C-G-007",
    title: "Cold Water and Sanitary Plumbing System - Standard Details 2",
    titleBm: "Sistem Paip Air Sejuk dan Sanitari - Butiran Standard 2",
    category: "CWSP", status: "Construction", version: "00",
    description: "Standard plumbing details part 2: fixture installation, floor trap details, grease interceptor details.",
    descriptionBm: "Butiran standard paip bahagian 2: pemasangan peranti, butiran perangkap lantai, butiran perangkap gris.",
    drawnBy: "SHZ", designedBy: "AMIRAH", checkedBy: "LCK", approvedBy: "PUKA",
    scale: "N.T.S", renderType: "standard-details",
    files: [
      { filename: "FAC118-M-CWSP-C-G-007.dwg", fileType: "dwg", sizeKb: 348, uploadedBy: "SHZ", daysAgo: 8 },
      { filename: "FAC118-M-CWSP-C-G-007.pdf", fileType: "pdf", sizeKb: 1420, uploadedBy: "SHZ", daysAgo: 8 },
    ],
  },
  {
    number: "FAC118-M-CWSP-C-G-008",
    title: "Cold Water & Sanitary Plumbing System - Standard Details 3",
    titleBm: "Sistem Paip Air Sejuk & Sanitari - Butiran Standard 3",
    category: "CWSP", status: "Construction", version: "00",
    description: "Standard plumbing details part 3: inspection chamber details, manhole details, vent cowl installation.",
    descriptionBm: "Butiran standard paip bahagian 3: butiran kebuk pemeriksaan, butiran manhole, pemasangan tudung ventilasi.",
    drawnBy: "SHZ", designedBy: "AMIRAH", checkedBy: "LCK", approvedBy: "PUKA",
    scale: "N.T.S", renderType: "standard-details",
    files: [
      { filename: "FAC118-M-CWSP-C-G-008.dwg", fileType: "dwg", sizeKb: 332, uploadedBy: "SHZ", daysAgo: 8 },
      { filename: "FAC118-M-CWSP-C-G-008.pdf", fileType: "pdf", sizeKb: 1380, uploadedBy: "SHZ", daysAgo: 8 },
    ],
  },

  // ── MECHANICAL — FPS (Fire Protection System) ────────────────────────────
  {
    number: "FAC118-M-FP-C-G-001",
    title: "Fire Protection System - List of Drawing - Layout Plan - Standard Details",
    titleBm: "Sistem Perlindungan Kebakaran - Senarai Lukisan - Pelan Susun Atur - Butiran Standard",
    category: "FPS", status: "Construction", version: "00",
    description: "Fire protection layout plan for Guard House and Gerbang, plus standard details. Symbols: ABC dry powder extinguisher (9kg), portable CO2 extinguisher (2kg), sprinkler heads. Includes bracket detail 'A' (side + front view).",
    descriptionBm: "Pelan susun atur perlindungan kebakaran untuk Rumah Pengawal dan Gerbang, serta butiran standard. Simbol: alat pemadam serbuk kering ABC (9kg), alat pemadam CO2 mudah alih (2kg), kepala sprinkler. Termasuk butiran braket 'A' (sisi + hadapan).",
    drawnBy: "SHZ", designedBy: "AMIRAH", checkedBy: "LCK", approvedBy: "PUKA",
    scale: "1:50 (A1)", renderType: "floor-plan",
    files: [
      { filename: "FAC118-M-FP-C-G-001.dwg", fileType: "dwg", sizeKb: 284, uploadedBy: "SHZ", daysAgo: 7 },
      { filename: "FAC118-M-FP-C-G-001.pdf", fileType: "pdf", sizeKb: 254, uploadedBy: "SHZ", daysAgo: 7 },
    ],
  },
  {
    number: "FAC118-M-FP-C-G-002",
    title: "Fire Protection System - Site Plan",
    titleBm: "Sistem Perlindungan Kebakaran - Pelan Tapak",
    category: "FPS", status: "Construction", version: "00",
    description: "Site plan showing the overall fire protection system layout for the Gerbang project.",
    descriptionBm: "Pelan tapak menunjukkan susun atur keseluruhan sistem perlindungan kebakaran untuk projek Gerbang.",
    drawnBy: "SHZ", designedBy: "AMIRAH", checkedBy: "LCK", approvedBy: "PUKA",
    scale: "1:100 (A1)", renderType: "site-plan",
    files: [
      { filename: "FAC118-M-FP-C-G-002.dwg", fileType: "dwg", sizeKb: 256, uploadedBy: "SHZ", daysAgo: 7 },
      { filename: "FAC118-M-FP-C-G-002.pdf", fileType: "pdf", sizeKb: 248, uploadedBy: "SHZ", daysAgo: 7 },
    ],
  },

  // ── ELECTRICAL — General ─────────────────────────────────────────────────
  {
    number: "FAC118-E-GEN-C-G-001",
    title: "General - List of Drawings",
    titleBm: "Am - Senarai Lukisan",
    category: "General", status: "Construction", version: "00",
    description: "General list of drawings for the electrical services package.",
    descriptionBm: "Senarai lukisan am untuk pakej perkhidmatan elektrikal.",
    drawnBy: "SHZ", designedBy: "AMIRAH", checkedBy: "LCK", approvedBy: "PUKA",
    scale: "N.T.S", renderType: "schedule",
    files: [
      { filename: "FAC118-E-GEN-C-G-001.dwg", fileType: "dwg", sizeKb: 168, uploadedBy: "SHZ", daysAgo: 6 },
    ],
  },
  {
    number: "FAC118-E-GEN-C-G-002",
    title: "General - Site Layout",
    titleBm: "Am - Susun Atur Tapak",
    category: "General", status: "Construction", version: "00",
    description: "General site layout showing the electrical services overall site arrangement.",
    descriptionBm: "Susun atur tapak am menunjukkan susun atur keseluruhan perkhidmatan elektrikal.",
    drawnBy: "SHZ", designedBy: "AMIRAH", checkedBy: "LCK", approvedBy: "PUKA",
    scale: "1:500 (A1)", renderType: "site-plan",
    files: [
      { filename: "FAC118-E-GEN-C-G-002.dwg", fileType: "dwg", sizeKb: 224, uploadedBy: "SHZ", daysAgo: 6 },
    ],
  },

  // ── ELECTRICAL — Infrastructure ──────────────────────────────────────────
  {
    number: "FAC118-E-INF-C-G-001",
    title: "Electrical Services - Telecommunication Infrastructure Layout",
    titleBm: "Perkhidmatan Elektrikal - Susun Atur Infrastruktur Telekomunikasi",
    category: "Infrastructure", status: "Construction", version: "00",
    description: "Telecommunication infrastructure layout plan showing fiber optic, telephone, and data cable routing.",
    descriptionBm: "Pelan susun atur infrastruktur telekomunikasi menunjukkan laluan kabel gentian optik, telefon, dan data.",
    drawnBy: "SHZ", designedBy: "AMIRAH", checkedBy: "LCK", approvedBy: "PUKA",
    scale: "1:50 (A1)", renderType: "floor-plan",
    files: [
      { filename: "FAC118-E-INF-C-G-001.dwg", fileType: "dwg", sizeKb: 248, uploadedBy: "SHZ", daysAgo: 5 },
    ],
  },

  // ── ELECTRICAL — Lighting ────────────────────────────────────────────────
  {
    number: "FAC118-E-L-C-G-001",
    title: "Electrical Services Lighting Layout - Ground Floor Layout at 6000mm Height",
    titleBm: "Perkhidmatan Elektrikal Susun Atur Pencahayaan - Pelan Tingkat Tanah pada Ketinggian 6000mm",
    category: "Lighting", status: "Construction", version: "00",
    description: "Lighting layout plan at 6000mm ceiling height showing light fixtures, switches, and conduit runs.",
    descriptionBm: "Pelan susun atur pencahayaan pada ketinggian siling 6000mm menunjukkan lampu, suis, dan laluan konduit.",
    drawnBy: "SHZ", designedBy: "AMIRAH", checkedBy: "LCK", approvedBy: "PUKA",
    scale: "1:50 (A1)", renderType: "floor-plan",
    files: [
      { filename: "FAC118-E-L-C-G-001.dwg", fileType: "dwg", sizeKb: 284, uploadedBy: "SHZ", daysAgo: 5 },
    ],
  },
  {
    number: "FAC118-E-L-C-G-002",
    title: "Electrical Services Lighting Layout - Ground Floor Layout at 3500mm Height",
    titleBm: "Perkhidmatan Elektrikal Susun Atur Pencahayaan - Pelan Tingkat Tanah pada Ketinggian 3500mm",
    category: "Lighting", status: "Construction", version: "00",
    description: "Lighting layout plan at 3500mm ceiling height showing light fixtures, switches, and conduit runs.",
    descriptionBm: "Pelan susun atur pencahayaan pada ketinggian siling 3500mm menunjukkan lampu, suis, dan laluan konduit.",
    drawnBy: "SHZ", designedBy: "AMIRAH", checkedBy: "LCK", approvedBy: "PUKA",
    scale: "1:50 (A1)", renderType: "floor-plan",
    files: [
      { filename: "FAC118-E-L-C-G-002.dwg", fileType: "dwg", sizeKb: 268, uploadedBy: "SHZ", daysAgo: 5 },
    ],
  },

  // ── ELECTRICAL — Small Power ─────────────────────────────────────────────
  {
    number: "FAC118-E-S-C-G-001",
    title: "Electrical Services Small Power Layout - Ground Floor Layout",
    titleBm: "Perkhidmatan Elektrikal Susun Atur Kuasa Kecil - Pelan Tingkat Tanah",
    category: "Small Power", status: "Construction", version: "00",
    description: "Small power layout plan showing 13A socket outlets, isolated earth sockets, switches, and conduit runs.",
    descriptionBm: "Pelan susun atur kuasa kecil menunjukkan soket 13A, soket earth terpencil, suis, dan laluan konduit.",
    drawnBy: "SHZ", designedBy: "AMIRAH", checkedBy: "LCK", approvedBy: "PUKA",
    scale: "1:50 (A1)", renderType: "floor-plan",
    files: [
      { filename: "FAC118-E-S-C-G-001.dwg", fileType: "dwg", sizeKb: 252, uploadedBy: "SHZ", daysAgo: 4 },
    ],
  },

  // ── ELECTRICAL — DB/MCP ──────────────────────────────────────────────────
  {
    number: "FAC118-E-DB-C-G-001",
    title: "Electrical Services DB/MCP Layout - Ground Floor Layout",
    titleBm: "Perkhidmatan Elektrikal Susun Atur DB/MCP - Pelan Tingkat Tanah",
    category: "DB/SLD", status: "Construction", version: "00",
    description: "Distribution Board / Motor Control Panel layout plan showing DB locations, MCP positions, and cable routing.",
    descriptionBm: "Pelan susun atur Papan Agihan / Papan Kawalan Motor menunjukkan lokasi DB, kedudukan MCP, dan laluan kabel.",
    drawnBy: "SHZ", designedBy: "AMIRAH", checkedBy: "LCK", approvedBy: "PUKA",
    scale: "1:50 (A1)", renderType: "floor-plan",
    files: [
      { filename: "FAC118-E-DB-C-G-001.dwg", fileType: "dwg", sizeKb: 264, uploadedBy: "SHZ", daysAgo: 4 },
    ],
  },

  // ── ELECTRICAL — Single Line Diagram ─────────────────────────────────────
  {
    number: "FAC118-E-SLD-C-G-001",
    title: "Electrical Services Single Line Diagram - MSB & EMSB",
    titleBm: "Perkhidmatan Elektrikal Gambarajah Garis Tunggal - MSB & EMSB",
    category: "DB/SLD", status: "Construction", version: "00",
    description: "Single line diagram for Main Switch Board (MSB) and Emergency Main Switch Board (EMSB) showing incoming supply, bus coupler, outgoing feeders, and protection relays.",
    descriptionBm: "Gambarajah garis tunggal untuk Papan Suis Utama (MSB) dan Papan Suis Utama Kecemasan (EMSB) menunjukkan bekalan masuk, bus coupler, feeder keluar, dan relay perlindungan.",
    drawnBy: "SHZ", designedBy: "AMIRAH", checkedBy: "LCK", approvedBy: "PUKA",
    scale: "N.T.S", renderType: "single-line",
    files: [
      { filename: "FAC118-E-SLD-C-G-001.dwg", fileType: "dwg", sizeKb: 312, uploadedBy: "SHZ", daysAgo: 3 },
    ],
  },
  {
    number: "FAC118-E-SLD-C-G-002",
    title: "Electrical Services Single Line Diagram - DB",
    titleBm: "Perkhidmatan Elektrikal Gambarajah Garis Tunggal - DB",
    category: "DB/SLD", status: "Construction", version: "00",
    description: "Single line diagram for sub-distribution boards (DB) showing incoming breaker, busbar, and outgoing MCB/RCBO circuits.",
    descriptionBm: "Gambarajah garis tunggal untuk papan agihan sub (DB) menunjukkan pemutus masuk, basbar, dan litar MCB/RCBO keluar.",
    drawnBy: "SHZ", designedBy: "AMIRAH", checkedBy: "LCK", approvedBy: "PUKA",
    scale: "N.T.S", renderType: "single-line",
    files: [
      { filename: "FAC118-E-SLD-C-G-002.dwg", fileType: "dwg", sizeKb: 248, uploadedBy: "SHZ", daysAgo: 3 },
    ],
  },
  {
    number: "FAC118-E-SLD-C-G-003",
    title: "Electrical Services Single Line Diagram - Network Gateway Controller (NGC)",
    titleBm: "Perkhidmatan Elektrikal Gambarajah Garis Tunggal - Pengawal Get Rangkaian (NGC)",
    category: "DB/SLD", status: "Construction", version: "00",
    description: "Single line diagram for the Network Gateway Controller (NGC) showing BMS integration, communication loops, and I/O points.",
    descriptionBm: "Gambarajah garis tunggal untuk Pengawal Get Rangkaian (NGC) menunjukkan integrasi BMS, gelung komunikasi, dan titik I/O.",
    drawnBy: "SHZ", designedBy: "AMIRAH", checkedBy: "LCK", approvedBy: "PUKA",
    scale: "N.T.S", renderType: "single-line",
    files: [
      { filename: "FAC118-E-SLD-C-G-003.dwg", fileType: "dwg", sizeKb: 224, uploadedBy: "SHZ", daysAgo: 3 },
    ],
  },

  // ── ELECTRICAL — Lightning Protection System ─────────────────────────────
  {
    number: "FAC118-E-LPS-C-G-001",
    title: "Electrical Services Lightning Protection System - Ground Floor Plan",
    titleBm: "Perkhidmatan Elektrikal Sistem Perlindungan Kilat - Pelan Tingkat Tanah",
    category: "LPS", status: "Construction", version: "00",
    description: "Lightning protection system ground floor plan showing air terminal positions, down conductor routing, and earth electrode locations.",
    descriptionBm: "Pelan tingkat tanah sistem perlindungan kilat menunjukkan kedudukan terminal udara, laluan konduktor turun, dan lokasi elektrod earth.",
    drawnBy: "SHZ", designedBy: "AMIRAH", checkedBy: "LCK", approvedBy: "PUKA",
    scale: "1:50 (A1)", renderType: "floor-plan",
    files: [
      { filename: "FAC118-E-LPS-C-G-001.dwg", fileType: "dwg", sizeKb: 244, uploadedBy: "SHZ", daysAgo: 2 },
    ],
  },
  {
    number: "FAC118-E-LPS-C-G-002",
    title: "Electrical Services Lightning Protection System - Roof Plan",
    titleBm: "Perkhidmatan Elektrikal Sistem Perlindungan Kilat - Pelan Bumbung",
    category: "LPS", status: "Construction", version: "00",
    description: "Lightning protection roof plan showing air terminal (finial) layout on the roof, rolling sphere method coverage, and down conductor positions.",
    descriptionBm: "Pelan bumbung perlindungan kilat menunjukkan susun atur terminal udara (finial) di bumbung, liputan kaedah sfera bergolek, dan kedudukan konduktor turun.",
    drawnBy: "SHZ", designedBy: "AMIRAH", checkedBy: "LCK", approvedBy: "PUKA",
    scale: "1:50 (A1)", renderType: "floor-plan",
    files: [
      { filename: "FAC118-E-LPS-C-G-002.dwg", fileType: "dwg", sizeKb: 228, uploadedBy: "SHZ", daysAgo: 2 },
    ],
  },
  {
    number: "FAC118-E-LPS-C-G-003",
    title: "Electrical Services Lightning Protection System - Elevation",
    titleBm: "Perkhidmatan Elektrikal Sistem Perlindungan Kilat - Dongakan",
    category: "LPS", status: "Construction", version: "00",
    description: "Lightning protection elevation drawing showing building height, air terminal tip elevations, and down conductor vertical runs.",
    descriptionBm: "Dongakan perlindungan kilat menunjukkan ketinggian bangunan, ketinggian hujung terminal udara, dan laluan menegak konduktor turun.",
    drawnBy: "SHZ", designedBy: "AMIRAH", checkedBy: "LCK", approvedBy: "PUKA",
    scale: "1:50 (A1)", renderType: "standard-details",
    files: [
      { filename: "FAC118-E-LPS-C-G-003.dwg", fileType: "dwg", sizeKb: 196, uploadedBy: "SHZ", daysAgo: 2 },
    ],
  },
  {
    number: "FAC118-E-LPS-C-G-004",
    title: "Electrical Services Lightning Protection System - Installation Details",
    titleBm: "Perkhidmatan Elektrikal Sistem Perlindungan Kilat - Butiran Pemasangan",
    category: "LPS", status: "Construction", version: "00",
    description: "Lightning protection installation details: air terminal base, down conductor clip, earth pit detail, and earth rod joint.",
    descriptionBm: "Butiran pemasangan perlindungan kilat: tapak terminal udara, klip konduktor turun, butiran lubang earth, dan sambungan rod earth.",
    drawnBy: "SHZ", designedBy: "AMIRAH", checkedBy: "LCK", approvedBy: "PUKA",
    scale: "N.T.S", renderType: "standard-details",
    files: [
      { filename: "FAC118-E-LPS-C-G-004.dwg", fileType: "dwg", sizeKb: 212, uploadedBy: "SHZ", daysAgo: 2 },
    ],
  },
];

// Checklist template (15 items — adapted for M&E construction drawings)
const checklistTemplate: { label: string; labelBm: string; category: string; order: number }[] = [
  // Drawing conformance (4)
  { label: "Drawing number follows FAC118-<DISC>-<SYS>-C-G-<SEQ> format", labelBm: "Nombor lukisan mengikut format FAC118-<DISC>-<SYS>-C-G-<URUT>", category: "Dimensional", order: 1 },
  { label: "Title block complete (drawn/designed/checked/approved by)",   labelBm: "Blok tajuk lengkap (dilukis/direka/disemak/diluluskan oleh)", category: "Documentation", order: 6 },
  { label: "Scale and sheet size marked (e.g. 1:50 A1, N.T.S)",            labelBm: "Skala dan saiz helaian ditandakan (cth. 1:50 A1, N.T.S)", category: "Documentation", order: 7 },
  { label: "Revision number marked (00 for initial issue)",                labelBm: "Nombor semakan ditandakan (00 untuk keluaran awal)", category: "Documentation", order: 8 },
  // Coordination (3)
  { label: "Architectural background matches latest issue",                labelBm: "Latar belakang senibina sepadan dengan keluaran terkini", category: "Dimensional", order: 2 },
  { label: "Coordinates with structural (no clash with beams/columns)",    labelBm: "Berkoordinasi dengan struktur (tiada perlanggaran dengan rasuk/tiang)", category: "Dimensional", order: 3 },
  { label: "Cross-discipline coordination (M-E, E-M, C-S)",                labelBm: "Koordinasi antara disiplin (M-E, E-M, C-S)", category: "Dimensional", order: 4 },
  // Compliance (4)
  { label: "Complies with Uniform Building By-Law (UBBL) Malaysia",        labelBm: "Mematuhi Undang-Undang Kecil Bangunan Seragam (UBBL) Malaysia", category: "Quality", order: 11 },
  { label: "MS/IES/BS standards referenced in notes",                      labelBm: "Standard MS/IES/BS dirujuk dalam nota", category: "Quality", order: 12 },
  { label: "Fire authority (BOMBA) submission requirements met",           labelBm: "Keperluan penyerapan pihak berkuasa kebakaran (BOMBA) dipenuhi", category: "Quality", order: 13 },
  { label: "Local authority (MPKL) submission requirements met",           labelBm: "Keperluan penyerapan pihak berkuasa tempatan (MPKL) dipenuhi", category: "Quality", order: 14 },
  // Documentation (3)
  { label: "Legend and notes consistent across sheets",                    labelBm: "Lagenda dan nota konsisten antara helaian", category: "Documentation", order: 9 },
  { label: "Equipment tags match schedule of equipment",                   labelBm: "Tag peralatan sepadan dengan jadual peralatan", category: "Manufacturing", order: 15 },
  { label: "All dimensions in millimetres (mm) unless noted",              labelBm: "Semua dimensi dalam milimeter (mm) kecuali dinyatakan", category: "Dimensional", order: 5 },
];

// Audit entries
const auditEntries: { user: string; action: string; detail: string; drawingNumber: string; daysAgo: number }[] = [
  { user: "SHZ",     action: "upload",         detail: "Uploaded FAC118-M-ACMV-C-G-001.pdf",            drawingNumber: "FAC118-M-ACMV-C-G-001", daysAgo: 12 },
  { user: "SHZ",     action: "upload",         detail: "Uploaded FAC118-M-ACMV-C-G-003.pdf",            drawingNumber: "FAC118-M-ACMV-C-G-003", daysAgo: 10 },
  { user: "LCK",     action: "status_change",  detail: "Submission -> Construction",                    drawingNumber: "FAC118-M-ACMV-C-G-001", daysAgo: 9 },
  { user: "LCK",     action: "checklist_tick", detail: "Ticked 'Title block complete'",                  drawingNumber: "FAC118-M-ACMV-C-G-003", daysAgo: 9 },
  { user: "PUKA",    action: "status_change",  detail: "For Review -> Construction",                    drawingNumber: "FAC118-M-CWSP-C-G-003", daysAgo: 8 },
  { user: "SHZ",     action: "upload",         detail: "Uploaded FAC118-M-FP-C-G-001.pdf",              drawingNumber: "FAC118-M-FP-C-G-001", daysAgo: 7 },
  { user: "LCK",     action: "checklist_tick", detail: "Ticked 'MS/IES/BS standards referenced'",       drawingNumber: "FAC118-M-CWSP-C-G-003", daysAgo: 7 },
  { user: "SHZ",     action: "upload",         detail: "Uploaded FAC118-E-L-C-G-001.dwg",               drawingNumber: "FAC118-E-L-C-G-001", daysAgo: 5 },
  { user: "LCK",     action: "status_change",  detail: "Draft -> Construction",                         drawingNumber: "FAC118-E-SLD-C-G-001", daysAgo: 3 },
  { user: "PUKA",    action: "status_change",  detail: "For Review -> Construction",                    drawingNumber: "FAC118-E-LPS-C-G-001", daysAgo: 2 },
  { user: "SHZ",     action: "login",          detail: "Signed in from 10.1.5.22",                       drawingNumber: "", daysAgo: 1 },
  { user: "Amirah",  action: "login",          detail: "Signed in from 10.1.5.23",                       drawingNumber: "", daysAgo: 1 },
];

async function main() {
  console.log("→ Wiping existing data…");
  await db.auditTrail.deleteMany();
  await db.bomItem.deleteMany();
  await db.checklistItem.deleteMany();
  await db.file.deleteMany();
  await db.drawing.deleteMany();
  await db.user.deleteMany();

  console.log("→ Seeding users…");
  await db.user.createMany({ data: users });

  console.log("→ Seeding 28 M&E drawings…");
  const now = Date.now();
  let fullyTickedCount = 0;
  for (const d of drawings) {
    const created = new Date(now - 60 * 24 * 3600 * 1000);
    const drawing = await db.drawing.create({
      data: {
        number: d.number,
        title: d.title,
        titleBm: d.titleBm,
        category: d.category,
        status: d.status,
        version: d.version,
        description: d.description,
        descriptionBm: d.descriptionBm,
        drawnBy: d.drawnBy,
        checkedBy: d.checkedBy,
        approvedBy: d.approvedBy,
        mass: 0,        // M&E drawings don't have mass
        material: "—",  // M&E drawings don't have material
      },
    });

    for (const f of d.files) {
      await db.file.create({
        data: {
          drawingId: drawing.id,
          filename: f.filename,
          fileType: f.fileType,
          sizeKb: f.sizeKb,
          uploadedBy: f.uploadedBy,
          uploadedAt: new Date(now - f.daysAgo * 24 * 3600 * 1000),
        },
      });
    }

    // Checklist — tick the first 4-5 items for drawings that are in Construction status
    const tickCount = d.status === "Construction" ? Math.min(5, Math.floor(Math.random() * 3) + 4) : 0;
    for (const item of checklistTemplate) {
      const checked = item.order <= tickCount;
      if (checked) fullyTickedCount++;
      await db.checklistItem.create({
        data: {
          drawingId: drawing.id,
          label: item.label,
          labelBm: item.labelBm,
          category: item.category,
          order: item.order,
          checked,
          checkedBy: checked ? "LCK" : null,
          checkedAt: checked ? new Date(now - 8 * 24 * 3600 * 1000) : null,
        },
      });
    }
  }

  console.log("→ Seeding audit trail…");
  for (const a of auditEntries) {
    let drawingId: string | null = null;
    if (a.drawingNumber) {
      const drw = await db.drawing.findUnique({ where: { number: a.drawingNumber } });
      drawingId = drw?.id ?? null;
    }
    await db.auditTrail.create({
      data: {
        drawingId,
        user: a.user,
        action: a.action,
        detail: a.detail,
        createdAt: new Date(now - a.daysAgo * 24 * 3600 * 1000),
      },
    });
  }

  console.log("✓ Seed complete");
  const counts = {
    drawings: await db.drawing.count(),
    files: await db.file.count(),
    checklistItems: await db.checklistItem.count(),
    bomItems: await db.bomItem.count(),
    auditTrails: await db.auditTrail.count(),
    users: await db.user.count(),
  };
  console.log(counts);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
