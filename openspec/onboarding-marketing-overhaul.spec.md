# SDD Specification: Marketing & Onboarding Overhaul (onboarding-marketing-overhaul)

## Status
- **Phase**: `spec`
- **Dependencies**: `proposal` (Approved)

---

## 1. Bilingual Architecture & Locale System
We will consolidate a lightweight, unified bilingual system across the entire application using local storage and cookie sync.

### A. Localization Keys (`lib/onboarding-i18n.ts`)
We will create a new file `lib/onboarding-i18n.ts` to hold the bilingual copies for:
- The Language Selector in `/setup`.
- The Privacy & Terms text (English default, Spanish translation).
- The Onboarding Tour steps, tooltips, and buttons.

### B. Language State Persistence
- Locale will be retrieved from `localStorage.getItem("ptime-locale")`. If empty, it defaults to `"en"`.
- We will export a custom hook or context `useLanguage()` to get and set the active language, triggering re-renders across the dashboard, setup page, and legal pages.
- When the language is changed, we will also sync it to a cookie `"ptime-locale"` so that server-side components (like `/setup` or `/dashboard`) can read it during SSR.

---

## 2. Updated Landing Page & Legal Pages Copy

### A. Landing Page Copy (`lib/landing-i18n.ts`)
We will rewrite the key sections of `lib/landing-i18n.ts`:
- **Hero Description**: Explain bring-your-own-database and 1-click creation clearly.
- **Features**:
  - Replace "JWT NextAuth persistency" with: "Instant Cross-Device Access: Set up once, log in from any device securely without ever needing to reconnect."
  - Replace "No database server" with: "100% Data Sovereignty: Your Google Sheet is your database. Back up, export, or edit your data directly from Google Sheets without external dependencies."
  - Add "1-Click Automatic Sheet Setup" explaining that Ptime can instantly create a pre-configured database in their Drive with a single click.

### B. Privacy & Terms Copy (`app/privacy/page.tsx`, `app/terms/page.tsx`)
- Standardize on **English by default**, but render a clean **Language Toggle (EN/ES)** at the top of both pages, exactly like the landing page.
- Rewrite both documents to explicitly declare:
  - **Drive File Scope (`drive.file`)**: The application only accesses sheets created by the app or selected by the user. No other files are visible to Ptime.
  - **Collaborator Sharing Security**: Ptime uses each user's personal Google account. For collaborators to read/write, the spreadsheet owner must manually grant them "Editor" access in Google Drive. This enforces total sovereignty over data access.

---

## 3. First-time Onboarding Language Selection
- At `/app/setup/page.tsx` (on top of `SetupForm`), if `ptime-locale` is not set, we will display a beautiful, segmented language selector:
  - **English** (Default) | **Español**
- Clicking a language instantly sets `localStorage.setItem("ptime-locale", lang)`, sets the `"ptime-locale"` cookie, and updates the setup interface and onboarding tour.

---

## 4. Interactive Onboarding Wizard Tour (`components/onboarding/OnboardingTour.tsx`)

### A. Highlight & Shadow Logic
- Cover the screen with a semi-transparent dark overlay (`rgba(0,0,0,0.5)`).
- We will target specific sidebar links using `data-tour` attributes added to `components/layout/Sidebar.tsx`:
  - `[data-tour="sidebar-dashboard"]`
  - `[data-tour="sidebar-horas"]`
  - `[data-tour="sidebar-clientes"]`
  - `[data-tour="sidebar-proyectos"]`
  - `[data-tour="sidebar-tareas"]`
  - `[data-tour="sidebar-configuracion"]`
- For each step, calculate the target element's bounding rect:
  `const rect = element.getBoundingClientRect();`
- Render a transparent "cutout" or overlay matching that rect using CSS absolute positioning and a border-radius, combined with high z-index.
- Position a floating card next to the highlighted element.

### B. Wizard Step Flow & Bilingual Copy

| Step | Target Element | Content (EN) | Content (ES) |
| :--- | :--- | :--- | :--- |
| **0** | None (Central Card) | **Welcome to Ptime!**<br>Let's take a quick 1-minute tour to explore the key features of your workspace. | **¡Bienvenido a Ptime!**<br>Hagamos un tour rápido de 1 minuto para conocer las funciones clave de tu espacio de trabajo. |
| **1** | `sidebar-dashboard` | **Your Dashboard**: View real-time income trend charts, daily activity tracking, project breakdowns, and your monthly log heatmap. | **Tu Dashboard**: Observá gráficos de ingresos, actividad diaria, distribución por proyectos y tu heatmap mensual. |
| **2** | `sidebar-horas` | **Tracked Hours**: This is the core table where you and your team register, edit, and filter worked and billable hours. | **Horas Registradas**: La tabla principal donde vos y tu equipo cargan, editan y filtran horas trabajadas y facturables. |
| **3** | `sidebar-clientes` | **Clients Manager**: Manage your active clients, billing contact info, and custom hourly currencies. | **Gestión de Clientes**: Administrá tus clientes activos, datos de contacto de facturación y monedas personalizadas. |
| **4** | `sidebar-proyectos` | **Projects**: Define projects, assign them to clients, and configure tiered hourly rates with custom high-price thresholds. | **Proyectos**: Definí proyectos, asignalos a clientes y configurá tarifas escalonadas con umbrales de precio alto. |
| **5** | `sidebar-tareas` | **Tasks**: Break down your logs into specific tasks and view persistent accumulated hours. | **Tareas**: Desglosá tus cargas en tareas específicas y observá las horas acumuladas persistentes. |
| **6** | `sidebar-configuracion` | **Global Settings**: Configure your company profile, base currency, global billing thresholds, and workspace collaborators. | **Configuración Global**: Ajustá el perfil de tu empresa, moneda base, tarifas globales y colaboradores del workspace. |
| **7** | None (Central Card) | **You are ready!**<br>Start logging hours and take full control of your billing. Your database is 100% yours! | **¡Ya estás listo!**<br>Empezá a cargar horas y tomá el control total de tu facturación. ¡Tu base de datos es 100% tuya! |

### C. Controls & State Persistence
- Card Controls:
  - **Skip (Omitir)**: Available on any step. Instantly closes the tour and writes `ptime-onboarding-completed=true`.
  - **Back (Atrás)**: Available on steps 1-7.
  - **Next (Siguiente)**: Available on steps 0-6.
  - **Finish (Finalizar)**: Available on step 7. Closes tour and writes `ptime-onboarding-completed=true`.
- **Tour Reset**:
  - In `app/(dashboard)/admin/configuracion/page.tsx` (Tu Cuenta card), render a clean button: `"Reiniciar tutorial de bienvenida"` (Restart Welcome Tour).
  - Clicking this button deletes `ptime-onboarding-completed` from local storage and redirects the user to `/dashboard` to trigger the tour again.

### D. Mobile Responsive Handling
- On mobile devices, the sidebar collapses.
- During the tour, if a mobile drawer is active, the tour will programmatically add class `drawer-open` (or trigger the click on the hamburger button) to open the sidebar, allowing menu items to be highlighted. After step 6, it will close the drawer automatically.
