// lib/landing-i18n.ts — Landing page translations EN / ES
// Default: English

export type Locale = "en" | "es";

export const translations = {
  en: {
    signIn: "Sign in with Google",
    dashboard: "Go to Dashboard",
    heroTitle: "Track your hours",
    heroTitleAccent: "from your own Google Sheets",
    heroDesc:
      "Ptime is a professional time-tracking and invoicing tool. Your data lives in your Google Sheets — not on external servers. Full control, no migrations, no surprises.",
    whyTitle: "Why Ptime?",
    features: [
      {
        title: "Your data, your control",
        desc: "Everything is stored in your Google Sheet. No migrations, no vendor lock-in. Open your sheet anytime and see the same data as in the app.",
      },
      {
        title: "Tiered billing",
        desc: "Set base and premium rates with per-project or global thresholds. Ptime automatically calculates the first N hours at the base rate and the rest at the premium rate.",
      },
      {
        title: "Live reports",
        desc: "Interactive dashboard with income trends, daily activity, project breakdowns, and monthly heatmaps. One-click PDF export.",
      },
      {
        title: "Shared workspaces",
        desc: "Invite collaborators with OWNER, COLABORADOR, or VIEWER roles. Each user sees what they need.",
      },
      {
        title: "Cross-device",
        desc: "Log in from any browser and your data is there. Settings persist via JWT — no need to reconnect your sheet.",
      },
      {
        title: "No database server",
        desc: "Google Sheets is your database. Edit data directly from Google if you want, without going through the app.",
      },
    ],
    howItWorks: "How it works",
    steps: [
      {
        step: "1",
        title: "Sign in",
        desc: "Use your Google account. We'll ask for permission to access files you choose — only the spreadsheet you select via Google Picker.",
      },
      {
        step: "2",
        title: "Connect your sheet",
        desc: "Paste your Google Sheet link or select it with the Google Picker. Ptime automatically creates the required tabs (Records, Projects, Clients, etc.).",
      },
      {
        step: "3",
        title: "Start tracking",
        desc: "Log hours, manage projects, generate reports, and invoice. All from the app or directly from your Google Sheet.",
      },
    ],
    ctaTitle: "Ready to get started?",
    ctaDesc: "No credit card required, no signup form. Just your Google account and a Google Sheet.",
    footer: "Ptime by TuCloud.pro",
  },
  es: {
    signIn: "Iniciar sesión con Google",
    dashboard: "Ir al Dashboard",
    heroTitle: "Gestioná tus horas",
    heroTitleAccent: "desde tu propio Google Sheets",
    heroDesc:
      "Ptime es una herramienta profesional de registro de horas y facturación. Tus datos viven en tu Google Sheets — no en servidores externos. Control total, sin migraciones, sin sorpresas.",
    whyTitle: "¿Por qué Ptime?",
    features: [
      {
        title: "Tus datos, tu control",
        desc: "Todo se almacena en tu Google Sheets. No hay migraciones, no hay vendor lock-in. Podés abrir tu hoja en cualquier momento y ver exactamente lo mismo que ves en la app.",
      },
      {
        title: "Facturación escalonada",
        desc: "Configurá precios base y alto con umbrales por proyecto o globales. Ptime calcula automáticamente las primeras horas a tarifa base y el resto a tarifa alta.",
      },
      {
        title: "Reportes en vivo",
        desc: "Dashboard interactivo con gráficos de tendencia de ingresos, actividad diaria, distribución por proyecto y heatmap mensual. Exportación a PDF con un clic.",
      },
      {
        title: "Workspaces compartidos",
        desc: "Invitá colaboradores a tu workspace con roles de OWNER, COLABORADOR o VIEWER. Cada uno ve lo que necesita.",
      },
      {
        title: "Multi-dispositivo",
        desc: "Iniciá sesión desde cualquier navegador y tus datos están ahí. La configuración persiste vía JWT, no necesitás reconectar tu sheet.",
      },
      {
        title: "Sin servidor de base de datos",
        desc: "Google Sheets es tu base de datos. Podés editar datos directamente desde Google si querés, sin pasar por la app.",
      },
    ],
    howItWorks: "Cómo funciona",
    steps: [
      {
        step: "1",
        title: "Iniciá sesión",
        desc: "Usá tu cuenta de Google. Te pedirá permiso para acceder a los archivos que elijas — solo la hoja de cálculo que selecciones desde Google Picker.",
      },
      {
        step: "2",
        title: "Conectá tu sheet",
        desc: "Pegá el link de tu Google Sheet o seleccionalo con Google Picker. Ptime crea automáticamente las pestañas necesarias (Registros, Proyectos, Clientes, etc.).",
      },
      {
        step: "3",
        title: "Empezá a cargar horas",
        desc: "Registrá horas, gestioná proyectos, generá reportes y facturá. Todo desde la app o directamente desde tu Google Sheets.",
      },
    ],
    ctaTitle: "¿Listo para empezar?",
    ctaDesc: "No necesitás tarjeta de crédito, no necesitás registrarte. Solo tu cuenta de Google y un Google Sheets.",
    footer: "Ptime by TuCloud.pro",
  },
} as const;

export type Translation = (typeof translations)[Locale];
