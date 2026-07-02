# SDD Proposal: Marketing & Onboarding Overhaul (onboarding-marketing-overhaul)

## Goal
Overhaul Ptime's public-facing presentation, privacy/terms documentation, language selection, and first-time user onboarding experience to deliver a highly professional, secure, and intuitive billing platform.

---

## 1. Problem Statement & Context
1. **Landing Page & Messaging**: The current landing page includes non-commercial, highly technical jargon (such as "persiste vía JWT", "NextAuth", "no database server"). This confuses business owners. We need clear, high-level benefits explaining the "bring-your-own-database" model, data sovereignty, and the new 1-click automatic sheet creation.
2. **Privacy & Terms**: `app/privacy/page.tsx` and `app/terms/page.tsx` need to be aligned with the newly implemented `drive.file` scope, the exact storage model (100% in their Google Drive), and explain clearly that sharing sheets with collaborators as "Editors" is a security requirement controlled by the sheet owner.
3. **Onboarding Friction**: New users entering Ptime have no guiding path. A clean, interactive tour (Wizard) is required to walk them through key menus (Dashboard, Horas, Clientes, Proyectos, Tareas, Configuración) using overlay/shadow highlighting on their first entry.
4. **Bilingual Preference**: Ptime needs to ask users for their language preference (English vs. Spanish) upfront, making sure both the onboarding flow and the dashboard reflect this choice.

---

## 2. Proposed Solution & Architecture

### A. Landing Page Copy Overhaul (`components/landing-page.tsx`, `lib/landing-i18n.ts`)
- Replace technical explanations with clear marketing values:
  - **Before**: "La configuración persiste vía JWT, no necesitás reconectar tu sheet."
  - **After**: "Acceso multidispositivo instantáneo. Configuralo una sola vez y accedé desde cualquier dispositivo de forma segura."
  - **Before**: "No database server... Edit data directly from Google."
  - **After**: "Tu planilla es tu base de datos. Controlá, respaldá o editá tus datos directamente desde Google Sheets sin depender de nadie."
- Add specific mentions of the **1-click Sheet Creation**:
  - Clarify that users can connect an existing sheet OR let Ptime create a new, pre-configured sheet instantly with a single click.
- Highlight **Collaborator Permissions Security**:
  - Explain that data remains secure in their Google Drive, and giving team members access is managed directly inside Google Drive (Data Sovereignty).

### B. Privacy & Terms Alignment (`app/privacy/page.tsx`, `app/terms/page.tsx`)
- Rewrite both documents in professional English.
- Detail the exact data flow of `drive.file` scope: Ptime only reads/writes the selected or created sheet.
- Explicitly explain collaborator onboarding: To allow collaborators to log hours, the sheet owner must manually grant them "Editor" access in Google Drive. This guarantees total owner sovereignty.

### C. First-time Language Selector & Setting
- When a new user logs in and does not have a language preference saved, show a clean, modern modal at `/setup` (or right before connecting) asking them to choose their preferred language (English or Spanish), with English as default.
- Store this selection in `localStorage` as `ptime-locale` so it persists across both the frontend and client components.
- In `app/(dashboard)/dashboard/page.tsx` and other pages, fall back to this saved locale.

### D. Interactive Onboarding Wizard Tour (`components/onboarding/OnboardingTour.tsx`)
- Build a custom, highly polished React + Framer Motion onboarding component.
- The wizard will display when the user has `ptime-onboarding-completed` missing from `localStorage` (triggered upon successful setup redirect to the dashboard).
- **Tour Steps**:
  1. **Dashboard**: Highlight `/dashboard` (overview of charts, monthly calendar heatmap, recent activity).
  2. **Horas**: Highlight `/horas` (where they and their team log and edit hours).
  3. **Clientes**: Highlight `/admin/clientes` (manage clients and currencies).
  4. **Proyectos**: Highlight `/admin/proyectos` (manage projects, rates, and high-price thresholds).
  5. **Tareas**: Highlight `/admin/tareas` (define tasks and see accumulated hours).
  6. **Configuración**: Highlight `/admin/configuracion` (profile, currency, and global rates).
- **Interactive shadow/highlight overlay**: Use a dark, semi-transparent backdrop overlay with a high z-index on the target menu items to guide the user's attention.
- Include "Back" (Atrás), "Next" (Siguiente), and "Skip" (Omitir) buttons.
- On completion or skip, write `ptime-onboarding-completed=true` to `localStorage` so they are never interrupted again.

---

## 3. Scope Boundaries & Non-Goals
- **Non-Goal**: We will not introduce external heavier tour libraries (like Shepherd.js or Intro.js) to avoid inflating package bundle sizes. A lightweight, Tailwind + Framer Motion custom implementation is more modular and keeps the app fast and clean.
- **Non-Goal**: We will not modify the backend sheets structure, only the frontend components and translation dictionaries.

---

## 4. Risks & Mitigations
- **Brave / Adblockers**: If they block local storage, we fall back to a cookie or in-memory default.
- **Responsive Layout**: On mobile, the sidebar collapses into a drawer. The tour needs to adapt cleanly (either by opening the drawer or highlighting the mobile navbar/floating buttons). We will implement responsive steps that handle mobile drawers elegantly.
