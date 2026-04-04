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

  // Cada usuario tiene su propio Sheet — se lee desde la cookie (guardada en Setup)
  // o desde el JWT si ya lo había configurado previamente (cross-device)
  const sheetId     = cookieStore.get("ptime-sheet-id")?.value
                   ?? (session?.user as { sheetId?: string })?.sheetId
                   ?? undefined;

  const accessToken = session?.user?.accessToken;

  if (!session?.user || !accessToken || !sheetId) {
    redirect("/setup");
  }

  return { sheetId, accessToken };
}
