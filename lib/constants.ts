// lib/constants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Rangos de Google Sheets y constantes globales de la aplicación.
// ─────────────────────────────────────────────────────────────────────────────

export const SHEET_NAMES = {
  REGISTROS_HORAS:  "Registros_Horas",
  PROYECTOS:        "Proyectos",
  CLIENTES:         "Clientes",
  TAREAS:           "Tareas",
  CONFIGURACIONES:  "Configuraciones",
} as const;

// Rangos de columnas por hoja (A:L = todas las columnas relevantes)
export const SHEET_RANGES = {
  REGISTROS_HORAS:  "Registros_Horas!A:M",
  PROYECTOS:        "Proyectos!A:K",
  CLIENTES:         "Clientes!A:G",
  TAREAS:           "Tareas!A:F",
  CONFIGURACIONES:  "Configuraciones!A:C",
} as const;

// Encabezados de cada hoja (fila 1) — deben coincidir exactamente con el Spreadsheet
export const SHEET_HEADERS = {
  REGISTROS_HORAS: [
    "id", "proyecto_id", "tarea_id", "usuario_id", "fecha", "horas",
    "descripcion", "precio_hora_aplicado", "monto_total", "estado",
    "created_at", "updated_at",
  ],
  PROYECTOS: [
    "id", "nombre", "cliente_id", "presupuesto_horas", "horas_acumuladas",
    "umbral_precio_alto", "precio_base", "precio_alto", "estado",
    "created_at", "updated_at",
  ],
  CLIENTES: [
    "id", "nombre", "email", "telefono", "activo", "created_at", "updated_at",
  ],
  TAREAS: [
    "id", "nombre", "categoria", "activa", "created_at",
  ],
  CONFIGURACIONES: [
    "clave", "valor", "updated_at",
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
