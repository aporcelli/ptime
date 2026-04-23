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

  // Cada usuario tiene su propio Sheet — preferimos el JWT (persistente cross-device),
  // luego cookie como fallback.
  const sheetId     = (session?.user as { sheetId?: string })?.sheetId
                   ?? cookieStore.get("ptime-sheet-id")?.value
                   ?? undefined;

  const accessToken = session?.user?.accessToken;

  if (!session?.user || !accessToken || !sheetId) {
    redirect("/setup");
  }

  return { sheetId, accessToken };
}
