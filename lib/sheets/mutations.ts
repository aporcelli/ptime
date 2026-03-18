// lib/sheets/mutations.ts
import { appendSheetRow, getSheetRows, updateSheetRow } from "./client";
import { SHEET_NAMES, SHEET_RANGES } from "@/lib/constants";
import type { Cliente, Proyecto, Tarea, RegistroHoras } from "@/types/entities";

interface SheetCtx { sheetId: string; accessToken: string; }

const now = () => new Date().toISOString();

async function findRowNumber(ctx: SheetCtx, sheetRange: string, id: string): Promise<number | null> {
  const rows = await getSheetRows(ctx.sheetId, ctx.accessToken, sheetRange);
  const idx  = rows.findIndex((r) => r[0] === id);
  return idx === -1 ? null : idx + 2;
}

export async function createCliente(ctx: SheetCtx, data: Omit<Cliente, "created_at"|"updated_at">): Promise<void> {
  const ts = now();
  await appendSheetRow(ctx.sheetId, ctx.accessToken, SHEET_RANGES.CLIENTES,
    [data.id, data.nombre, data.email, data.telefono ?? "", String(data.activo), ts, ts]);
}

export async function updateCliente(ctx: SheetCtx, id: string, data: Partial<Omit<Cliente, "id"|"created_at">>): Promise<void> {
  const rowNum = await findRowNumber(ctx, SHEET_RANGES.CLIENTES, id);
  if (!rowNum) throw new Error(`Cliente ${id} no encontrado`);
  const rows    = await getSheetRows(ctx.sheetId, ctx.accessToken, SHEET_RANGES.CLIENTES);
  const current = rows.find((r) => r[0] === id)!;
  await updateSheetRow(ctx.sheetId, ctx.accessToken, SHEET_NAMES.CLIENTES, rowNum,
    [id, data.nombre ?? current[1], data.email ?? current[2], data.telefono ?? current[3] ?? "",
     String(data.activo ?? (current[4] === "true")), current[5], now()]);
}

export async function createProyecto(ctx: SheetCtx, data: Omit<Proyecto, "created_at"|"updated_at">): Promise<void> {
  const ts = now();
  await appendSheetRow(ctx.sheetId, ctx.accessToken, SHEET_RANGES.PROYECTOS,
    [data.id, data.nombre, data.cliente_id, data.presupuesto_horas ?? "",
     data.horas_acumuladas, data.umbral_precio_alto, data.precio_base, data.precio_alto, data.estado, ts, ts]);
}

export async function updateProyectoHorasAcumuladas(ctx: SheetCtx, id: string, nuevasHoras: number): Promise<void> {
  const rowNum = await findRowNumber(ctx, SHEET_RANGES.PROYECTOS, id);
  if (!rowNum) throw new Error(`Proyecto ${id} no encontrado`);
  const rows    = await getSheetRows(ctx.sheetId, ctx.accessToken, SHEET_RANGES.PROYECTOS);
  const current = rows.find((r) => r[0] === id)!;
  await updateSheetRow(ctx.sheetId, ctx.accessToken, SHEET_NAMES.PROYECTOS, rowNum,
    [current[0], current[1], current[2], current[3], nuevasHoras,
     current[5], current[6], current[7], current[8], current[9], now()]);
}

export async function createTarea(ctx: SheetCtx, data: Omit<Tarea, "created_at">): Promise<void> {
  await appendSheetRow(ctx.sheetId, ctx.accessToken, SHEET_RANGES.TAREAS,
    [data.id, data.nombre, data.categoria ?? "", String(data.activa), now()]);
}

export async function createRegistroHoras(ctx: SheetCtx, data: Omit<RegistroHoras, "created_at"|"updated_at">): Promise<void> {
  const ts = now();
  await appendSheetRow(ctx.sheetId, ctx.accessToken, SHEET_RANGES.REGISTROS_HORAS,
    [data.id, data.proyecto_id, data.tarea_id, data.usuario_id, data.fecha, data.horas,
     data.descripcion, data.precio_hora_aplicado, data.monto_total, data.estado, ts, ts]);
}

export async function updateRegistroEstado(ctx: SheetCtx, id: string, estado: RegistroHoras["estado"]): Promise<void> {
  const rowNum = await findRowNumber(ctx, SHEET_RANGES.REGISTROS_HORAS, id);
  if (!rowNum) throw new Error(`Registro ${id} no encontrado`);
  const rows    = await getSheetRows(ctx.sheetId, ctx.accessToken, SHEET_RANGES.REGISTROS_HORAS);
  const current = rows.find((r) => r[0] === id)!;
  await updateSheetRow(ctx.sheetId, ctx.accessToken, SHEET_NAMES.REGISTROS_HORAS, rowNum,
    [...current.slice(0, 9), estado, current[10], now()]);
}

export async function upsertConfig(ctx: SheetCtx, clave: string, valor: string): Promise<void> {
  const rows   = await getSheetRows(ctx.sheetId, ctx.accessToken, SHEET_RANGES.CONFIGURACIONES);
  const rowIdx = rows.findIndex((r) => r[0] === clave);
  if (rowIdx === -1) {
    await appendSheetRow(ctx.sheetId, ctx.accessToken, SHEET_RANGES.CONFIGURACIONES, [clave, valor, now()]);
  } else {
    await updateSheetRow(ctx.sheetId, ctx.accessToken, SHEET_NAMES.CONFIGURACIONES, rowIdx + 2, [clave, valor, now()]);
  }
}

export async function updateProyecto(ctx: SheetCtx, id: string, data: Partial<Omit<import("@/types/entities").Proyecto, "id"|"created_at">>): Promise<void> {
  const rowNum = await findRowNumber(ctx, SHEET_RANGES.PROYECTOS, id);
  if (!rowNum) throw new Error(`Proyecto ${id} no encontrado`);
  const rows    = await getSheetRows(ctx.sheetId, ctx.accessToken, SHEET_RANGES.PROYECTOS);
  const current = rows.find((r) => r[0] === id)!;
  await updateSheetRow(ctx.sheetId, ctx.accessToken, SHEET_NAMES.PROYECTOS, rowNum, [
    id,
    data.nombre              ?? current[1],
    data.cliente_id          ?? current[2],
    data.presupuesto_horas   ?? current[3] ?? "",
    data.horas_acumuladas    ?? current[4],
    data.umbral_precio_alto  ?? current[5],
    data.precio_base         ?? current[6],
    data.precio_alto         ?? current[7],
    data.estado              ?? current[8],
    current[9],
    now(),
  ]);
}

export async function toggleTareaActiva(ctx: SheetCtx, id: string, activa: boolean): Promise<void> {
  const rowNum = await findRowNumber(ctx, SHEET_RANGES.TAREAS, id);
  if (!rowNum) throw new Error(`Tarea ${id} no encontrada`);
  const rows    = await getSheetRows(ctx.sheetId, ctx.accessToken, SHEET_RANGES.TAREAS);
  const current = rows.find((r) => r[0] === id)!;
  await updateSheetRow(ctx.sheetId, ctx.accessToken, SHEET_NAMES.TAREAS, rowNum,
    [current[0], current[1], current[2], String(activa), current[4]]);
}
