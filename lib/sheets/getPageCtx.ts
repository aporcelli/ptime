// lib/sheets/getPageCtx.ts
// Helper para obtener el ctx en Server Components (pages).
import { auth }     from "@/auth";
import { cookies, headers }  from "next/headers";
import { redirect } from "next/navigation";
import { getLocalDevAccessContext, getRequestUrlFromHeaders } from "@/lib/env/dev-access";
import { upsertUserRecord } from "@/app/actions/users";
import { validateSpreadsheet } from "./client";

export interface SheetCtx {
  sheetId:     string;
  accessToken: string;
}

export async function getPageCtx(): Promise<SheetCtx> {
  const localCtx = getLocalDevAccessContext(getRequestUrlFromHeaders(headers()));
  if (localCtx) return localCtx;

  const session     = await auth();
  const cookieStore = cookies();

  // Sin sesión → login
  if (!session?.user) {
    redirect("/login");
  }

  // Token expirado o sin access token → re-login con mensaje claro
  if (session.error === "RefreshTokenError" || !session.user.accessToken) {
    redirect("/login?error=TokenExpired");
  }

  // Cada usuario tiene su propio Sheet — preferimos el JWT (persistente cross-device),
  // luego cookie como fallback.
  const sheetId     = (session.user as { sheetId?: string })?.sheetId
                   ?? cookieStore.get("ptime-sheet-id")?.value
                   ?? undefined;

  if (!sheetId) {
    redirect("/setup");
  }

  const accessToken = session.user.accessToken;

  // Validar que el Sheet siga existiendo y sea accesible en Google Drive
  const validation = await validateSpreadsheet(sheetId, accessToken);
  if (!validation.valid) {
    cookieStore.delete("ptime-sheet-id");
    redirect("/setup?error=SheetNotFound");
  }

  // Registrar / actualizar datos de acceso del usuario en la pestaña Usuarios
  if (session.user.email) {
    const userEmail = session.user.email;
    const userName = session.user.name || userEmail.split("@")[0];
    const userId = session.user.id || userEmail;
    upsertUserRecord({ id: userId, nombre: userName, email: userEmail, sheetId }, { sheetId, accessToken }).catch(() => {});
  }

  return { sheetId, accessToken };
}
