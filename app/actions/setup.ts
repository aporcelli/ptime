// app/actions/setup.ts
// ─────────────────────────────────────────────────────────────────────────────
// Server Actions para el flujo de setup inicial del usuario.
// ─────────────────────────────────────────────────────────────────────────────
'use server';

import { auth } from "@/auth";
import { validateSpreadsheet, initializeSpreadsheet, createSpreadsheet, getSheetRows } from "@/lib/sheets/client";
import { encode } from "next-auth/jwt";
import { cookies } from "next/headers";

import { z } from "zod";

export async function validateAndSaveSheetId(
  sheetId: string
): Promise<{ success: boolean; title?: string; error?: string }> {
  const parsed = z.string().min(1).safeParse(sheetId);
  if (!parsed.success) return { success: false, error: "El Sheet ID es inválido" };
  const trimmed = parsed.data.trim();
  
  const session = await auth();
  if (!session?.user?.accessToken) {
    return { success: false, error: "No autenticado o token expirado. Por favor, inicia sesión nuevamente." };
  }

  // Validar que el sheet existe y es accesible
  const validation = await validateSpreadsheet(trimmed, session.user.accessToken);
  if (!validation.valid) {
    return {
      success: false,
      error: `No se pudo acceder al Sheet: ${validation.error}. Asegurate de que el ID sea correcto y que tengas acceso.`,
    };
  }

  // Inicializar hojas requeridas (crea las que falten, no toca las existentes)
  await initializeSpreadsheet(trimmed, session.user.accessToken);
  // Verificar autorización: si el sheet ya es un workspace compartido,
  // el usuario debe ser admin global o estar registrado en Usuarios.
  const adminEmails = (process.env.ADMIN_EMAILS ?? process.env.ADMIN_EMAIL ?? "").split(",").map((e) => e.trim().toLowerCase());
  const userEmail = (session.user.email ?? "").toLowerCase();
  const isGlobalAdmin = adminEmails.includes(userEmail);
  let isSharedWorkspace = false;

  if (!isGlobalAdmin) {
    try {
      const wmRows = await getSheetRows(trimmed, session.user.accessToken, "Workspace_Members!A:F");
      const hasMembers = wmRows.some((r) => r[2] && r[2].toLowerCase() !== userEmail);
      if (hasMembers) {
        isSharedWorkspace = true;
        const isMember = wmRows.some((r) => r[0]?.toLowerCase() === userEmail);
        if (!isMember) {
          return {
            success: false,
            error: "Acceso denegado. No sos miembro de este workspace. Solicitá una invitación al owner o seleccioná tu propio sheet.",
          };
        }
      }
    } catch {
      // Si no se puede leer Workspace_Members, permitir el acceso
    }
  }


  // Actualizar el JWT con el sheetId
  // En NextAuth v5 la forma correcta es via update() desde el cliente,
  // pero como alternativa guardamos en una cookie adicional segura.
  const cookieStore = cookies();
  if (isSharedWorkspace && !isGlobalAdmin) {
    cookieStore.set("ptime-is-shared-workspace", "true", {
      httpOnly:  true,
      secure:    process.env.NODE_ENV === "production",
      sameSite:  "lax",
      path:      "/",
      maxAge:    365 * 24 * 60 * 60,
    });
  }

  cookieStore.set("ptime-sheet-id", trimmed, {
    httpOnly:  true,
    secure:    process.env.NODE_ENV === "production",
    sameSite:  "lax",
    path:      "/",
    maxAge:    365 * 24 * 60 * 60, // 1 año
  });

  return { success: true, title: validation.title };
}

export async function getSheetIdFromCookie(): Promise<string | null> {
  const cookieStore = cookies();
  return cookieStore.get("ptime-sheet-id")?.value ?? null;
}

export async function clearSheetId(): Promise<void> {
  const cookieStore = cookies();
  cookieStore.delete("ptime-sheet-id");
}

export async function createAndConnectNewSheet(): Promise<{ success: boolean; title?: string; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.accessToken) {
      return { success: false, error: "No autenticado o token expirado. Por favor, inicia sesión nuevamente." };
    }

    const title = "Ptime — Control de Horas";
    // 1. Crear planilla nueva en Google Sheets API
    const sheetId = await createSpreadsheet(title, session.user.accessToken);

    // 2. Inicializar hojas internas (Registros, Clientes, Proyectos, etc.)
    await initializeSpreadsheet(sheetId, session.user.accessToken);

    // 3. Guardar ID de planilla en cookie segura
    const cookieStore = cookies();
    cookieStore.set("ptime-sheet-id", sheetId, {
      httpOnly:  true,
      secure:    process.env.NODE_ENV === "production",
      sameSite:  "lax",
      path:      "/",
      maxAge:    365 * 24 * 60 * 60, // 1 año
    });

    return { success: true, title };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error desconocido al crear la planilla";
    return { success: false, error: msg };
  }
}
