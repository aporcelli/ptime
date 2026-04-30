// lib/sheets/mutations.ts
import { appendSheetRow, ensureRegistroHorasHeaders, getSheetRows, updateSheetRow, clearSheetRow } from "./client";
import { SHEET_NAMES, SHEET_RANGES } from "@/lib/constants";
import type { Cliente, Proyecto, Tarea, RegistroHoras, WorkspaceMember, WorkspaceMemberRol } from "@/types/entities";
import { parseRegistroHorasRow, serializeRegistroHorasRow } from "./serializers";

interface SheetCtx { sheetId: string; accessToken: string; }

const now = () => new Date().toISOString();

async function findRowNumber(ctx: SheetCtx, sheetRange: string, id: string): Promise<number | null> {
  const rows = await getSheetRows(ctx.sheetId, ctx.accessToken, sheetRange);
  const idx = rows.findIndex((r) => r[0] === id);
  return idx === -1 ? null : idx + 2;
}

export async function createCliente(ctx: SheetCtx, data: Omit<Cliente, "created_at" | "updated_at">): Promise<void> {
  const ts = now();
  await appendSheetRow(ctx.sheetId, ctx.accessToken, SHEET_RANGES.CLIENTES,
    [data.id, data.nombre, data.email, data.telefono ?? "", String(data.activo), ts, ts]);
}

export async function updateCliente(ctx: SheetCtx, id: string, data: Partial<Omit<Cliente, "id" | "created_at">>): Promise<void> {
  const rowNum = await findRowNumber(ctx, SHEET_RANGES.CLIENTES, id);
  if (!rowNum) throw new Error(`Cliente ${id} no encontrado`);
  const rows = await getSheetRows(ctx.sheetId, ctx.accessToken, SHEET_RANGES.CLIENTES);
  const current = rows.find((r) => r[0] === id)!;
  await updateSheetRow(ctx.sheetId, ctx.accessToken, SHEET_NAMES.CLIENTES, rowNum,
    [id, data.nombre ?? current[1], data.email ?? current[2], data.telefono ?? current[3] ?? "",
      String(data.activo ?? (current[4] === "true")), current[5], now()]);
}

export async function createProyecto(ctx: SheetCtx, data: Omit<Proyecto, "created_at" | "updated_at">): Promise<void> {
  const ts = now();
  await appendSheetRow(ctx.sheetId, ctx.accessToken, SHEET_RANGES.PROYECTOS,
    [data.id, data.nombre, data.cliente_id, data.presupuesto_horas ?? "",
    data.horas_acumuladas, data.umbral_precio_alto, data.precio_base, data.precio_alto, data.estado, ts, ts]);
}

export async function updateProyectoHorasAcumuladas(ctx: SheetCtx, id: string, nuevasHoras: number): Promise<void> {
  const rowNum = await findRowNumber(ctx, SHEET_RANGES.PROYECTOS, id);
  if (!rowNum) throw new Error(`Proyecto ${id} no encontrado`);
  const rows = await getSheetRows(ctx.sheetId, ctx.accessToken, SHEET_RANGES.PROYECTOS);
  const current = rows.find((r) => r[0] === id)!;
  await updateSheetRow(ctx.sheetId, ctx.accessToken, SHEET_NAMES.PROYECTOS, rowNum,
    [current[0], current[1], current[2], current[3], nuevasHoras,
    current[5], current[6], current[7], current[8], current[9], now()]);
}

export async function createTarea(ctx: SheetCtx, data: Omit<Tarea, "created_at">): Promise<void> {
  await appendSheetRow(ctx.sheetId, ctx.accessToken, SHEET_RANGES.TAREAS,
    [data.id, data.nombre, data.categoria ?? "", String(data.activa), now()]);
}

export async function createRegistroHoras(ctx: SheetCtx, data: Omit<RegistroHoras, "created_at" | "updated_at">): Promise<void> {
  await ensureRegistroHorasHeaders(ctx.sheetId, ctx.accessToken);
  const ts = now();
  await appendSheetRow(ctx.sheetId, ctx.accessToken, SHEET_RANGES.REGISTROS_HORAS,
    serializeRegistroHorasRow(data, { created_at: ts, updated_at: ts }));
}

export async function updateRegistroEstado(ctx: SheetCtx, id: string, estado: RegistroHoras["estado"]): Promise<void> {
  await ensureRegistroHorasHeaders(ctx.sheetId, ctx.accessToken);
  const rowNum = await findRowNumber(ctx, SHEET_RANGES.REGISTROS_HORAS, id);
  if (!rowNum) throw new Error(`Registro ${id} no encontrado`);
  const rows = await getSheetRows(ctx.sheetId, ctx.accessToken, SHEET_RANGES.REGISTROS_HORAS);
  const current = rows.find((r) => r[0] === id)!;
  const parsed = parseRegistroHorasRow(current);
  await updateSheetRow(ctx.sheetId, ctx.accessToken, SHEET_NAMES.REGISTROS_HORAS, rowNum,
    serializeRegistroHorasRow({ ...parsed, estado, updated_at: now() }));
}

export async function updateRegistroHoras(ctx: SheetCtx, id: string, data: Partial<Omit<RegistroHoras, "id" | "created_at" | "updated_at">>): Promise<void> {
  await ensureRegistroHorasHeaders(ctx.sheetId, ctx.accessToken);
  const rowNum = await findRowNumber(ctx, SHEET_RANGES.REGISTROS_HORAS, id);
  if (!rowNum) throw new Error(`Registro ${id} no encontrado`);
  const rows = await getSheetRows(ctx.sheetId, ctx.accessToken, SHEET_RANGES.REGISTROS_HORAS);
  const c = rows.find((r) => r[0] === id)!;
  const current = parseRegistroHorasRow(c);
  
  await updateSheetRow(ctx.sheetId, ctx.accessToken, SHEET_NAMES.REGISTROS_HORAS, rowNum, serializeRegistroHorasRow({
    id: current.id,
    proyecto_id: data.proyecto_id ?? current.proyecto_id,
    tarea_id: data.tarea_id ?? current.tarea_id,
    usuario_id: data.usuario_id ?? current.usuario_id,
    fecha: data.fecha ?? current.fecha,
    horas: data.horas !== undefined ? data.horas : current.horas,
    horas_trabajadas: data.horas_trabajadas !== undefined ? data.horas_trabajadas : current.horas_trabajadas,
    horas_a_cobrar: data.horas_a_cobrar !== undefined ? data.horas_a_cobrar : current.horas_a_cobrar,
    descripcion: data.descripcion !== undefined ? data.descripcion : current.descripcion,
    precio_hora_aplicado: data.precio_hora_aplicado !== undefined ? data.precio_hora_aplicado : current.precio_hora_aplicado,
    monto_total: data.monto_total !== undefined ? data.monto_total : current.monto_total,
    estado: data.estado ?? current.estado,
    created_at: current.created_at,
    updated_at: now(),
    cliente_id: data.cliente_id !== undefined ? data.cliente_id : current.cliente_id,
  }));
}

export async function upsertConfig(ctx: SheetCtx, clave: string, valor: string): Promise<void> {
  const rows = await getSheetRows(ctx.sheetId, ctx.accessToken, SHEET_RANGES.CONFIGURACIONES);
  const rowIdx = rows.findIndex((r) => r[0] === clave);
  if (rowIdx === -1) {
    await appendSheetRow(ctx.sheetId, ctx.accessToken, SHEET_RANGES.CONFIGURACIONES, [clave, valor, now()]);
  } else {
    await updateSheetRow(ctx.sheetId, ctx.accessToken, SHEET_NAMES.CONFIGURACIONES, rowIdx + 2, [clave, valor, now()]);
  }
}

export async function updateProyecto(ctx: SheetCtx, id: string, data: Partial<Omit<import("@/types/entities").Proyecto, "id" | "created_at">>): Promise<void> {
  const rowNum = await findRowNumber(ctx, SHEET_RANGES.PROYECTOS, id);
  if (!rowNum) throw new Error(`Proyecto ${id} no encontrado`);
  const rows = await getSheetRows(ctx.sheetId, ctx.accessToken, SHEET_RANGES.PROYECTOS);
  const current = rows.find((r) => r[0] === id)!;
  await updateSheetRow(ctx.sheetId, ctx.accessToken, SHEET_NAMES.PROYECTOS, rowNum, [
    id,
    data.nombre ?? current[1],
    data.cliente_id ?? current[2],
    data.presupuesto_horas ?? current[3] ?? "",
    data.horas_acumuladas ?? current[4],
    data.umbral_precio_alto ?? current[5],
    data.precio_base ?? current[6],
    data.precio_alto ?? current[7],
    data.estado ?? current[8],
    current[9],
    now(),
  ]);
}

export async function toggleTareaActiva(ctx: SheetCtx, id: string, activa: boolean): Promise<void> {
  const rowNum = await findRowNumber(ctx, SHEET_RANGES.TAREAS, id);
  if (!rowNum) throw new Error(`Tarea ${id} no encontrada`);
  const rows = await getSheetRows(ctx.sheetId, ctx.accessToken, SHEET_RANGES.TAREAS);
  const current = rows.find((r) => r[0] === id)!;
  await updateSheetRow(ctx.sheetId, ctx.accessToken, SHEET_NAMES.TAREAS, rowNum,
    [current[0], current[1], current[2], String(activa), current[4]]);
}

// ── Delete helpers ────────────────────────────────────────────────────────────

async function deleteRow(ctx: SheetCtx, sheetRange: string, sheetName: string, id: string): Promise<void> {
  const rowNum = await findRowNumber(ctx, sheetRange, id);
  if (!rowNum) throw new Error(`Registro ${id} no encontrado`);
  await clearSheetRow(ctx.sheetId, ctx.accessToken, sheetName, rowNum);
}

export async function deleteCliente(ctx: SheetCtx, id: string): Promise<void> {
  await deleteRow(ctx, SHEET_RANGES.CLIENTES, SHEET_NAMES.CLIENTES, id);
}

export async function deleteProyecto(ctx: SheetCtx, id: string): Promise<void> {
  await deleteRow(ctx, SHEET_RANGES.PROYECTOS, SHEET_NAMES.PROYECTOS, id);
}

export async function deleteTarea(ctx: SheetCtx, id: string): Promise<void> {
  await deleteRow(ctx, SHEET_RANGES.TAREAS, SHEET_NAMES.TAREAS, id);
}

export async function updateTarea(ctx: SheetCtx, id: string, data: Partial<Omit<Tarea, "id" | "created_at">>): Promise<void> {
  const rowNum = await findRowNumber(ctx, SHEET_RANGES.TAREAS, id);
  if (!rowNum) throw new Error(`Tarea ${id} no encontrada`);
  const rows = await getSheetRows(ctx.sheetId, ctx.accessToken, SHEET_RANGES.TAREAS);
  const current = rows.find((r) => r[0] === id)!;
  await updateSheetRow(ctx.sheetId, ctx.accessToken, SHEET_NAMES.TAREAS, rowNum,
    [id, data.nombre ?? current[1], data.categoria ?? current[2] ?? "", String(data.activa ?? (current[3] === "true")), current[4]]);
}

export async function deleteUsuario(ctx: SheetCtx, email: string): Promise<void> {
  const rows = await getSheetRows(ctx.sheetId, ctx.accessToken, "Usuarios!A:G");
  const idx = rows.findIndex((r) => r[2] === email);
  if (idx === -1) throw new Error(`Usuario ${email} no encontrado`);
  await clearSheetRow(ctx.sheetId, ctx.accessToken, "Usuarios", idx + 2);
}

// ── Workspace Members ─────────────────────────────────────────────────────────

export async function inviteWorkspaceMember(
  ctx: SheetCtx,
  email: string,
  rol: WorkspaceMemberRol,
  invitedBy: string
): Promise<void> {
  const ts = now();
  await appendSheetRow(ctx.sheetId, ctx.accessToken, SHEET_RANGES.WORKSPACE_MEMBERS, [
    email.toLowerCase().trim(),
    ctx.sheetId,
    rol,
    invitedBy,
    ts,
    ts,
  ]);
}

export async function updateWorkspaceMemberRol(
  ctx: SheetCtx,
  email: string,
  nuevoRol: WorkspaceMemberRol
): Promise<void> {
  const rows = await getSheetRows(ctx.sheetId, ctx.accessToken, SHEET_RANGES.WORKSPACE_MEMBERS);
  const idx  = rows.findIndex((r) => r[0].toLowerCase() === email.toLowerCase());
  if (idx === -1) throw new Error(`Miembro ${email} no encontrado`);
  const rowNum = idx + 2;
  const current = rows[idx];
  await updateSheetRow(ctx.sheetId, ctx.accessToken, SHEET_NAMES.WORKSPACE_MEMBERS, rowNum, [
    current[0], current[1], nuevoRol, current[3], current[4], now()
  ]);
}

export async function removeWorkspaceMember(ctx: SheetCtx, email: string): Promise<void> {
  const rows = await getSheetRows(ctx.sheetId, ctx.accessToken, SHEET_RANGES.WORKSPACE_MEMBERS);
  const idx  = rows.findIndex((r) => r[0].toLowerCase() === email.toLowerCase());
  if (idx === -1) throw new Error(`Miembro ${email} no encontrado`);
  await clearSheetRow(ctx.sheetId, ctx.accessToken, SHEET_NAMES.WORKSPACE_MEMBERS, idx + 2);
}
