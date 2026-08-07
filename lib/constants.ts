// lib/constants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Rangos de Google Sheets y constantes globales de la aplicación.
// ─────────────────────────────────────────────────────────────────────────────

export const SHEET_NAMES = {
  REGISTROS_HORAS:    "Registros_Horas",
  PROYECTOS:          "Proyectos",
  CLIENTES:           "Clientes",
  TAREAS:             "Tareas",
  CONFIGURACIONES:    "Configuraciones",
  WORKSPACE_MEMBERS:  "Workspace_Members",
} as const;

// Rangos de columnas por hoja (A:O = todas las columnas relevantes)
export const SHEET_RANGES = {
  REGISTROS_HORAS:    "Registros_Horas!A:O",
  PROYECTOS:          "Proyectos!A:K",
  CLIENTES:           "Clientes!A:G",
  TAREAS:             "Tareas!A:G",
  CONFIGURACIONES:    "Configuraciones!A:C",
  WORKSPACE_MEMBERS:  "Workspace_Members!A:F",
} as const;

// Encabezados de cada hoja (fila 1) — estandarizados en inglés
export const SHEET_HEADERS = {
  REGISTROS_HORAS: [
    "id", "project_id", "task_id", "user_id", "date", "hours",
    "description", "applied_hourly_rate", "total_amount", "status",
    "created_at", "updated_at", "client_id", "worked_hours", "billable_hours",
  ],
  PROYECTOS: [
    "id", "name", "client_id", "budget_hours", "accumulated_hours",
    "high_rate_threshold", "base_rate", "high_rate", "status",
    "created_at", "updated_at", "use_flat_rate",
  ],
  CLIENTES: [
    "id", "name", "email", "phone", "active", "created_at", "updated_at",
  ],
  TAREAS: [
    "id", "name", "category", "active", "created_at", "accumulated_hours",
  ],
  CONFIGURACIONES: [
    "key", "value", "updated_at",
  ],
  USUARIOS: [
    "id", "name", "email", "role", "active", "last_access", "sheet_id",
  ],
  WORKSPACE_MEMBERS: [
    "email", "sheet_id", "role", "invited_by", "created_at", "updated_at",
  ],
} as const;

// Defaults de precios
export const PRICING_DEFAULTS = {
  precioBase:   35,
  precioAlto:   45,
  umbralHoras:  20,
  moneda:       "USD",
} as const;

// Cache TTL para configuración (ms)
export const CONFIG_CACHE_TTL = 5 * 60 * 1000; // 5 minutos

// Límites de validación
export const HORA_MIN = 0.25;  // 15 minutos
export const HORA_MAX = 24;
export const HORA_STEP = 0.25;
export const DESCRIPCION_MIN = 10;
export const DESCRIPCION_MAX = 500;
