'use server';
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { clientFormSchema } from "@/lib/schemas/client";
import { getClientes } from "@/lib/sheets/queries";
import { createCliente, updateCliente, deleteCliente } from "@/lib/sheets/mutations";
import { sanitizeObject } from "@/lib/utils/sanitize";
import { generateUUID } from "@/lib/utils/index";
import { getSheetCtx } from "@/lib/sheets/context";
import type { ActionResult, Cliente } from "@/types/entities";

async function requireAuth() {
  const session = await auth();
  if (!session?.user) return null;
  return session;
}

export async function createClienteAction(rawData: unknown): Promise<ActionResult<Cliente>> {
  const session = await requireAuth();
  if (!session) return { success: false, error: "No autenticado" };

  const parsed = clientFormSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: "Datos inválidos: " + JSON.stringify(parsed.error.flatten().fieldErrors) };
  }

  const ctx = await getSheetCtx();
  const existentes = await getClientes(ctx);
  if (existentes.some((c) => c.email === parsed.data.email)) {
    return { success: false, error: "Ya existe un cliente con ese email" };
  }

  const clean = sanitizeObject(parsed.data) as typeof parsed.data;
  const ts = new Date().toISOString();
  const cliente: Cliente = {
    id: generateUUID(), ...clean,
    telefono: clean.telefono ?? undefined,
    created_at: ts, updated_at: ts,
  };

  await createCliente(ctx, cliente);
  revalidatePath("/admin/clientes");
  return { success: true, data: cliente };
}

export async function updateClienteAction(id: string, rawData: unknown): Promise<ActionResult> {
  const session = await requireAuth();
  if (!session) return { success: false, error: "No autenticado" };

  const parsed = clientFormSchema.partial().safeParse(rawData);
  if (!parsed.success) return { success: false, error: "Datos inválidos" };

  const ctx = await getSheetCtx();
  await updateCliente(ctx, id, sanitizeObject(parsed.data) as Parameters<typeof updateCliente>[2]);
  revalidatePath("/admin/clientes");
  return { success: true };
}

export async function deleteClienteAction(id: string): Promise<ActionResult> {
  const session = await requireAuth();
  if (!session) return { success: false, error: "No autenticado" };

  try {
    const ctx = await getSheetCtx();
    await deleteCliente(ctx, id);
    revalidatePath("/admin/clientes");
    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : "Error al eliminar" };
  }
}
