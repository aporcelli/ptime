'use server';
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/auth";
import { getSheetCtx } from "@/lib/sheets/context";
import { getProyectos } from "@/lib/sheets/queries";
import { createProyecto, updateProyecto, deleteProyecto } from "@/lib/sheets/mutations";
import { projectFormSchema } from "@/lib/schemas/project";
import { sanitizeObject } from "@/lib/utils/sanitize";
import { generateUUID } from "@/lib/utils/index";
import type { ActionResult, Proyecto } from "@/types/entities";
import { actionDone, actionError, actionOk } from "@/lib/actions/result";
import { getLocalDevUser, getRequestUrlFromHeaders } from "@/lib/env/dev-access";

async function requireAuth() {
  const session = await auth();
  const user = session?.user ?? getLocalDevUser(getRequestUrlFromHeaders(headers()));
  if (!user) throw new Error("NO_AUTH");
  return user;
}

export async function createProyectoAction(rawData: unknown): Promise<ActionResult<Proyecto>> {
  try {
    await requireAuth();
    const parsed = projectFormSchema.safeParse(rawData);
    if (!parsed.success) {
      const errs = parsed.error.flatten().fieldErrors;
      const firstErr = Object.values(errs).flat()[0] ?? "Datos inválidos";
      return { success: false, error: firstErr };
    }

    const ctx = await getSheetCtx();
    const clean = sanitizeObject(parsed.data) as typeof parsed.data;
    const ts = new Date().toISOString();
    const proyecto: Proyecto = {
      id: generateUUID(),
      nombre: clean.nombre,
      cliente_id: clean.cliente_id ?? "",
      presupuesto_horas: clean.presupuesto_horas,
      horas_acumuladas: 0,
      umbral_precio_alto: clean.umbral_precio_alto ?? 20,
      precio_base: clean.precio_base ?? 35,
      precio_alto: clean.precio_alto ?? 45,
      estado: clean.estado,
      created_at: ts,
      updated_at: ts,
    };

    await createProyecto(ctx, proyecto);
    revalidatePath("/admin/proyectos");
    revalidatePath("/horas/nuevo");
    return actionOk(proyecto);
  } catch (e: unknown) {
    return actionError(e, "Error desconocido");
  }
}

export async function updateProyectoAction(id: string, rawData: unknown): Promise<ActionResult> {
  try {
    await requireAuth();
    const parsed = projectFormSchema.safeParse({ estado: "activo", ...rawData as object });
    if (!parsed.success) return { success: false, error: "Datos inválidos" };
    const ctx = await getSheetCtx();
    await updateProyecto(ctx, id, parsed.data);
    revalidatePath("/admin/proyectos");
    return actionDone();
  } catch (e: unknown) {
    return actionError(e, "Error");
  }
}

export async function deleteProyectoAction(id: string): Promise<ActionResult> {
  try {
    await requireAuth();
    const ctx = await getSheetCtx();
    await deleteProyecto(ctx, id);
    revalidatePath("/admin/proyectos");
    revalidatePath("/horas/nuevo");
    return actionDone();
  } catch (e: unknown) {
    return actionError(e, "Error al eliminar");
  }
}

export async function getProyectosAction(): Promise<Proyecto[]> {
  await requireAuth();
  const ctx = await getSheetCtx();
  return getProyectos(ctx);
}
