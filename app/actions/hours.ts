'use server';
import { revalidatePath }    from "next/cache";
import { headers }           from "next/headers";
import { auth }              from "@/auth";
import { getSheetCtx }       from "@/lib/sheets/context";
import { hourFormSchema }    from "@/lib/schemas/hour";
import { calculateHoursAmount } from "@/lib/pricing/calculateHoursAmount";
import { getPricingConfigForProject } from "@/app/actions/config";
import { getProyectoById, getRegistrosHoras } from "@/lib/sheets/queries";
import { deleteRegistroHoras, updateRegistroEstado, updateRegistroHoras, updateProyectoHorasAcumuladas } from "@/lib/sheets/mutations";
import { sanitize }          from "@/lib/utils/sanitize";
import { generateUUID }      from "@/lib/utils/index";
import type { ActionResult, HoraEstado, RegistroHoras } from "@/types/entities";
import { actionDone, actionError, validationError } from "@/lib/actions/result";
import { applyProjectHourDelta, calculateProjectHourAdjustments, getMonthlyWorkedHoursAccumulated } from "@/lib/hours/accounting";
import { getLocalDevUser, getRequestUrlFromHeaders } from "@/lib/env/dev-access";
import { saveHourFromActionInput } from "@/lib/hours/save-flow";
import { getEligibleInvoiceRecordIds } from "@/lib/hours/monthly";

async function getActionUser() {
  const session = await auth();
  return session?.user ?? getLocalDevUser(getRequestUrlFromHeaders(headers()));
}

export async function createHour(rawData: unknown): Promise<ActionResult<RegistroHoras>> {
  try {
    const user = await getActionUser();
    if (!user) return { success: false, error: "No autenticado" };

    const result = await saveHourFromActionInput(rawData, {
      ctx: await getSheetCtx(),
      user,
      idFactory: generateUUID,
      getPricingConfig: getPricingConfigForProject,
    });

    if (result.success) {
      revalidatePath("/horas");
      revalidatePath("/dashboard");
    }

    return result;
  } catch (e: unknown) {
    console.error("[createHour] Error:", e);
    return actionError(e, "Error desconocido al crear");
  }
}

export async function changeHourStatus(id: string, estado: HoraEstado): Promise<ActionResult> {
  try {
    const user = await getActionUser();
    if (!user) return { success: false, error: "No autenticado" };
    const ctx = await getSheetCtx();
    await updateRegistroEstado(ctx, id, estado);
    revalidatePath("/horas");
    revalidatePath("/dashboard");
    revalidatePath("/reportes");
    return actionDone();
  } catch (e) {
    return actionError(e, "Error al cambiar estado");
  }
}

export async function markMonthAsInvoiced(month: string): Promise<ActionResult<{ count: number; totalAmount: number }>> {
  try {
    const user = await getActionUser();
    if (!user) return { success: false, error: "No autenticado" };
    const usuarioId = user.email ?? user.id;
    if (!usuarioId) return { success: false, error: "No autenticado" };
    if (!/^\d{4}-\d{2}$/.test(month)) return { success: false, error: "Mes inválido" };

    const ctx = await getSheetCtx();
    const registros = await getRegistrosHoras(ctx, { usuarioId });
    const ids = getEligibleInvoiceRecordIds(registros, month, usuarioId);
    const totalAmount = registros
      .filter((registro) => ids.includes(registro.id))
      .reduce((total, registro) => Math.round((total + registro.monto_total) * 100) / 100, 0);

    for (const id of ids) await updateRegistroEstado(ctx, id, "facturado");

    revalidatePath("/horas");
    revalidatePath("/dashboard");
    revalidatePath("/reportes");
    return { success: true, data: { count: ids.length, totalAmount } };
  } catch (e) {
    return actionError(e, "Error al facturar el mes");
  }
}

export async function updateHourAction(id: string, rawData: unknown): Promise<ActionResult> {
  try {
    const user = await getActionUser();
    if (!user) return { success: false, error: "No autenticado" };

    const parsed = hourFormSchema.safeParse(rawData);
    if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors as Record<string, string[]>);

    const ctx = await getSheetCtx();
    const data = parsed.data;
    const usuarioId = user.email ?? user.id;

    // Calculamos el precio nuevamente por si cambió horas o proyecto.
    const mes = data.fecha.slice(0, 7);
    const registrosMes = await getRegistrosHoras(ctx, { usuarioId });
    
    // Ojo: Restamos las horas actuales de *este* registro del acumulado para no contarlas doble
    const currentRegistro = registrosMes.find(r => r.id === id);
    if (!currentRegistro) return { success: false, error: "Registro no encontrado" };

    const horasAcumuladasMes = getMonthlyWorkedHoursAccumulated(registrosMes, mes, id);

    const pricingConfig = await getPricingConfigForProject(data.proyecto_id);
    const { montoTotal, precioAplicado, horasTrabajadas, horasACobrar } = calculateHoursAmount(
      data.horas,
      horasAcumuladasMes,
      pricingConfig
    );

    const cleanDesc = sanitize(data.descripcion);

    await updateRegistroHoras(ctx, id, {
      cliente_id: data.cliente_id,
      proyecto_id: data.proyecto_id,
      tarea_id: data.tarea_id,
      fecha: data.fecha,
      horas: data.horas,
      horas_trabajadas: horasTrabajadas,
      horas_a_cobrar: horasACobrar,
      descripcion: cleanDesc,
      precio_hora_aplicado: precioAplicado,
      monto_total: montoTotal,
      estado: data.estado,
    });

    for (const adjustment of calculateProjectHourAdjustments(currentRegistro, data)) {
      const proyecto = await getProyectoById(ctx, adjustment.proyectoId);
      if (proyecto) {
        await updateProyectoHorasAcumuladas(ctx, adjustment.proyectoId, applyProjectHourDelta(proyecto.horas_acumuladas, adjustment.deltaHoras));
      }
    }

    revalidatePath("/horas");
    revalidatePath("/dashboard");
    revalidatePath(`/horas/${id}`);
    return actionDone();
  } catch (e: unknown) {
    console.error("[updateHourAction] Error:", e);
    return actionError(e, "Error desconocido al actualizar");
  }
}

export async function deleteHourAction(id: string): Promise<ActionResult> {
  try {
    const user = await getActionUser();
    if (!user) return { success: false, error: "No autenticado" };
    const usuarioId = user.email ?? user.id;
    if (!usuarioId) return { success: false, error: "No autenticado" };

    const ctx = await getSheetCtx();
    const registros = await getRegistrosHoras(ctx, { usuarioId });
    const registro = registros.find((r) => r.id === id);
    if (!registro) return { success: false, error: "Registro no encontrado" };

    await deleteRegistroHoras(ctx, id);

    const proyecto = await getProyectoById(ctx, registro.proyecto_id);
    if (proyecto) {
      await updateProyectoHorasAcumuladas(
        ctx,
        registro.proyecto_id,
        applyProjectHourDelta(proyecto.horas_acumuladas, -registro.horas),
      );
    }

    revalidatePath("/horas");
    revalidatePath("/dashboard");
    revalidatePath("/reportes");
    revalidatePath(`/horas/${id}`);
    return actionDone();
  } catch (e: unknown) {
    console.error("[deleteHourAction] Error:", e);
    return actionError(e, "Error al eliminar registro");
  }
}
