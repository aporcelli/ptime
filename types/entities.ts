// types/entities.ts
// ─────────────────────────────────────────────────────────────────────────────
// Tipos canónicos de entidades del dominio Ptime.
// Derivados de los Zod schemas pero usables sin Zod en el cliente.
// ─────────────────────────────────────────────────────────────────────────────

export type UserRole = "USER" | "ADMIN";

export type HoraEstado = "borrador" | "confirmado" | "facturado";
export type ProyectoEstado = "activo" | "pausado" | "cerrado";

// ── Cliente ───────────────────────────────────────────────────────────────────
export interface Cliente {
  id: string;            // UUID v4
  nombre: string;
  email: string;
  telefono?: string;
  activo: boolean;
  created_at: string;    // ISO 8601
  updated_at: string;
}

// ── Proyecto ──────────────────────────────────────────────────────────────────
export interface Proyecto {
  id: string;
  nombre: string;
  cliente_id: string;
  cliente?: Cliente;     // join opcional
  presupuesto_horas?: number;
  horas_acumuladas: number;
  umbral_precio_alto: number;  // default: 20
  precio_base: number;         // default: 35
  precio_alto: number;         // default: 45
  estado: ProyectoEstado;
  created_at: string;
  updated_at: string;
}

// ── Tarea ─────────────────────────────────────────────────────────────────────
export interface Tarea {
  id: string;
  nombre: string;
  categoria?: string;
  activa: boolean;
  created_at: string;
}

// ── Registro de Horas ─────────────────────────────────────────────────────────
export interface RegistroHoras {
  id: string;
  proyecto_id: string;
  proyecto?: Proyecto;   // join opcional
  tarea_id: string;
  tarea?: Tarea;         // join opcional
  usuario_id: string;
  fecha: string;         // YYYY-MM-DD
  horas: number;         // decimales permitidos (min 0.25)
  descripcion: string;
  precio_hora_aplicado: number;
  monto_total: number;
  estado: HoraEstado;
  created_at: string;
  updated_at: string;
}

// ── Configuración Global ──────────────────────────────────────────────────────
export interface PricingConfig {
  precioBase: number;
  precioAlto: number;
  umbralHoras: number;
}

export interface AppConfig extends PricingConfig {
  moneda: string;
  nombreEmpresa: string;
  logoUrl?: string;
  updated_at: string;
}

// ── BI / Reportes ─────────────────────────────────────────────────────────────
export interface ReporteFilters {
  fechaDesde?: string;
  fechaHasta?: string;
  clienteId?: string;
  proyectoId?: string;
  tareaId?: string;
  usuarioId?: string;
  estado?: HoraEstado;
}

export interface KPIs {
  totalHoras: number;
  totalIngresos: number;
  promedioHorasDia: number;
  proyectosActivos: number;
  registrosTotales: number;
}

export interface HorasPorProyecto {
  proyectoNombre: string;
  horas: number;
  ingresos: number;
  porcentajePresupuesto?: number;
}

export interface IngresosMensuales {
  mes: string;           // "2026-03"
  horas: number;
  ingresos: number;
}

// ── Server Action responses ───────────────────────────────────────────────────
export type ActionResult<T = void> =
  | { success: true;  data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };
