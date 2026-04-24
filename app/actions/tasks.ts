'use server';
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { getSheetCtx } from "@/lib/sheets/context";
import { getTareas } from "@/lib/sheets/queries";
import { createTarea, toggleTareaActiva, deleteTarea, updateTarea } from "@/lib/sheets/mutations";
import { sanitize } from "@/lib/utils/sanitize";
import { generateUUID } from "@/lib/utils/index";
import type { ActionResult, Tarea } from "@/types/entities";
import { z } from "zod";

const tareaSchema = z.object({
  nombre: z.string().min(2, "Mínimo 2 caracteres").max(80),
  categoria: z.string().max(50).optional(),
  activa: z.boolean().default(true),
});

export async function createTareaAction(rawData: unknown): Promise<ActionResult<Tarea>> {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "No autenticado" };

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
    return { success: true, data: JSON.parse(JSON.stringify(tarea)) };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : "Error al crear tarea" };
  }
}

export async function toggleTareaAction(id: string, activa: boolean): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "No autenticado" };
    const ctx = await getSheetCtx();
    await toggleTareaActiva(ctx, id, activa);
    revalidatePath("/admin/tareas");
    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : "Error" };
  }
}

export async function updateTareaAction(id: string, rawData: unknown): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "No autenticado" };
    const parsed = tareaSchema.partial().safeParse(rawData);
    if (!parsed.success) return { success: false, error: "Datos inválidos" };
    const ctx = await getSheetCtx();
    await updateTarea(ctx, id, parsed.data);
    revalidatePath("/admin/tareas");
    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : "Error al actualizar" };
  }
}

export async function deleteTareaAction(id: string): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "No autenticado" };
    const ctx = await getSheetCtx();
    await deleteTarea(ctx, id);
    revalidatePath("/admin/tareas");
    revalidatePath("/horas/nuevo");
    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : "Error al eliminar" };
  }
}

export async function getTareasAction(): Promise<Tarea[]> {
  const session = await auth();
  if (!session?.user) return [];
  const ctx = await getSheetCtx();
  return getTareas(ctx);
}
