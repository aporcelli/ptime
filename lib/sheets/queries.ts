// lib/sheets/queries.ts
import { getSheetRows } from "./client";
import { SHEET_RANGES } from "@/lib/constants";
import type { Cliente, Proyecto, Tarea, RegistroHoras, AppConfig, ReporteFilters, WorkspaceMember, WorkspaceMemberRol } from "@/types/entities";
import { PRICING_DEFAULTS } from "@/lib/constants";
import { toPlainJson } from "@/lib/actions/result";
import { parseClienteRow, parseNum, parseProyectoRow, parseRegistroHorasRow, parseTareaRow } from "./serializers";

interface SheetCtx { sheetId: string; accessToken: string; }

function safeReturn<T>(data: T): T {
  return toPlainJson(data);
}

export async function getClientes(ctx: SheetCtx, soloActivos = false): Promise<Cliente[]> {
  const rows = await getSheetRows(ctx.sheetId, ctx.accessToken, SHEET_RANGES.CLIENTES);
  const clientes = rows.filter((r) => r[0]).map((r) => parseClienteRow(r));
  const list = soloActivos ? clientes.filter((c) => c.activo) : clientes;
  return safeReturn(list);
}

export async function getClienteById(ctx: SheetCtx, id: string): Promise<Cliente | null> {
  return (await getClientes(ctx)).find((c) => c.id === id) ?? null;
}

export async function getProyectos(
  ctx: SheetCtx,
  options: { soloActivos?: boolean; clienteId?: string } = {}
): Promise<Proyecto[]> {
  const rows = await getSheetRows(ctx.sheetId, ctx.accessToken, SHEET_RANGES.PROYECTOS);
  let list = rows.filter((r) => r[0]).map((r) => parseProyectoRow(r));
  if (options.soloActivos) list = list.filter((p) => p.estado === "activo");
  if (options.clienteId) list = list.filter((p) => p.cliente_id === options.clienteId);
  return safeReturn(list);
}

export async function getProyectoById(ctx: SheetCtx, id: string): Promise<Proyecto | null> {
  return (await getProyectos(ctx)).find((p) => p.id === id) ?? null;
}

export async function getTareas(ctx: SheetCtx, soloActivas = false): Promise<Tarea[]> {
  const rows = await getSheetRows(ctx.sheetId, ctx.accessToken, SHEET_RANGES.TAREAS);
  const list = rows.filter((r) => r[0]).map((r) => parseTareaRow(r));
  return safeReturn(soloActivas ? list.filter((t) => t.activa) : list);
}

export async function getRegistrosHoras(ctx: SheetCtx, filters: ReporteFilters = {}): Promise<RegistroHoras[]> {
  const rows = await getSheetRows(ctx.sheetId, ctx.accessToken, SHEET_RANGES.REGISTROS_HORAS);
  let list = rows.filter((r) => r[0]).map((r) => parseRegistroHorasRow(r));
  if (filters.fechaDesde) list = list.filter((r) => r.fecha >= filters.fechaDesde!);
  if (filters.fechaHasta) list = list.filter((r) => r.fecha <= filters.fechaHasta!);
  if (filters.proyectoId) list = list.filter((r) => r.proyecto_id === filters.proyectoId);
  if (filters.tareaId)    list = list.filter((r) => r.tarea_id === filters.tareaId);
  if (filters.usuarioId)  list = list.filter((r) => r.usuario_id === filters.usuarioId);
  if (filters.estado)     list = list.filter((r) => r.estado === filters.estado);
  return safeReturn(list);
}

export async function getRegistroById(ctx: SheetCtx, id: string): Promise<RegistroHoras | null> {
  return (await getRegistrosHoras(ctx)).find((r) => r.id === id) ?? null;
}

export async function getAppConfig(ctx: SheetCtx): Promise<AppConfig> {
  const rows = await getSheetRows(ctx.sheetId, ctx.accessToken, SHEET_RANGES.CONFIGURACIONES);
  const map  = Object.fromEntries(rows.filter((r) => r[0]).map((r) => [r[0], r[1]]));
  const config = {
    precioBase:    parseNum(map.precio_base_global, PRICING_DEFAULTS.precioBase),
    precioAlto:    parseNum(map.precio_alto_global, PRICING_DEFAULTS.precioAlto),
    umbralHoras:   parseNum(map.umbral_horas_global, PRICING_DEFAULTS.umbralHoras),
    moneda:        map.moneda         ?? PRICING_DEFAULTS.moneda,
    nombreEmpresa: map.nombre_empresa ?? "Ptime",
    logoUrl:       map.logo_url       || undefined,
    updated_at:    map.updated_at     ?? new Date().toISOString(),
  } satisfies AppConfig;
  return safeReturn(config);
}

// ── Workspace Members ─────────────────────────────────────────────────────────

export async function getWorkspaceMembers(ctx: SheetCtx): Promise<WorkspaceMember[]> {
  const rows = await getSheetRows(ctx.sheetId, ctx.accessToken, SHEET_RANGES.WORKSPACE_MEMBERS);
  const members = rows.filter((r) => r[0]).map((r) => ({
    email:      String(r[0] ?? "").trim().toLowerCase(),
    sheet_id:   String(r[1] ?? ""),
    rol:        String(r[2] ?? "COLABORADOR").trim().toUpperCase() as WorkspaceMemberRol,
    invited_by: String(r[3] ?? ""),
    created_at: String(r[4] ?? ""),
    updated_at: String(r[5] ?? ""),
  } satisfies WorkspaceMember));
  return safeReturn(members);
}

/**
 * Dado un email, busca en el Sheet si ese usuario fue invitado como miembro.
 * Retorna el miembro o null si no existe.
 */
export async function getWorkspaceMemberByEmail(
  ctx: SheetCtx,
  email: string
): Promise<WorkspaceMember | null> {
  const members = await getWorkspaceMembers(ctx);
  return members.find((m) => m.email === email.toLowerCase()) ?? null;
}
