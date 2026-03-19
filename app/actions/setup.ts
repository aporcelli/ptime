// app/actions/setup.ts
// ─────────────────────────────────────────────────────────────────────────────
// Server Actions para el flujo de setup inicial del usuario.
// ─────────────────────────────────────────────────────────────────────────────
'use server';

import { auth } from "@/auth";
import { validateSpreadsheet, initializeSpreadsheet } from "@/lib/sheets/client";
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

  // Actualizar el JWT con el sheetId
  // En NextAuth v5 la forma correcta es via update() desde el cliente,
  // pero como alternativa guardamos en una cookie adicional segura.
  const cookieStore = cookies();
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
