// lib/sheets/getPageCtx.ts
// Helper para obtener el ctx en Server Components (pages).
import { auth }     from "@/auth";
import { cookies, headers }  from "next/headers";
import { redirect } from "next/navigation";
import { getLocalDevAccessContext, getRequestUrlFromHeaders } from "@/lib/env/dev-access";

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

  return { sheetId, accessToken };
}
