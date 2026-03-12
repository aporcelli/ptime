// lib/sheets/queries.ts
// ─────────────────────────────────────────────────────────────────────────────
// Funciones de lectura para cada entidad del dominio.
// Retornan tipos canónicos (entities.ts) mapeando arrays de Sheets a objetos.
// ─────────────────────────────────────────────────────────────────────────────

import { getSheetRows } from "./client";
import { SHEET_RANGES } from "@/lib/constants";
import type {
  Cliente,
  Proyecto,
  Tarea,
  RegistroHoras,
  AppConfig,
  ReporteFilters,
} from "@/types/entities";
import { PRICING_DEFAULTS } from "@/lib/constants";

// ── CLIENTES ─────────────────────────────────────────────────────────────────
export async function getClientes(soloActivos = false): Promise<Cliente[]> {
  const rows = await getSheetRows(SHEET_RANGES.CLIENTES);
  const clientes = rows
    .filter((r) => r[0]) // Filtrar filas vacías
    .map((r) => ({
      id:         r[0],
      nombre:     r[1],
      email:      r[2],
      telefono:   r[3] || undefined,
      activo:     r[4] === "true" || r[4] === "TRUE",
      created_at: r[5],
      updated_at: r[6],
    } satisfies Cliente));

  return soloActivos ? clientes.filter((c) => c.activo) : clientes;
}

export async function getClienteById(id: string): Promise<Cliente | null> {
  const clientes = await getClientes();
  return clientes.find((c) => c.id === id) ?? null;
}

// ── PROYECTOS ─────────────────────────────────────────────────────────────────
export async function getProyectos(
  options: { soloActivos?: boolean; clienteId?: string } = {}
): Promise<Proyecto[]> {
  const rows = await getSheetRows(SHEET_RANGES.PROYECTOS);
  let proyectos = rows
    .filter((r) => r[0])
    .map((r) => ({
      id:                 r[0],
      nombre:             r[1],
      cliente_id:         r[2],
      presupuesto_horas:  r[3] ? Number(r[3]) : undefined,
      horas_acumuladas:   Number(r[4] ?? 0),
      umbral_precio_alto: Number(r[5] ?? PRICING_DEFAULTS.umbralHoras),
      precio_base:        Number(r[6] ?? PRICING_DEFAULTS.precioBase),
      precio_alto:        Number(r[7] ?? PRICING_DEFAULTS.precioAlto),
      estado:             (r[8] ?? "activo") as Proyecto["estado"],
      created_at:         r[9],
      updated_at:         r[10],
    } satisfies Proyecto));

  if (options.soloActivos) {
    proyectos = proyectos.filter((p) => p.estado === "activo");
  }
  if (options.clienteId) {
    proyectos = proyectos.filter((p) => p.cliente_id === options.clienteId);
  }
  return proyectos;
}

export async function getProyectoById(id: string): Promise<Proyecto | null> {
  const proyectos = await getProyectos();
  return proyectos.find((p) => p.id === id) ?? null;
}

// ── TAREAS ────────────────────────────────────────────────────────────────────
export async function getTareas(soloActivas = false): Promise<Tarea[]> {
  const rows = await getSheetRows(SHEET_RANGES.TAREAS);
  const tareas = rows
    .filter((r) => r[0])
    .map((r) => ({
      id:         r[0],
      nombre:     r[1],
      categoria:  r[2] || undefined,
      activa:     r[3] === "true" || r[3] === "TRUE",
      created_at: r[4],
    } satisfies Tarea));

  return soloActivas ? tareas.filter((t) => t.activa) : tareas;
}

// ── REGISTROS DE HORAS ────────────────────────────────────────────────────────
export async function getRegistrosHoras(
  filters: ReporteFilters = {}
): Promise<RegistroHoras[]> {
  const rows = await getSheetRows(SHEET_RANGES.REGISTROS_HORAS);
  let registros = rows
    .filter((r) => r[0])
    .map((r) => ({
      id:                   r[0],
      proyecto_id:          r[1],
      tarea_id:             r[2],
      usuario_id:           r[3],
      fecha:                r[4],
      horas:                Number(r[5]),
      descripcion:          r[6],
      precio_hora_aplicado: Number(r[7]),
      monto_total:          Number(r[8]),
      estado:               (r[9] ?? "confirmado") as RegistroHoras["estado"],
      created_at:           r[10],
      updated_at:           r[11],
    } satisfies RegistroHoras));

  // Aplicar filtros en memoria
  if (filters.fechaDesde) {
    registros = registros.filter((r) => r.fecha >= filters.fechaDesde!);
  }
  if (filters.fechaHasta) {
    registros = registros.filter((r) => r.fecha <= filters.fechaHasta!);
  }
  if (filters.proyectoId) {
    registros = registros.filter((r) => r.proyecto_id === filters.proyectoId);
  }
  if (filters.clienteId) {
    // Requiere join con proyectos — se hace en el caller
  }
  if (filters.tareaId) {
    registros = registros.filter((r) => r.tarea_id === filters.tareaId);
  }
  if (filters.usuarioId) {
    registros = registros.filter((r) => r.usuario_id === filters.usuarioId);
  }
  if (filters.estado) {
    registros = registros.filter((r) => r.estado === filters.estado);
  }

  return registros;
}

export async function getRegistroById(id: string): Promise<RegistroHoras | null> {
  const registros = await getRegistrosHoras();
  return registros.find((r) => r.id === id) ?? null;
}

// ── CONFIGURACIÓN ─────────────────────────────────────────────────────────────
export async function getAppConfig(): Promise<AppConfig> {
  const rows = await getSheetRows(SHEET_RANGES.CONFIGURACIONES);
  const map = Object.fromEntries(rows.filter((r) => r[0]).map((r) => [r[0], r[1]]));

  return {
    precioBase:    Number(map.precio_base_global  ?? PRICING_DEFAULTS.precioBase),
    precioAlto:    Number(map.precio_alto_global  ?? PRICING_DEFAULTS.precioAlto),
    umbralHoras:   Number(map.umbral_horas_global ?? PRICING_DEFAULTS.umbralHoras),
    moneda:        map.moneda          ?? PRICING_DEFAULTS.moneda,
    nombreEmpresa: map.nombre_empresa  ?? "Ptime",
    logoUrl:       map.logo_url        || undefined,
    updated_at:    map.updated_at      ?? new Date().toISOString(),
  };
}
