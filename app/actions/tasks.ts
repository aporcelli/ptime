'use server';
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/auth";
import { getSheetCtx } from "@/lib/sheets/context";
import { getTareas } from "@/lib/sheets/queries";
import { createTarea, toggleTareaActiva, deleteTarea, updateTarea } from "@/lib/sheets/mutations";
import { sanitize } from "@/lib/utils/sanitize";
import { generateUUID } from "@/lib/utils/index";
import type { ActionResult, Tarea } from "@/types/entities";
import { z } from "zod";
import { actionDone, actionError, actionOk } from "@/lib/actions/result";
import { getLocalDevUser, getRequestUrlFromHeaders } from "@/lib/env/dev-access";

const tareaSchema = z.object({
  nombre: z.string().min(2, "Mínimo 2 caracteres").max(80),
  categoria: z.string().max(50).optional(),
  activa: z.boolean().default(true),
});

async function getActionUser() {
  const session = await auth();
  return session?.user ?? getLocalDevUser(getRequestUrlFromHeaders(headers()));
}

export async function createTareaAction(rawData: unknown): Promise<ActionResult<Tarea>> {
  try {
    const user = await getActionUser();
    if (!user) return { success: false, error: "No autenticado" };

    const parsed = tareaSchema.safeParse(rawData);
    if (!parsed.success) {
      const firstErr = Object.values(parsed.error.flatten().fieldErrors).flat()[0] ?? "Datos inválidos";
      return { success: false, error: firstErr };
    }

    const ctx = await getSheetCtx();
    const tarea: Tarea = {
      id: generateUUID(),
      nombre: sanitize(parsed.data.nombre),
      categoria: parsed.data.categoria ? sanitize(parsed.data.categoria) : undefined,
      activa: parsed.data.activa,
      created_at: new Date().toISOString(),
    };

    await createTarea(ctx, tarea);
    revalidatePath("/admin/tareas");
    revalidatePath("/horas/nuevo");
    return actionOk(tarea);
  } catch (e: unknown) {
    return actionError(e, "Error al crear tarea");
  }
}

export async function toggleTareaAction(id: string, activa: boolean): Promise<ActionResult> {
  try {
    const user = await getActionUser();
    if (!user) return { success: false, error: "No autenticado" };
    const ctx = await getSheetCtx();
    await toggleTareaActiva(ctx, id, activa);
    revalidatePath("/admin/tareas");
    return actionDone();
  } catch (e: unknown) {
    return actionError(e, "Error");
  }
}

export async function updateTareaAction(id: string, rawData: unknown): Promise<ActionResult> {
  try {
    const user = await getActionUser();
    if (!user) return { success: false, error: "No autenticado" };
    const parsed = tareaSchema.partial().safeParse(rawData);
    if (!parsed.success) return { success: false, error: "Datos inválidos" };
    const ctx = await getSheetCtx();
    await updateTarea(ctx, id, parsed.data);
    revalidatePath("/admin/tareas");
    return actionDone();
  } catch (e: unknown) {
    return actionError(e, "Error al actualizar");
  }
}

export async function deleteTareaAction(id: string): Promise<ActionResult> {
  try {
    const user = await getActionUser();
    if (!user) return { success: false, error: "No autenticado" };
    const ctx = await getSheetCtx();
    await deleteTarea(ctx, id);
    revalidatePath("/admin/tareas");
    revalidatePath("/horas/nuevo");
    return actionDone();
  } catch (e: unknown) {
    return actionError(e, "Error al eliminar");
  }
}

export async function getTareasAction(): Promise<Tarea[]> {
  const user = await getActionUser();
  if (!user) return [];
  const ctx = await getSheetCtx();
  return getTareas(ctx);
}
