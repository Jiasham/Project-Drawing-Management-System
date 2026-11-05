# Project-Drawing-Management-System
a full-stack web application built for the project department to manage engineering construction drawings throughout their entire lifecycle — from initial design through the 6-department sign-off process to final controlled issue.

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

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Database**: Prisma ORM + SQLite
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Charts**: Recharts
- **Icons**: Lucide React
- **State**: Zustand
- **Fonts**: Inter + JetBrains Mono

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

