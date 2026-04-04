// lib/sheets/getPageCtx.ts
// Helper para obtener el ctx en Server Components (pages).
import { auth }     from "@/auth";
import { cookies }  from "next/headers";
import { redirect } from "next/navigation";

export interface SheetCtx {
  sheetId:     string;
  accessToken: string;
}

export async function getPageCtx(): Promise<SheetCtx> {
  const session     = await auth();
  const cookieStore = cookies();

  // 1. Intentar leer el sheetId desde la cookie del usuario (setup manual)
  // 2. Fallback: variable de entorno global (todos los usuarios usan el mismo Sheet)
  const sheetId     = cookieStore.get("ptime-sheet-id")?.value
                   ?? process.env.SHEET_ID
                   ?? undefined;

  const accessToken = session?.user?.accessToken;

  if (!session?.user || !accessToken || !sheetId) {
    redirect("/setup");
  }

  return { sheetId, accessToken };
}
