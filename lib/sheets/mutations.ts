// lib/sheets/mutations.ts
// ─────────────────────────────────────────────────────────────────────────────
// Operaciones de escritura sobre Google Sheets.
// Todas las funciones son server-only.
// ─────────────────────────────────────────────────────────────────────────────

import {
  appendSheetRow,
  getSheetRows,
  updateSheetRow,
} from "./client";
import { SHEET_NAMES, SHEET_RANGES } from "@/lib/constants";
import type { Cliente, Proyecto, Tarea, RegistroHoras } from "@/types/entities";

const now = () => new Date().toISOString();

// ── Helpers para encontrar número de fila por ID ──────────────────────────────
async function findRowNumber(sheetRange: string, id: string): Promise<number | null> {
  const rows = await getSheetRows(sheetRange);
  const idx  = rows.findIndex((r) => r[0] === id);
  if (idx === -1) return null;
  return idx + 2; // +1 por encabezados, +1 por 1-indexed
}

// ── CLIENTES ─────────────────────────────────────────────────────────────────
export async function createCliente(
  data: Omit<Cliente, "created_at" | "updated_at">
): Promise<void> {
  const ts = now();
  await appendSheetRow(SHEET_RANGES.CLIENTES, [
    data.id, data.nombre, data.email,
    data.telefono ?? "", String(data.activo), ts, ts,
  ]);
}

export async function updateCliente(
  id: string,
  data: Partial<Omit<Cliente, "id" | "created_at">>
): Promise<void> {
  const rowNum = await findRowNumber(SHEET_RANGES.CLIENTES, id);
  if (!rowNum) throw new Error(`Cliente ${id} no encontrado`);

  const rows  = await getSheetRows(SHEET_RANGES.CLIENTES);
  const current = rows.find((r) => r[0] === id)!;

  await updateSheetRow(SHEET_NAMES.CLIENTES, rowNum, [
    id,
    data.nombre    ?? current[1],
    data.email     ?? current[2],
    data.telefono  ?? current[3] ?? "",
    String(data.activo ?? (current[4] === "true")),
    current[5], // created_at inmutable
    now(),
  ]);
}

// ── PROYECTOS ─────────────────────────────────────────────────────────────────
export async function createProyecto(
  data: Omit<Proyecto, "created_at" | "updated_at">
): Promise<void> {
  const ts = now();
  await appendSheetRow(SHEET_RANGES.PROYECTOS, [
    data.id,
    data.nombre,
    data.cliente_id,
    data.presupuesto_horas ?? "",
    data.horas_acumuladas,
    data.umbral_precio_alto,
    data.precio_base,
    data.precio_alto,
    data.estado,
    ts, ts,
  ]);
}

export async function updateProyectoHorasAcumuladas(
  id: string,
  nuevasHorasAcumuladas: number
): Promise<void> {
  const rowNum = await findRowNumber(SHEET_RANGES.PROYECTOS, id);
  if (!rowNum) throw new Error(`Proyecto ${id} no encontrado`);

  const rows    = await getSheetRows(SHEET_RANGES.PROYECTOS);
  const current = rows.find((r) => r[0] === id)!;

  // Solo actualizar columna E (horas_acumuladas) y K (updated_at)
  await updateSheetRow(SHEET_NAMES.PROYECTOS, rowNum, [
    current[0], current[1], current[2], current[3],
    nuevasHorasAcumuladas,
    current[5], current[6], current[7], current[8],
    current[9], // created_at
    now(),
  ]);
}

export async function updateProyecto(
  id: string,
  data: Partial<Omit<Proyecto, "id" | "created_at">>
): Promise<void> {
  const rowNum = await findRowNumber(SHEET_RANGES.PROYECTOS, id);
  if (!rowNum) throw new Error(`Proyecto ${id} no encontrado`);

  const rows    = await getSheetRows(SHEET_RANGES.PROYECTOS);
  const current = rows.find((r) => r[0] === id)!;

  await updateSheetRow(SHEET_NAMES.PROYECTOS, rowNum, [
    id,
    data.nombre              ?? current[1],
    data.cliente_id          ?? current[2],
    data.presupuesto_horas   ?? current[3] ?? "",
    data.horas_acumuladas    ?? current[4],
    data.umbral_precio_alto  ?? current[5],
    data.precio_base         ?? current[6],
    data.precio_alto         ?? current[7],
    data.estado              ?? current[8],
    current[9], // created_at
    now(),
  ]);
}

// ── TAREAS ────────────────────────────────────────────────────────────────────
export async function createTarea(
  data: Omit<Tarea, "created_at">
): Promise<void> {
  await appendSheetRow(SHEET_RANGES.TAREAS, [
    data.id, data.nombre, data.categoria ?? "", String(data.activa), now(),
  ]);
}

export async function toggleTareaActiva(id: string, activa: boolean): Promise<void> {
  const rowNum = await findRowNumber(SHEET_RANGES.TAREAS, id);
  if (!rowNum) throw new Error(`Tarea ${id} no encontrada`);

  const rows    = await getSheetRows(SHEET_RANGES.TAREAS);
  const current = rows.find((r) => r[0] === id)!;

  await updateSheetRow(SHEET_NAMES.TAREAS, rowNum, [
    current[0], current[1], current[2], String(activa), current[4],
  ]);
}

// ── REGISTROS DE HORAS ────────────────────────────────────────────────────────
export async function createRegistroHoras(
  data: Omit<RegistroHoras, "created_at" | "updated_at">
): Promise<void> {
  const ts = now();
  await appendSheetRow(SHEET_RANGES.REGISTROS_HORAS, [
    data.id,
    data.proyecto_id,
    data.tarea_id,
    data.usuario_id,
    data.fecha,
    data.horas,
    data.descripcion,
    data.precio_hora_aplicado,
    data.monto_total,
    data.estado,
    ts, ts,
  ]);
}

export async function updateRegistroEstado(
  id: string,
  estado: RegistroHoras["estado"]
): Promise<void> {
  const rowNum = await findRowNumber(SHEET_RANGES.REGISTROS_HORAS, id);
  if (!rowNum) throw new Error(`Registro ${id} no encontrado`);

  const rows    = await getSheetRows(SHEET_RANGES.REGISTROS_HORAS);
  const current = rows.find((r) => r[0] === id)!;

  await updateSheetRow(SHEET_NAMES.REGISTROS_HORAS, rowNum, [
    ...current.slice(0, 9), estado, current[10], now(),
  ]);
}

// ── CONFIGURACIÓN ─────────────────────────────────────────────────────────────
export async function upsertConfig(clave: string, valor: string): Promise<void> {
  const rows   = await getSheetRows(SHEET_RANGES.CONFIGURACIONES);
  const rowIdx = rows.findIndex((r) => r[0] === clave);

  if (rowIdx === -1) {
    await appendSheetRow(SHEET_RANGES.CONFIGURACIONES, [clave, valor, now()]);
  } else {
    const rowNum = rowIdx + 2;
    await updateSheetRow(SHEET_NAMES.CONFIGURACIONES, rowNum, [clave, valor, now()]);
  }
}
