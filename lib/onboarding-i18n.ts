// lib/onboarding-i18n.ts — Onboarding, legal & language utilities
export type Locale = "en" | "es";

export const onboardingTranslations = {
  en: {
    // Setup language selector
    setupLangTitle: "Select Language / Seleccionar Idioma",
    setupLangDesc: "Choose your preferred language for your Ptime workspace.",
    
    // Onboarding buttons
    btnNext: "Next",
    btnBack: "Back",
    btnSkip: "Skip",
    btnFinish: "Finish",
    btnRestartTour: "Restart Welcome Tour",
    tourStatus: "Tour",

    // Onboarding Tour Steps
    tourSteps: [
      {
        title: "Welcome to Ptime! ✨",
        desc: "Let's take a quick 1-minute tour to explore the key features of your workspace."
      },
      {
        title: "Your Dashboard 📊",
        desc: "View real-time income trend charts, daily activity logs, project breakdowns, and your monthly calendar heatmap."
      },
      {
        title: "Tracked Hours ⏰",
        desc: "This is the core table where you and your team register, edit, and filter worked and billable hours."
      },
      {
        title: "Clients Manager 👥",
        desc: "Manage your active clients, billing contact information, and custom hourly currencies."
      },
      {
        title: "Projects 📁",
        desc: "Define projects, assign them to clients, and configure tiered hourly rates with custom high-price thresholds."
      },
      {
        title: "Tasks List ⚙️",
        desc: "Break down your logs into specific tasks and view persistent accumulated hours."
      },
      {
        title: "Global Settings 🛠️",
        desc: "Configure your company profile, base currency, global billing thresholds, and invite workspace collaborators."
      },
      {
        title: "You are ready! 🎉",
        desc: "Start logging hours and take full control of your billing. Your database is 100% yours in Google Drive!"
      }
    ]
  },
  es: {
    // Setup language selector
    setupLangTitle: "Select Language / Seleccionar Idioma",
    setupLangDesc: "Elegí el idioma para tu espacio de trabajo en Ptime.",
    
    // Onboarding buttons
    btnNext: "Siguiente",
    btnBack: "Atrás",
    btnSkip: "Omitir",
    btnFinish: "Finalizar",
    btnRestartTour: "Reiniciar tutorial de bienvenida",
    tourStatus: "Tutorial",

    // Onboarding Tour Steps
    tourSteps: [
      {
        title: "¡Bienvenido a Ptime! ✨",
        desc: "Hagamos un tour rápido de 1 minuto para conocer las funciones clave de tu espacio de trabajo."
      },
      {
        title: "Tu Dashboard 📊",
        desc: "Observá gráficos de tendencia de ingresos, actividad diaria, distribución por proyectos y tu heatmap mensual."
      },
      {
        title: "Horas Registradas ⏰",
        desc: "La tabla principal donde vos y tu equipo cargan, editan y filtran horas trabajadas y facturables."
      },
      {
        title: "Gestión de Clientes 👥",
        desc: "Administrá tus clientes activos, datos de contacto de facturación y monedas personalizadas."
      },
      {
        title: "Proyectos 📁",
        desc: "Definí proyectos, asignalos a clientes y configurá tarifas escalonadas con umbrales de precio alto."
      },
      {
        title: "Lista de Tareas ⚙️",
        desc: "Desglosá tus cargas en tareas específicas y observá las horas acumuladas persistentes."
      },
      {
        title: "Configuración Global 🛠️",
        desc: "Ajustá el perfil de tu empresa, moneda base, tarifas globales e invitá colaboradores al workspace."
      },
      {
        title: "¡Ya estás listo! 🎉",
        desc: "Empezá a cargar horas y tomá el control total de tu facturación. ¡Tu base de datos es 100% tuya en Google Drive!"
      }
    ]
  }
} as const;

export type OnboardingTranslation = typeof onboardingTranslations[Locale];
