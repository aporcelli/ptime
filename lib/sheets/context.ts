// lib/sheets/context.ts
// ─────────────────────────────────────────────────────────────────────────────
// Helper que extrae el contexto de Sheets (sheetId + accessToken) 
// desde la sesión del usuario y la cookie de configuración.
// ─────────────────────────────────────────────────────────────────────────────
import { auth }    from "@/auth";
import { cookies, headers } from "next/headers";
import { getLocalDevAccessContext, getRequestUrlFromHeaders } from "@/lib/env/dev-access";

export interface SheetCtx {
  sheetId:     string;
  accessToken: string;
}

/**
 * Obtiene el contexto de Sheets del usuario autenticado.
 * Lanza error si no hay sesión o no está configurado el sheet.
 */
export async function getSheetCtx(): Promise<SheetCtx> {
  const localCtx = getLocalDevAccessContext(getRequestUrlFromHeaders(headers()));
  if (localCtx) return localCtx;

  const session = await auth();

  if (!session?.user?.accessToken) {
    throw new Error("NO_SESSION");
  }

  const cookieStore = cookies();
  // Primero JWT (persistente cross-device), luego cookie como fallback
  const sheetId = (session.user as { sheetId?: string }).sheetId
               ?? cookieStore.get("ptime-sheet-id")?.value;

  if (!sheetId) {
    throw new Error("NO_SHEET_CONFIGURED");
  }

  return {
    sheetId,
    accessToken: session.user.accessToken,
  };
}

/**
 * Versión que retorna null en lugar de lanzar (para pages que muestran estado vacío).
 */
export async function getSheetCtxSafe(): Promise<SheetCtx | null> {
  try {
    return await getSheetCtx();
  } catch {
    return null;
  }
}
