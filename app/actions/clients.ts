'use server';
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/auth";
import { clientFormSchema } from "@/lib/schemas/client";
import { createCliente, updateCliente, deleteCliente } from "@/lib/sheets/mutations";
import { sanitizeObject } from "@/lib/utils/sanitize";
import { generateUUID } from "@/lib/utils/index";
import { getSheetCtx } from "@/lib/sheets/context";
import type { ActionResult, Cliente } from "@/types/entities";
import { actionDone, actionError, actionOk } from "@/lib/actions/result";
import { getLocalDevUser, getRequestUrlFromHeaders } from "@/lib/env/dev-access";

async function requireAuth() {
  const session = await auth();
  return session?.user ?? getLocalDevUser(getRequestUrlFromHeaders(headers()));
}

export async function createClienteAction(rawData: unknown): Promise<ActionResult<Cliente>> {
  const session = await requireAuth();
  if (!session) return { success: false, error: "No autenticado" };

  const parsed = clientFormSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: "Datos inválidos: " + JSON.stringify(parsed.error.flatten().fieldErrors) };
  }

  try {
    const ctx = await getSheetCtx();
    const clean = sanitizeObject(parsed.data) as typeof parsed.data;
    const ts = new Date().toISOString();
    const cliente: Cliente = {
      id: generateUUID(), ...clean,
      telefono: clean.telefono ?? undefined,
      created_at: ts, updated_at: ts,
    };

    await createCliente(ctx, cliente);
    revalidatePath("/admin/clientes");
    return actionOk(cliente);
  } catch (e) {
    return actionError(e, "Error al crear cliente");
  }
}

export async function updateClienteAction(id: string, rawData: unknown): Promise<ActionResult> {
  const session = await requireAuth();
  if (!session) return { success: false, error: "No autenticado" };

  const parsed = clientFormSchema.partial().safeParse(rawData);
  if (!parsed.success) return { success: false, error: "Datos inválidos" };

  try {
    const ctx = await getSheetCtx();
    await updateCliente(ctx, id, sanitizeObject(parsed.data) as Parameters<typeof updateCliente>[2]);
    revalidatePath("/admin/clientes");
    return actionDone();
  } catch (e) {
    return actionError(e, "Error al actualizar cliente");
  }
}

export async function deleteClienteAction(id: string): Promise<ActionResult> {
  const session = await requireAuth();
  if (!session) return { success: false, error: "No autenticado" };

  try {
    const ctx = await getSheetCtx();
    await deleteCliente(ctx, id);
    revalidatePath("/admin/clientes");
    return actionDone();
  } catch (e: unknown) {
    return actionError(e, "Error al eliminar");
  }
}
