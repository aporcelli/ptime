import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

function getErrorStatus(error: unknown): number {
  if (error instanceof Error && error.message === "NO_SESSION") return 401;
  if (error instanceof Error && error.message === "NO_SHEET_CONFIGURED") return 428;
  if (error instanceof Error && error.message === "SHEET_CONTEXT_MISMATCH") return 403;
  if (error instanceof Error && error.message === "REGISTRO_NOT_FOUND") return 404;
  return 500;
}

function getPublicError(error: unknown, fallback: string): string {
  if (error instanceof Error && (
    error.message === "NO_SESSION" ||
    error.message === "NO_SHEET_CONFIGURED" ||
    error.message === "SHEET_CONTEXT_MISMATCH" ||
    error.message === "REGISTRO_NOT_FOUND"
  )) {
    return error.message;
  }
  return fallback;
}

function buildSheetCtxFromRequest(session: any, req: NextRequest, sheetIdFromBody?: string) {
  const accessToken = session?.user?.accessToken;
  if (!accessToken) throw new Error("NO_SESSION");

  const jwtSheetId = (session?.user as { sheetId?: string } | undefined)?.sheetId;
  const cookieSheetId = req.cookies.get("ptime-sheet-id")?.value;
  const trustedSheetId = jwtSheetId || cookieSheetId;
  const bodySheetId = (sheetIdFromBody || "").trim() || undefined;

  if (!trustedSheetId) throw new Error("NO_SHEET_CONFIGURED");

  // Hardening: nunca permitir que el body cambie el contexto de tenant.
  if (bodySheetId && bodySheetId !== trustedSheetId) {
    throw new Error("SHEET_CONTEXT_MISMATCH");
  }

  return { sheetId: trustedSheetId, accessToken };
}

export async function GET() {
  return NextResponse.json({ success: false, error: "METHOD_NOT_ALLOWED" }, { status: 405 });
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const ctx = buildSheetCtxFromRequest(session, req, body?.sheetId);

    const { saveHourFromActionInput } = await import("@/lib/hours/save-flow");
    const result = await saveHourFromActionInput(body, {
      ctx,
      user: session.user,
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[api/horas POST]", error);
    return NextResponse.json(
      { success: false, error: getPublicError(error, "Error al guardar") },
      { status: getErrorStatus(error) },
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const { id, sheetId, ...rawData } = body ?? {};

    if (!id || typeof id !== "string") {
      return NextResponse.json({ success: false, error: "ID inválido" }, { status: 400 });
    }

    const { hourFormSchema } = await import("@/lib/schemas/hour");
    const parsed = hourFormSchema.safeParse(rawData);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Datos inválidos", fieldErrors: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const ctx = buildSheetCtxFromRequest(session, req, sheetId);
    const usuarioId = session.user.email ?? session.user.id;
    if (!usuarioId) {
      return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
    }

    // Lógica unificada en lib/hours/service.ts (recálculo + ajustes de proyecto/tarea)
    const { updateHourRecord } = await import("@/lib/hours/service");
    await updateHourRecord(ctx, id, parsed.data, usuarioId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[api/horas PUT]", error);
    return NextResponse.json(
      { success: false, error: getPublicError(error, "Error al actualizar") },
      { status: getErrorStatus(error) },
    );
  }
}
