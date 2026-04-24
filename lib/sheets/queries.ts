// lib/sheets/queries.ts
import { getSheetRows } from "./client";
import { SHEET_RANGES } from "@/lib/constants";
import type { Cliente, Proyecto, Tarea, RegistroHoras, AppConfig, ReporteFilters, WorkspaceMember, WorkspaceMemberRol } from "@/types/entities";
import { PRICING_DEFAULTS } from "@/lib/constants";

interface SheetCtx { sheetId: string; accessToken: string; }

export async function getClientes(ctx: SheetCtx, soloActivos = false): Promise<Cliente[]> {
  const rows = await getSheetRows(ctx.sheetId, ctx.accessToken, SHEET_RANGES.CLIENTES);
  const clientes = rows.filter((r) => r[0]).map((r) => {
    const act = String(r[4]).trim().toLowerCase();
    const isActivo = act === "true" || act === "1" || act === "si" || act === "yes";
    return {
      id: String(r[0]).trim(), nombre: String(r[1] ?? ""), email: String(r[2] ?? ""), telefono: r[3] ? String(r[3]) : undefined,
      activo: isActivo, created_at: String(r[5] ?? ""), updated_at: String(r[6] ?? ""),
    } satisfies Cliente;
  });
  return soloActivos ? clientes.filter((c) => c.activo) : clientes;
}

export async function getClienteById(ctx: SheetCtx, id: string): Promise<Cliente | null> {
  return (await getClientes(ctx)).find((c) => c.id === id) ?? null;
}

export async function getProyectos(
  ctx: SheetCtx,
  options: { soloActivos?: boolean; clienteId?: string } = {}
): Promise<Proyecto[]> {
  const rows = await getSheetRows(ctx.sheetId, ctx.accessToken, SHEET_RANGES.PROYECTOS);
  let list = rows.filter((r) => r[0]).map((r) => ({
    id: String(r[0]).trim(), nombre: String(r[1] ?? ""), cliente_id: String(r[2] ?? "").trim(),
    presupuesto_horas:  r[3] ? Number(r[3]) : undefined,
    horas_acumuladas:   Number(r[4] ?? 0),
    umbral_precio_alto: Number(r[5] ?? PRICING_DEFAULTS.umbralHoras),
    precio_base:        Number(r[6] ?? PRICING_DEFAULTS.precioBase),
    precio_alto:        Number(r[7] ?? PRICING_DEFAULTS.precioAlto),
    // Estado: si está vacío o no reconocido, asumir "activo" para no ocultar proyectos
    estado: (["activo","pausado","cerrado"].includes(String(r[8] ?? "").trim().toLowerCase())
      ? String(r[8]).trim().toLowerCase()
      : "activo") as Proyecto["estado"],
    created_at: String(r[9] ?? ""), updated_at: String(r[10] ?? ""),
  } satisfies Proyecto));
  if (options.soloActivos) list = list.filter((p) => p.estado === "activo");
  if (options.clienteId) list = list.filter((p) => p.cliente_id === options.clienteId);
  return list;
}

export async function getProyectoById(ctx: SheetCtx, id: string): Promise<Proyecto | null> {
  return (await getProyectos(ctx)).find((p) => p.id === id) ?? null;
}

export async function getTareas(ctx: SheetCtx, soloActivas = false): Promise<Tarea[]> {
  const rows = await getSheetRows(ctx.sheetId, ctx.accessToken, SHEET_RANGES.TAREAS);
  const list = rows.filter((r) => r[0]).map((r) => {
    const act = String(r[3]).trim().toLowerCase();
    const isActiva = act === "true" || act === "1" || act === "si" || act === "yes";
    return {
      id: r[0], nombre: r[1], categoria: r[2] || undefined,
      activa: isActiva, created_at: r[4],
    } satisfies Tarea;
  });
  return soloActivas ? list.filter((t) => t.activa) : list;
}

export async function getRegistrosHoras(ctx: SheetCtx, filters: ReporteFilters = {}): Promise<RegistroHoras[]> {
  const rows = await getSheetRows(ctx.sheetId, ctx.accessToken, SHEET_RANGES.REGISTROS_HORAS);
  let list = rows.filter((r) => r[0]).map((r) => ({
    id: r[0], proyecto_id: r[1], tarea_id: r[2], usuario_id: r[3],
    fecha: r[4], horas: Number(r[5]), descripcion: r[6],
    precio_hora_aplicado: Number(r[7]), monto_total: Number(r[8]),
    estado: (r[9] ?? "confirmado") as RegistroHoras["estado"],
    created_at: r[10], updated_at: r[11],
    cliente_id: r[12] || undefined, // Columna M
  } satisfies RegistroHoras));
  if (filters.fechaDesde) list = list.filter((r) => r.fecha >= filters.fechaDesde!);
  if (filters.fechaHasta) list = list.filter((r) => r.fecha <= filters.fechaHasta!);
  if (filters.proyectoId) list = list.filter((r) => r.proyecto_id === filters.proyectoId);
  if (filters.tareaId)    list = list.filter((r) => r.tarea_id === filters.tareaId);
  if (filters.usuarioId)  list = list.filter((r) => r.usuario_id === filters.usuarioId);
  if (filters.estado)     list = list.filter((r) => r.estado === filters.estado);
  return list;
}

export async function getRegistroById(ctx: SheetCtx, id: string): Promise<RegistroHoras | null> {
  return (await getRegistrosHoras(ctx)).find((r) => r.id === id) ?? null;
}

export async function getAppConfig(ctx: SheetCtx): Promise<AppConfig> {
  const rows = await getSheetRows(ctx.sheetId, ctx.accessToken, SHEET_RANGES.CONFIGURACIONES);
  const map  = Object.fromEntries(rows.filter((r) => r[0]).map((r) => [r[0], r[1]]));
  return {
    precioBase:    Number(map.precio_base_global  ?? PRICING_DEFAULTS.precioBase),
    precioAlto:    Number(map.precio_alto_global  ?? PRICING_DEFAULTS.precioAlto),
    umbralHoras:   Number(map.umbral_horas_global ?? PRICING_DEFAULTS.umbralHoras),
    moneda:        map.moneda         ?? PRICING_DEFAULTS.moneda,
    nombreEmpresa: map.nombre_empresa ?? "Ptime",
    logoUrl:       map.logo_url       || undefined,
    updated_at:    map.updated_at     ?? new Date().toISOString(),
  };
}

// ── Workspace Members ─────────────────────────────────────────────────────────

export async function getWorkspaceMembers(ctx: SheetCtx): Promise<WorkspaceMember[]> {
  const rows = await getSheetRows(ctx.sheetId, ctx.accessToken, SHEET_RANGES.WORKSPACE_MEMBERS);
  return rows.filter((r) => r[0]).map((r) => ({
    email:      r[0].trim().toLowerCase(),
    sheet_id:   r[1],
    rol:        (r[2] ?? "COLABORADOR") as WorkspaceMemberRol,
    invited_by: r[3],
    created_at: r[4],
    updated_at: r[5],
  } satisfies WorkspaceMember));
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
