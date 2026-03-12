// app/actions/clients.ts
"use server";

import { revalidatePath } from "next/cache";
import { auth }           from "@/auth";
import { clientFormSchema } from "@/lib/schemas/client";
import { getClientes }    from "@/lib/sheets/queries";
import { createCliente, updateCliente } from "@/lib/sheets/mutations";
import { sanitizeObject } from "@/lib/utils/sanitize";
import { generateUUID }   from "@/lib/utils/index";
import type { ActionResult, Cliente } from "@/types/entities";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }
  return session;
}

export async function createClienteAction(rawData: unknown): Promise<ActionResult<Cliente>> {
  try { await requireAdmin(); } catch { return { success: false, error: "Acceso denegado" }; }

  const parsed = clientFormSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: "Datos inválidos", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  // Verificar unicidad de email
  const existentes = await getClientes();
  if (existentes.some((c) => c.email === parsed.data.email)) {
    return { success: false, error: "Ya existe un cliente con ese email" };
  }

  const clean  = sanitizeObject(parsed.data) as typeof parsed.data;
  const id     = generateUUID();
  const ts     = new Date().toISOString();
  const cliente: Cliente = { id, ...clean, telefono: clean.telefono ?? undefined, created_at: ts, updated_at: ts };

  await createCliente(cliente);
  revalidatePath("/admin/clientes");

  return { success: true, data: cliente };
}

export async function updateClienteAction(id: string, rawData: unknown): Promise<ActionResult> {
  try { await requireAdmin(); } catch { return { success: false, error: "Acceso denegado" }; }

  const parsed = clientFormSchema.partial().safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: "Datos inválidos" };
  }

  await updateCliente(id, sanitizeObject(parsed.data) as Parameters<typeof updateCliente>[1]);
  revalidatePath("/admin/clientes");
  return { success: true, data: undefined };
}
