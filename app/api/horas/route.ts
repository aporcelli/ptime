import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import type { SheetCtx } from "@/lib/sheets/context";
import { saveHourFromActionInput } from "@/lib/hours/save-flow";
import { hourFormSchema } from "@/lib/schemas/hour";
import { getProyectoById, getRegistroById, getRegistrosHoras } from "@/lib/sheets/queries";
import { updateRegistroHoras, updateProyectoHorasAcumuladas } from "@/lib/sheets/mutations";
import { sanitize } from "@/lib/utils/sanitize";
import { calculateHoursAmount } from "@/lib/pricing/calculateHoursAmount";
import { calculateProjectHourAdjustments, applyProjectHourDelta, getMonthlyWorkedHoursAccumulated } from "@/lib/hours/accounting";

function buildSheetCtxFromSession(session: any, sheetIdFromBody?: string): SheetCtx {
  const accessToken = session?.user?.accessToken;
  if (!accessToken) throw new Error("NO_SESSION");

  const jwtSheetId = (session?.user as { sheetId?: string } | undefined)?.sheetId;
  const sheetId = (sheetIdFromBody || "").trim() || jwtSheetId;
  if (!sheetId) throw new Error("NO_SHEET_CONFIGURED");

  return { sheetId, accessToken };
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const ctx = buildSheetCtxFromSession(session, body?.sheetId);
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
    return NextResponse.json({ success: false, error: "Error al guardar" }, { status: 500 });
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

    const parsed = hourFormSchema.safeParse(rawData);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Datos inválidos", fieldErrors: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const ctx = buildSheetCtxFromSession(session, sheetId);
    const data = parsed.data;
    const usuarioId = session.user.email ?? session.user.id;

    if (!usuarioId) {
      return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
    }

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
      { precioBase, precioAlto, umbralHoras }
    );

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
    console.error("[api/horas PUT]", error);
    return NextResponse.json({ success: false, error: "Error al actualizar" }, { status: 500 });
  }
}
