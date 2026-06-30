# Ptime — Professional Time Tracking & Invoicing

**Ptime** is a professional time-tracking and invoicing application that uses Google Sheets as a real-time database (BaaS). Optimized for fast deployments without friction, leveraging the Vercel + Google Workspace ecosystem.

## Features

- **Google Sheets as Database** — Your spreadsheet is your backend. Edit data directly in Sheets or use the app.
- **Secure Authentication** — NextAuth.js v5 with Google OAuth 2.0, JWT sessions, and RBAC access control.
- **Tiered Billing** — Monthly per-project pricing: first N hours at base rate, remainder at premium rate.
- **BI / Reports** — Interactive ECharts dashboard with income trends, client breakdown, task distribution, daily activity heatmap, and PDF export.
- **Shared Workspaces** — Invite collaborators with OWNER, COLLABORATOR, or VIEWER roles.
- **Cross-Device Persistence** — Sheet ID persists via JWT. No reconfiguration needed between devices.
- **Dark/Light Mode** — Semantic CSS tokens with glass effects and Framer Motion animations.
- **Assets & Crypto Support** — Track USD pricing with ARS conversion via BNA official rate.
- **Local Dev Mode** — `LOCAL_DEV_ACCESS=true` bypasses OAuth for localhost development.
- **Test Suite** — Vitest covering pricing, hours, serialization, BNA, and critical helpers.

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | [Next.js 14](https://nextjs.org/) (App Router) |
| UI | [React 18](https://react.dev/) + [Tailwind CSS v3](https://tailwindcss.com/) |
| Components | [Shadcn/UI](https://ui.shadcn.com/) (Radix Primitives) |
| Auth | [NextAuth.js v5](https://nextjs.authjs.dev/) |
| Charts | [Apache ECharts](https://echarts.apache.org/) |
| Animation | [Framer Motion](https://www.framer.com/motion/) |
| Validation | [Zod](https://zod.dev/) |
| Forms | [React Hook Form](https://react-hook-form.com/) |
| Google APIs | REST Sheets v4 + `googleapis` (service account) |
| Testing | [Vitest](https://vitest.dev/) |
| Hosting | [Vercel](https://vercel.com/) |

## Quick Start

### Prerequisites
- Node.js >= 20
- Google Cloud Console project with Sheets API enabled
- OAuth 2.0 credentials (Web application type)

### Setup

```bash
npm install
cp .env.example .env
# Fill in GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, AUTH_SECRET, MASTER_SHEET_ID
npm run dev
```

### Local Dev Without OAuth

```bash
LOCAL_DEV_ACCESS=true npm run dev
```
Only works on localhost with `NODE_ENV !== "production"`.

### Verify

```bash
npm run test:run     # Vitest
npx tsc --noEmit     # Type check
npm run lint         # ESLint
npm run build        # Production build
```

## Billing Rules

- First **N hours** (configurable, default 20) per project/month: **base rate**
- After N hours: **premium rate**
- Base tier fractions round to **0.5h**; premium tier fractions round to **next full hour**
- `horas_trabajadas` = actual hours; `horas_a_cobrar` = billable hours after rounding

## Deployment (Vercel)

1. Import repo in Vercel
2. Set environment variables:
   - `AUTH_SECRET`, `AUTH_URL`
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
   - `MASTER_SHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`
   - `ADMIN_EMAILS` (comma-separated)
3. Update authorized redirect URI in GCP: `https://your-domain/api/auth/callback/google`

## Project Structure

```text
.
├── app/                       # Next.js App Router
│   ├── (auth)/login/          # Authentication pages
│   ├── (dashboard)/           # Protected routes
│   │   ├── admin/             # CRUD: clients, projects, tasks, users, config, workspace
│   │   ├── dashboard/         # Main dashboard + KPIs
│   │   ├── horas/             # Time entries (list, detail, create, edit)
│   │   └── reportes/          # BI reports + charts + PDF export
│   ├── actions/               # Server Actions (CRUD mutations)
│   ├── api/                   # API routes (auth, health, BNA dollar)
│   ├── privacy/ & terms/      # Legal pages (required by Google OAuth)
│   └── setup/                 # Initial spreadsheet configuration
├── components/
│   ├── charts/                # ECharts components (6 charts)
│   ├── forms/                 # Hour entry form
│   ├── layout/                # Sidebar, Topbar, DashboardShell
│   ├── pdf/                   # PDF report templates
│   ├── shared/                # DataTable, UI primitives
│   ├── landing-page.tsx       # Public landing page
│   └── ui/                    # Shadcn primitives
├── lib/
│   ├── hours/                 # Save flow, accounting, monthly logic, currency
│   ├── pricing/               # Tiered pricing algorithm
│   ├── schemas/               # Zod validation schemas
│   ├── sheets/                # Google Sheets client, queries, mutations, serializers
│   └── utils/                 # Formatters, sanitizers, helpers
├── types/                     # TypeScript interfaces
├── public/                    # Static assets (logos, icons, background)
├── docs/                      # Planning & verification docs
├── scripts/                   # Migration scripts
├── auth.ts                    # NextAuth configuration
├── middleware.ts               # Route protection + sheet context
└── CHANGELOG.md               # Full version history
```

## Documentation

- [CHANGELOG.md](./CHANGELOG.md) — Full version history since v1.2.11
- [docs/GUARDRAILS.md](./docs/GUARDRAILS.md) — Developer pre-commit checklist
- [docs/gcp-verification-response.md](./docs/gcp-verification-response.md) — Google OAuth verification correspondence

## License

Proprietary — [TuCloud.pro](https://tucloud.pro)
