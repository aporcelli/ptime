'use server';
import { auth }        from "@/auth";
import { getSheetCtx } from "@/lib/sheets/context";
import { getSheetRows, appendSheetRow, updateSheetRow } from "@/lib/sheets/client";
import { revalidatePath } from "next/cache";
import { userUpsertSchema } from "@/lib/schemas/user";

export interface PtimeUser {
  id:          string;   // email usado como ID único
  nombre:      string;
  email:       string;
  rol:         "ADMIN" | "USER";
  activo:      boolean;
  ultimoAcceso: string;
  sheetId:     string;
}

const RANGE = "Usuarios!A:G";
const SHEET = "Usuarios";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("NO_AUTH");
  if (session.user.role !== "ADMIN") throw new Error("FORBIDDEN");
  return session;
}

// Registrar o actualizar usuario en la hoja Usuarios del ADMIN
export async function upsertUserRecord(user: {
  id: string; nombre: string; email: string; sheetId: string;
}): Promise<void> {
  try {
    const validated = userUpsertSchema.parse(user);
    const session = await auth();
    if (!session?.user) return;
    const ctx  = await getSheetCtx();
    const rows = await getSheetRows(ctx.sheetId, ctx.accessToken, RANGE);

    const idx = rows.findIndex((r) => r[2] === validated.email); // buscar por email
    const isAdmin = session.user.role === "ADMIN";
    const now = new Date().toISOString();

    if (idx === -1) {
      // Nuevo usuario
      await appendSheetRow(ctx.sheetId, ctx.accessToken, RANGE, [
        validated.id, validated.nombre, validated.email,
        isAdmin ? "ADMIN" : "USER",
        "true", now, validated.sheetId,
      ]);
    } else {
      // Actualizar último acceso y sheetId
      const current = rows[idx];
      await updateSheetRow(ctx.sheetId, ctx.accessToken, SHEET, idx + 2, [
        current[0], current[1], current[2],
        current[3], // mantener rol existente
        current[4], // mantener activo
        now,
        validated.sheetId,
      ]);
    }
  } catch {
    // Silencioso — no bloquear el login por esto
  }
}

export async function getUsers(): Promise<PtimeUser[]> {
  await requireAdmin();
  const ctx  = await getSheetCtx();
  const rows = await getSheetRows(ctx.sheetId, ctx.accessToken, RANGE);
  return rows.filter((r) => r[0]).map((r) => ({
    id:           r[0],
    nombre:       r[1],
    email:        r[2],
    rol:          (r[3] ?? "USER") as "ADMIN" | "USER",
    activo:       r[4] === "true" || r[4] === "TRUE",
    ultimoAcceso: r[5] ?? "",
    sheetId:      r[6] ?? "",
  }));
}

export async function setUserRole(email: string, rol: "ADMIN" | "USER"): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();
    const ctx  = await getSheetCtx();
    const rows = await getSheetRows(ctx.sheetId, ctx.accessToken, RANGE);
    const idx  = rows.findIndex((r) => r[2] === email);
    if (idx === -1) return { success: false, error: "Usuario no encontrado" };
    const current = rows[idx];
    await updateSheetRow(ctx.sheetId, ctx.accessToken, SHEET, idx + 2, [
      current[0], current[1], current[2], rol, current[4], current[5], current[6],
    ]);
    revalidatePath("/admin/usuarios");
    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : "Error" };
  }
}

export async function setUserActivo(email: string, activo: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();
    const ctx  = await getSheetCtx();
    const rows = await getSheetRows(ctx.sheetId, ctx.accessToken, RANGE);
    const idx  = rows.findIndex((r) => r[2] === email);
    if (idx === -1) return { success: false, error: "Usuario no encontrado" };
    const current = rows[idx];
    await updateSheetRow(ctx.sheetId, ctx.accessToken, SHEET, idx + 2, [
      current[0], current[1], current[2], current[3], String(activo), current[5], current[6],
    ]);
    revalidatePath("/admin/usuarios");
    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : "Error" };
  }
}
