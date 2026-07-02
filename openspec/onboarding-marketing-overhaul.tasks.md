# SDD Tasks: Onboarding & Marketing Overhaul (onboarding-marketing-overhaul)

## Status
- **Phase**: `tasks`
- **Dependencies**: `design` (Approved)

---

## Task List

- [ ] **Task 1: Dictionary & State Utilities (`lib/onboarding-i18n.ts`)**
  - Create `lib/onboarding-i18n.ts` containing step descriptions and button labels in both English and Spanish.
  - Implement a helper state wrapper to read from and write to `"ptime-locale"`.

- [ ] **Task 2: UI Highlight Tour Component (`components/onboarding/OnboardingTour.tsx`)**
  - Build `OnboardingTour.tsx` using Tailwind CSS and Framer Motion.
  - Implement the dark backdrop, active coordinate rectangle bounding-rect detection, floating responsive tooltip card, and button handlers (Back, Next, Skip, Finish).
  - Add standard window resize listeners to update coordinate bounds in real-time.
  - Connect the mobile check to programmatically trigger `setSidebarOpen(true)` during sidebar steps.

- [ ] **Task 3: Sidebar Target Mapping (`components/layout/Sidebar.tsx`)**
  - Update `components/layout/Sidebar.tsx`'s `NavItem` to output a dynamic `data-tour` attribute matching its `href` link destination.

- [ ] **Task 4: Layout Shell Integration (`components/layout/DashboardShell.tsx`)**
  - Update `components/layout/DashboardShell.tsx` to render the `<OnboardingTour>` component and pass the `sidebarOpen` and `setSidebarOpen` states as props.

- [ ] **Task 5: Setup First-time Language Selector (`app/setup/SetupForm.tsx`)**
  - Update `app/setup/SetupForm.tsx` to render a beautiful segmented language selector at the top (English | Español) if `ptime-locale` is not yet configured.

- [ ] **Task 6: Landing Page Messaging Overhaul (`lib/landing-i18n.ts`)**
  - Edit `lib/landing-i18n.ts` to replace technical jargon with clean commercial value propositions (Data Sovereignty, 1-Click automatic creation, easy sharing).

- [ ] **Task 7: Legal Pages English Translation & Drive alignment (`app/privacy/page.tsx`, `app/terms/page.tsx`)**
  - Translate both legal pages to professional English with a language toggle (EN/ES) on top.
  - Include specific declarations detailing `drive.file` scope privacy and manual Google Drive collaborator sharing requirements.

- [ ] **Task 8: Tour Reset Button (`app/(dashboard)/admin/configuracion/page.tsx`)**
  - Add a button "Restart Welcome Tour" to the "Tu Cuenta" card in the global configurations page.
  - The button resets `ptime-onboarding-completed` and redirects to `/dashboard` to trigger the tour.

- [ ] **Task 9: Validation and Testing**
  - Run the Vitest test suite (`npm run test:run`).
  - Run TypeScript compilation check (`npx tsc --noEmit`).
