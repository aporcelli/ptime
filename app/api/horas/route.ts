import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

function getErrorStatus(error: unknown): number {
  if (error instanceof Error && error.message === "NO_SESSION") return 401;
  if (error instanceof Error && error.message === "NO_SHEET_CONFIGURED") return 428;
  return 500;
}

function getPublicError(error: unknown, fallback: string): string {
  if (error instanceof Error && (error.message === "NO_SESSION" || error.message === "NO_SHEET_CONFIGURED")) {
    return error.message;
  }
  return fallback;
}

function buildSheetCtxFromRequest(session: any, req: NextRequest, sheetIdFromBody?: string) {
  const accessToken = session?.user?.accessToken;
  if (!accessToken) throw new Error("NO_SESSION");

  const jwtSheetId = (session?.user as { sheetId?: string } | undefined)?.sheetId;
  const cookieSheetId = req.cookies.get("ptime-sheet-id")?.value;
  const sheetId = (sheetIdFromBody || "").trim() || jwtSheetId || cookieSheetId;
  if (!sheetId) throw new Error("NO_SHEET_CONFIGURED");

  return { sheetId, accessToken };
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
  let stage = "init";
  try {
    stage = "auth";
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
    }

    stage = "parse-body";
    const body = await req.json();
    const { id, sheetId, ...rawData } = body ?? {};

    if (!id || typeof id !== "string") {
      return NextResponse.json({ success: false, error: "ID inválido" }, { status: 400 });
    }

    stage = "import-schema";
    const { hourFormSchema } = await import("@/lib/schemas/hour");
    const parsed = hourFormSchema.safeParse(rawData);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Datos inválidos", fieldErrors: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    stage = "build-ctx";
    const ctx = buildSheetCtxFromRequest(session, req, sheetId);
    const data = parsed.data;
    const usuarioId = session.user.email ?? session.user.id;

    if (!usuarioId) {
      return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
    }

    stage = "import-queries";
    const {
      getProyectoById,
      getRegistroById,
      getRegistrosHoras,
    } = await import("@/lib/sheets/queries");

    stage = "import-mutations";
    const {
      updateRegistroHoras,
      updateProyectoHorasAcumuladas,
    } = await import("@/lib/sheets/mutations");

    stage = "import-sanitize";
    const { sanitize } = await import("@/lib/utils/sanitize");

    stage = "import-pricing";
    const { calculateHoursAmount } = await import("@/lib/pricing/calculateHoursAmount");

    stage = "import-accounting";
    const {
      calculateProjectHourAdjustments,
      applyProjectHourDelta,
      getMonthlyWorkedHoursAccumulated,
    } = await import("@/lib/hours/accounting");

    stage = "load-current-registro";
    const currentRegistro = await getRegistroById(ctx, id);
    if (!currentRegistro) {
      return NextResponse.json({ success: false, error: "Registro no encontrado" }, { status: 404 });
    }

    const mes = data.fecha.slice(0, 7);
    const registrosMes = await getRegistrosHoras(ctx, { usuarioId });
    const horasAcumuladasMes = getMonthlyWorkedHoursAccumulated(registrosMes, mes, id);

    const proyecto = await getProyectoById(ctx, data.proyecto_id);
    const precioBase = proyecto?.precio_base ?? 35;
    const precioAlto = proyecto?.precio_alto ?? 45;
    const umbralHoras = proyecto?.umbral_precio_alto ?? 20;

    const { montoTotal, precioAplicado, horasTrabajadas, horasACobrar } = calculateHoursAmount(
      data.horas,
      horasAcumuladasMes,
      { precioBase, precioAlto, umbralHoras },
    );

    stage = "update-registro";
    await updateRegistroHoras(ctx, id, {
      cliente_id: data.cliente_id,
      proyecto_id: data.proyecto_id,
      tarea_id: data.tarea_id,
      fecha: data.fecha,
      horas: data.horas,
      horas_trabajadas: horasTrabajadas,
      horas_a_cobrar: horasACobrar,
      descripcion: sanitize(data.descripcion),
      precio_hora_aplicado: precioAplicado,
      monto_total: montoTotal,
      estado: data.estado,
    });

    stage = "update-proyecto-hours";
    for (const adjustment of calculateProjectHourAdjustments(currentRegistro, data)) {
      const p = await getProyectoById(ctx, adjustment.proyectoId);
      if (p) {
        await updateProyectoHorasAcumuladas(
          ctx,
          adjustment.proyectoId,
          applyProjectHourDelta(p.horas_acumuladas, adjustment.deltaHoras),
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[api/horas PUT]", { stage, error });
    const status = getErrorStatus(error);
    const publicError = getPublicError(error, "Error al actualizar");
    const debugCode = `PUT_${stage.toUpperCase().replace(/[^A-Z0-9]+/g, "_")}`;
    const debugMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: publicError, debugCode, debugMessage: status === 500 ? debugMessage : undefined },
      { status },
    );
  }
}
