# Project-Drawing-Management-System
A full-stack web application built for the project department to manage engineering construction drawings throughout their entire lifecycle — from initial design through the 6-department sign-off process to final controlled issue. Covers all drawing disciplines: Architectural, Structural, Civil, M&E (Mechanical & Electrical), and Landscape. The system is modeled after real Malaysian construction industry workflows, with a 6-step sign-off flow that routes every drawing through Architect → Technical → M&E → QS/Contract → Sales Admin → Sales & Marketing before the Document Controller issues it as a controlled document.

A full-stack Next.js web application for managing engineering construction drawings.

## Features

- **Dashboard** — KPI tiles, status/category charts, recent drawings table, audit feed
- **Drawings Library** — searchable/filterable grid with thumbnails, upload, create new drawing
- **Drawing Detail** — engineering drawing preview, version history, file viewer/download, status workflow, BOM, checklists, audit log
- **Design Change** — side-by-side OLD vs NEW version comparison with circled change markers + AI analysis
- **Schedule of Drawings** — master list grouped by discipline (Architectural, Structural, Civil, M&E, etc.)
- **Sign-Off Flow** — 6-step NCT Group workflow (Architect → Technical → M&E → QS → Sales Admin → Sales & Marketing) with role-based actions
- **AI Assistant** — chat with mock LLM, naming helper, recent activity
- **Prompt to AutoCAD** — generates real AutoLISP code from natural language
- **Auto BOM** — generate Bill of Materials from assembly drawings with CSV export
- **Checklists** — 14-item QA checklist per drawing, audit-logged toggles
- **Audit Trail** — full filterable log of all actions
- **Admin** — users, system stats, AI engine status, storage breakdown

## Role-Based Access

7 roles with different sign-off actions:

| Role | Step | Action Button |
|------|------|---------------|
| Architect | 1 | Submit for Review |
| NCT Project Planning Team | 2 | Approve |
| M&E Department | 3 | Approve |
| QS / Contract | 4 | Approve Cost (on BOM) |
| Sales Admin | 5 | Approve |
| Sales & Marketing | 6 | Sign-off |
| Super Admin | All | All actions |

## Tech Stack

- **Framework**: Next.js 16 (App Router) 
- **Language**: TypeScript 5
- **Database**: Prisma ORM + SQLite
- **Styling**: Tailwind CSS 4 + custom design system
- **UI Components**: shadcn/ui (New York style)
- **Charts**: Recharts
- **Icons**: Lucide React
- **State**: Zustand (persisted)
- **Fonts**: Inter (sans) + JetBrains Mono (technical labels)
- **File Upload**: Multipart form data → disk storage
- **API**: 18 REST API routes (all force-dynamic)

## Getting Started

```bash
# Install dependencies
bun install

# Push database schema
bun run db:push

# Seed the database with 34 sample drawings
bun run scripts/seed.ts

# Start the dev server
bun run dev
```

Open `http://localhost:3000` in your browser.

## Languages

- English (EN)
- Bahasa Melayu (BM)

Toggle the language in the sidebar.

## Project Structure

```
src/
├── app/
│   ├── api/                    # API routes (dashboard, drawings, sign-off, etc.)
│   ├── globals.css             # Light engineering-paper theme
│   ├── layout.tsx              # Root layout + metadata
│   └── page.tsx                # Main page with module switcher
├── components/
│   └── lkl/
│       ├── modules/            # 11 UI modules
│       ├── ui/                 # Shared components (badges, glass cards, engineering drawing)
│       ├── Sidebar.tsx         # Navigation + role switcher
│       └── TopBar.tsx          # Top bar with role badge
└── lib/
    ├── i18n.ts                 # EN + BM translations
    ├── store.ts                # Zustand store (module, lang, role, drawing selection)
    └── db.ts                   # Prisma client

prisma/
└── schema.prisma               # Drawing, File, ChecklistItem, BomItem, AuditTrail, User

scripts/
└── seed.ts                     # 34 sample M&E + Architectural drawings
```

## Database Schema

6 models with full relationships:

     Drawing — number, title (EN/BM), category, status, version, description, drawnBy, designedBy, checkedBy, approvedBy, scale, mass, material
     File — filename, fileType, sizeKb, uploadedBy, uploadedAt (linked to Drawing)
     ChecklistItem — label (EN/BM), category, checked, checkedBy, checkedAt, order (linked to Drawing)
     BomItem — partNumber, description, qty, material, mass, category (linked to Drawing)
     AuditTrail — user, action, detail, createdAt (linked to Drawing, nullable)
     User — name, email, role, active, lastSeen

## Project Explanation
Key Features
📊 Dashboard

     4 KPI tiles: Total Drawings (34), Files Stored, Open Checklist Items, Active Users
     Status distribution: Donut chart showing all 9 drawing statuses (Draft, For Review, Submission, Tender, Construction, As-Built, Approved, Released, Obsolete)
     Category breakdown: Bar chart across 15 disciplines (Architectural, Structural, Civil, ACMV, CWSP, FPS, Lighting, LPS, TNB, etc.)
     30-day upload activity: Area chart showing file upload trends
     Recent drawings table: Clickable rows that open drawing detail
     Audit feed: Real-time timeline of all system actions
     Role-aware welcome banner: Shows the current user's name, role, and step number

📂 Drawings Library

     Searchable + filterable grid of all 34 drawings with blueprint-style SVG thumbnails
     Filter by status (9 options) and category (15 disciplines)
     "New Drawing" button: Create a new drawing with full metadata (number, title EN/BM, category, version, material, mass, description) + optional initial file upload
     Drawing cards show: thumbnail, drawing number (FAC118-...), version badge, title, status chip, category tag, file count, mass

🔍 Drawing Detail

The most comprehensive page — shows everything about a single drawing:

     Engineering drawing preview: Full-size SVG rendering with border, zone markers (1-8 / A-D), title block, dimension lines, balloon callouts, and discipline-specific geometry (floor plans, site plans, schematics, single-line diagrams, standard details)
     Title block (Durianê/NCT Group format): Company logo, consultant label (dynamic per discipline), drawing-type checkboxes (Construction/Submission/Tender/etc.), project title (Malay), owner (NCT LAND), drawing number, scale, drawn/designed/checked/approved by with names + dates, revision table
     Version history timeline: Click any version to view that revision's drawing — each version shows date, drawn by, status, and change description
     Version quick-switch bar: Horizontal V00 / V01 / V02 buttons for fast version switching
     Zoom modal: Full-screen drawing viewer
     Status workflow bar: Click any status to transition (Draft → For Review → Submission → ... → Obsolete), audit-logged
     Sign-off action panel: Role-specific buttons (see Role-Based Access below)
     Stored files: Each file has 👁 View (opens PDF in new tab) + ⬇ Download buttons
     Upload file button: Add files to the current version
     Upload new version button: Bumps version (00→01→02), saves new file, logs audit entry, resets sign-off to step 1
     BOM preview: Bill of Materials table with part numbers, quantities, unit mass
     Checklist progress: 14-item QA checklist with progress bar and category breakdown
     Audit log: Recent actions on this drawing

🔄 Design Change

     Side-by-side OLD vs NEW version comparison with engineering drawings side by side
     Red circled change markers overlaid on both drawings — numbered, color-coded by type (Added=green, Removed=red, Modified=amber, Dimension=blue)
     Interactive markers: Hover or click a change in the list → the matching circle lights up with a pulse ring on both drawings
     Change legend: Counts by type
     Change list: Each change shows number badge, title, description, OLD spec vs NEW spec cards, category
     AI analysis: Verdict (Approve/Approve with conditions/Reject), risk level, manufacturing impact, checklist re-check requirement, affected items, summary
     Generate ECO report button

📋 Schedule of Drawings

     Summary tiles: Total drawings, Mechanical count, Electrical count, Other disciplines count
     Grouped table: All 15 disciplines as section headers with drawing counts
     Each row: No., title, drawing number, version badge, status chip, file count, clickable to open detail

✍️ Sign-Off Flow

Implements the exact NCT Group 6-step workflow from the flow chart:

    Architect — Prepare/Design/Update SPA drawings
    NCT Project Planning Team — Technical coordination & compliance (checked by Khaiqal/Aleif, signed off by Razali Rashid)
    M&E Department — Services coordination (MEP layouts, risers, equipment)
    QS / Contract Department — Cost & BOQ validation
    Sales Admin — SPA & sales documentation check
    Sales & Marketing — Product & sales alignment (final sign-off)

Features:

     Serpentine S-shaped flow diagram with 6 department boxes, arrows, and a Final Controlled Issue box
     Summary tiles: Total, Issued, In Progress, Not Started
     Gate rule banner: "Any 'Revise / Comment' response sends the drawing back to the Architect"
     Drawing selector: Scrollable list with per-drawing sign-off progress bars — drawings at the current user's step are highlighted with "● YOUR ACTION"
     Step-by-step detail: Each of the 6 steps shows status (Approved ✓ / In Review / Pending), approver names, approved dates
     Role-specific action buttons: Only the current role's step shows Approve/Reject buttons; other steps show "Awaiting [department]"
     Final Controlled Issue bar: Shows green ✓ when fully issued

🤖 AI Assistant

     Chat interface with mock LLM backend (600-1200ms response delay)
     5 suggested prompts: "How many approved?", "Show IV trolley drawings", "Which obsolete?", etc.
     3 tabs: Chat / Naming helper / Recent activity
     Naming helper: Generates suggested FAC118 drawing numbers from descriptions
     Session stats: Message count, average latency, engine status
     Supports both EN and BM queries

✏️ Prompt to AutoCAD

     Natural language → AutoLISP code generation
     4 part-type templates: Plate, L-bracket, Castor mount, IV pole star base
     Editable dimensions: Length, width, thickness, hole diameter, hole offset, envelope diameter, leg count
     4 ready-made examples (one-click)
     Real AutoLISP output: Generates runnable code with (command "_.RECTANG" ...), dimension lines, centerlines, etc.
     Syntax-highlighted code viewer with Copy + Download .lsp buttons
     Generation summary with timing

🧮 Auto BOM

     Drawing selector: Pick an assembly drawing
     Generate BOM button with loading state
     4 stat tiles: Line items, total qty, total mass, categories
     Full BOM table: Part number, description, qty, material, unit mass, category, extended mass
     Totals row at the bottom
     CSV export button
     "Approve Cost" button (visible only to QS/Contract role) on the BOM header

✅ Checklists

     14-item QA checklist per drawing (Dimensional, Documentation, Manufacturing, Quality)
     Expandable rows per drawing with progress bar + percentage
     4 category sections with done/total counts
     Toggle items via API — every tick/untick is audit-logged
     Items adapted for M&E construction drawings (UBBL compliance, BOMBA, MPKL, MS/IES/BS standards)

📜 Audit Trail

     Full filterable log of all actions: status_change, upload, version_bump, checklist_tick/untick, login, create
     Search by detail, user, or drawing number
     Filter by user (4 options) and action type (6 options)
     Color-coded action chips per action type
     Timeline layout with timestamps + relative time ("2 hours ago")

⚙️ Admin

     4 stat tiles: Drawings, Files, Audit entries, Checklist items
     AI engine status card: Engine name, endpoint, model, timeout, online indicator
     Storage breakdown: Bar chart by file type (DWG, PDF, STEP, etc.)
     Distribution charts: Donut by status + bar by category
     Users table: Name, email, role, last seen, online/offline status

Role switcher 
in the sidebar allows instant switching between roles for demo purposes. The entire UI updates:

     Top bar shows a colored role badge
     Dashboard shows a "Welcome, [name]" banner with role + step
     Sign-Off Flow highlights drawings at the current role's step with "● YOUR ACTION"
     Drawing Detail shows the role-specific sign-off action panel with the correct button label

File Management

     Upload files to any drawing (DWG, PDF, STEP, STL, IGS, JPG, PNG, ZIP — max 50 MB)
     Upload new version: Bumps version (00→01→02), saves new file, logs audit entry "V00 → V01 — [change description]", resets sign-off flow to step 1
     View PDFs in-browser (opens in a new tab with inline content disposition)
     Download any file (attachment content disposition)
     File fallback: If a file doesn't exist on disk, the system serves the closest matching real PDF so demos never break
     44 file records across 34 drawings, with 50 real PDF files on disk

Bilingual Support (EN + BM)

Every label, button, description, and status is available in both English and Bahasa Melayu. Toggle the language in the sidebar (EN / BM buttons). The preference is persisted in localStorage.
