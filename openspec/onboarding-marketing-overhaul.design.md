# SDD Design: Marketing & Onboarding Overhaul (onboarding-marketing-overhaul)

## Status
- **Phase**: `design`
- **Dependencies**: `spec` (Approved)

---

## 1. Bilingual Resource Dictionary (`lib/onboarding-i18n.ts`)
We will create a centralized bilingual file mapping English (default) and Spanish.

### File Structure: `lib/onboarding-i18n.ts`
- **Hook/Context**: `useLanguage` to hook into custom `localStorage` state.
- **Translations Dictionary**:
  ```typescript
  export const onboardingTranslations = {
    en: {
      setupLangTitle: "Select Language / Seleccionar Idioma",
      setupLangDesc: "Choose your preferred language for your Ptime workspace.",
      tourWelcomeTitle: "Welcome to Ptime!",
      tourWelcomeDesc: "Let's take a quick 1-minute tour to explore your workspace.",
      tourFinishedTitle: "You're all set!",
      tourFinishedDesc: "Start logging hours and take full control of your billing. Your database is 100% yours!",
      btnNext: "Next",
      btnBack: "Back",
      btnSkip: "Skip",
      btnFinish: "Finish",
      btnRestartTour: "Restart Welcome Tour",
      // Menu step details...
    },
    es: {
      setupLangTitle: "Select Language / Seleccionar Idioma",
      setupLangDesc: "Elegí el idioma para tu espacio de trabajo en Ptime.",
      tourWelcomeTitle: "¡Bienvenido a Ptime!",
      tourWelcomeDesc: "Hagamos un tour rápido de 1 minuto para conocer tu espacio de trabajo.",
      tourFinishedTitle: "¡Ya estás listo!",
      tourFinishedDesc: "Empezá a cargar horas y tomá el control total de tu facturación. ¡Tu base de datos es 100% tuya!",
      btnNext: "Siguiente",
      btnBack: "Atrás",
      btnSkip: "Omitir",
      btnFinish: "Finalizar",
      btnRestartTour: "Reiniciar tutorial de bienvenida",
      // Menu step details...
    }
  }
  ```

---

## 2. Interactive Tour Component (`components/onboarding/OnboardingTour.tsx`)

### Absolute Highlight Overlay Logic
We will render a custom overlay overlaying the viewport:
1. Cover the entire screen with a `fixed inset-0 bg-black/60 z-[100]`.
2. To "highlight" the target element (retrieved via `document.querySelector(targetSelector)`):
   - Calculate its `boundingClientRect`.
   - Render a high-light box absolutely at those coordinates with a high z-index and pointer-events-none:
     ```typescript
     const rect = element.getBoundingClientRect();
     // Set position styling: top, left, width, height.
     ```
   - Place the floating tooltip card relative to the target element (positioning it to the right on desktop, or floating in the center of mobile).

### Mobile Sidebar Drawer Control
- Prop list:
  ```typescript
  interface OnboardingTourProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
  }
  ```
- **Mobile Check**: If `window.innerWidth < 768` (mobile screen):
  - When step is between `1` and `6` (menu items), call `setSidebarOpen(true)`.
  - When step is `0` or `7` (central welcoming cards) or when skipped/finished, call `setSidebarOpen(false)`.
  - This guarantees perfect highlighting on mobile devices.

---

## 3. Link `data-tour` Mapping (`components/layout/Sidebar.tsx`)
In `components/layout/Sidebar.tsx`, we will map each `Link` in `NavItem` to have the corresponding `data-tour` attribute:
- `data-tour="sidebar-dashboard"`
- `data-tour="sidebar-horas"`
- `data-tour="sidebar-reportes"` (if we choose to include it)
- `data-tour="sidebar-clientes"`
- `data-tour="sidebar-proyectos"`
- `data-tour="sidebar-tareas"`
- `data-tour="sidebar-configuracion"`

---

## 4. Onboarding Reset button (`app/(dashboard)/admin/configuracion/ConfigForm.tsx`)
In the Configurations form, we will add a clean secondary button:
- It resets the onboarding state:
  ```typescript
  localStorage.removeItem("ptime-onboarding-completed");
  // Redirect to /dashboard to trigger tour
  router.push("/dashboard");
  ```

---

## 5. Architectural Trade-offs & Decisions
1. **Custom Highlight Overlay vs Third-Party Library**: Custom CSS/SVG mask overlay is chosen because third-party libraries (like Shepherd) add heavy JS sizes (~50KB) and have style hydration conflicts in Next.js. Our Tailwind-based overlay is under 3KB and runs smoothly on all browsers.
2. **Synchronous LocalStorage**: Storing state in `localStorage` ensures immediate local checks before page rendering, preventing flash of content (FOUC) issues.
