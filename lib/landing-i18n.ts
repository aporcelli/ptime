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
            title: "Instant Cross-Device Access",
            desc: "Set up once, log in from any device securely without ever needing to reconnect.",
          },
          {
            title: "100% Data Sovereignty",
            desc: "Your Google Sheet is your database. Back up, export, or edit your data directly from Google Sheets without external dependencies.",
          },
    ],
    howItWorks: "How it works",
    steps: [
      {
        step: "1",
        title: "Sign in",
        desc: "Use your Google account. We'll ask for permission to access your Google Sheets — only the one you configure.",
      },
      {
            step: "2",
            title: "Connect or Create Sheet",
            desc: "Connect an existing Google Sheet, or let Ptime create a brand new pre-configured database in your Google Drive instantly with a single click.",
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
            title: "Acceso Multidispositivo",
            desc: "Acceso instantáneo. Configuralo una sola vez y accedé desde cualquier dispositivo de forma segura.",
          },
          {
            title: "100% Soberanía de Datos",
            desc: "Tu Google Sheets es tu base de datos. Controlá, respaldá o editá tus datos directamente desde Google Sheets sin depender de nadie.",
          },
    ],
    howItWorks: "Cómo funciona",
    steps: [
      {
        step: "1",
        title: "Iniciá sesión",
        desc: "Usá tu cuenta de Google. Te pedirá permiso para acceder a tus Google Sheets — solo a la hoja que vos configures.",
      },
      {
            step: "2",
            title: "Conectá o Creá tu Sheet",
            desc: "Conectá una planilla de Google Sheets existente, o dejá que Ptime cree una base de datos preconfigurada de cero en tu Google Drive al instante con un solo clic.",
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
