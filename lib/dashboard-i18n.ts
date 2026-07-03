// lib/dashboard-i18n.ts — Bilingual translations dictionary for the internal Dashboard UI
import { Locale } from "./onboarding-i18n";

export const dashboardTranslations = {
  en: {
    // Sidebar
    menuAdministration: "Administration",
    menuDashboard: "Dashboard",
    menuHoras: "My Hours",
    menuReportes: "Reports",
    menuClientes: "Clients",
    menuProyectos: "Projects",
    menuTareas: "Tasks",
    menuWorkspace: "Workspace",
    menuUsuarios: "Users",
    menuConfiguracion: "Settings",

    // Topbar
    logout: "Sign Out",

    // Dashboard Principal
    dbTitle: "Monthly Indicators",
    dbSubtitle: "Overview of your workspace in Ptime",
    dbFilterMonth: "Filter by month:",
    dbCardTotalHours: "Total Hours",
    dbCardTotalIncome: "Income",
    dbCardBNA: "BNA Dollar",
    dbCardDailyAvg: "Daily Avg",
    dbSectionActivity: "Activity",
    dbSectionAlerts: "Alerts",
    dbSectionRecentLogs: "Recent Logs",
    dbSectionClientSummary: "Clients Summary",
    dbAlertTier2: "Projects in Tier 2 ⚠️",
    dbAlertTier2Desc: "You have exceeded the base hourly threshold on some projects. Additional hours are billed at the premium rate.",

    // Configuración Page
    configTitle: "Settings",
    configSubtitle: "Adjust your Ptime workspace settings",
    configSectionPrices: "Global Prices",
    configSectionPricesDesc: "Set up base and premium global hourly rates",
    configLabelBasePrice: "Base Price",
    configLabelHighPrice: "Premium Price",
    configLabelThreshold: "Threshold (hours)",
    configVisualSummary: "First {umbral}h per project → ${base}/h · From hour {umbral} onwards → ${high}/h",
    configSectionSheet: "Connected Google Sheet",
    configLabelActiveId: "Active Sheet ID",
    configBtnDisconnect: "Disconnect",
    configLinkOpenSheet: "Open in Google Sheets →",
    configSectionAccount: "Your Account",
  },
  es: {
    // Sidebar
    menuAdministration: "Administración",
    menuDashboard: "Dashboard",
    menuHoras: "Mis Horas",
    menuReportes: "Reportes",
    menuClientes: "Clientes",
    menuProyectos: "Proyectos",
    menuTareas: "Tareas",
    menuWorkspace: "Workspace",
    menuUsuarios: "Usuarios",
    menuConfiguracion: "Configuración",

    // Topbar
    logout: "Cerrar sesión",

    // Dashboard Principal
    dbTitle: "Indicadores del mes",
    dbSubtitle: "Vista general de tu espacio de trabajo en Ptime",
    dbFilterMonth: "Filtrar por mes:",
    dbCardTotalHours: "Horas Totales",
    dbCardTotalIncome: "Ingresos",
    dbCardBNA: "Dólar BNA",
    dbCardDailyAvg: "Promedio diario",
    dbSectionActivity: "Actividad",
    dbSectionAlerts: "Alertas",
    dbSectionRecentLogs: "Registros recientes",
    dbSectionClientSummary: "Tabla de Clientes",
    dbAlertTier2: "Proyectos en Tramo 2 ⚠️",
    dbAlertTier2Desc: "Superaste el límite de horas base en algunos proyectos. Las horas restantes se calculan con tarifa alta de forma automática.",

    // Configuración Page
    configTitle: "Configuración",
    configSubtitle: "Ajustes de tu espacio de trabajo en Ptime",
    configSectionPrices: "Precios globales",
    configSectionPricesDesc: "Configurá precios base y alto globales",
    configLabelBasePrice: "Precio base",
    configLabelHighPrice: "Precio alto",
    configLabelThreshold: "Umbral (horas)",
    configVisualSummary: "Primeras {umbral}h por proyecto → ${base}/h · A partir de la hora {umbral} → ${high}/h",
    configSectionSheet: "Google Sheet conectado",
    configLabelActiveId: "Sheet ID activo",
    configBtnDisconnect: "Desconectar",
    configLinkOpenSheet: "Abrir en Google Sheets →",
    configSectionAccount: "Tu cuenta",
  }
} as const;

export type DashboardTranslation = typeof dashboardTranslations[Locale];
