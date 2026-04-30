import { actionOk, validationError, actionError } from "@/lib/actions/result";
import { calculateHoursAmount } from "@/lib/pricing/calculateHoursAmount";
import { hourFormSchema } from "@/lib/schemas/hour";
import { sanitize } from "@/lib/utils/sanitize";
import type { PricingConfig, RegistroHoras } from "@/types/entities";
import type { SheetCtx } from "@/lib/sheets/context";
import { getProyectoById, getRegistrosHoras } from "@/lib/sheets/queries";
import { createRegistroHoras, updateProyectoHorasAcumuladas } from "@/lib/sheets/mutations";
import { generateUUID } from "@/lib/utils/index";
import type { ActionResult } from "@/types/entities";
import { getMonthlyWorkedHoursAccumulated } from "@/lib/hours/accounting";

type ActionUser = { id?: string | null; email?: string | null };

type SaveHourOptions = {
  ctx: SheetCtx;
  user: ActionUser;
  idFactory?: () => string;
  now?: () => string;
  getPricingConfig?: (projectId: string) => Promise<PricingConfig>;
};

const defaultPricingConfig = async (projectId: string, ctx: SheetCtx): Promise<PricingConfig> => {
  const proyecto = await getProyectoById(ctx, projectId);
  return {
    precioBase: proyecto?.precio_base ?? 35,
    precioAlto: proyecto?.precio_alto ?? 45,
    umbralHoras: proyecto?.umbral_precio_alto ?? 20,
  };
};

export async function saveHourFromActionInput(rawData: unknown, options: SaveHourOptions): Promise<ActionResult<RegistroHoras>> {
  try {
    const parsed = hourFormSchema.safeParse(rawData);
    if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors as Record<string, string[]>);

    const data = parsed.data;
    const proyecto = await getProyectoById(options.ctx, data.proyecto_id);
    if (!proyecto) return { success: false, error: "Proyecto no encontrado" };
    if (proyecto.estado !== "activo") return { success: false, error: "El proyecto no está activo" };

    const usuarioId = options.user.email ?? options.user.id;
    if (!usuarioId) return { success: false, error: "No autenticado" };

    const mes = data.fecha.slice(0, 7);
    const registrosMes = await getRegistrosHoras(options.ctx, { usuarioId });
    const horasAcumuladasMes = getMonthlyWorkedHoursAccumulated(registrosMes, mes);

    const pricingConfig = options.getPricingConfig
      ? await options.getPricingConfig(data.proyecto_id)
      : await defaultPricingConfig(data.proyecto_id, options.ctx);
    const { montoTotal, precioAplicado, horasTrabajadas, horasACobrar } = calculateHoursAmount(data.horas, horasAcumuladasMes, pricingConfig);
    const timestamp = options.now?.() ?? new Date().toISOString();

    const registro: RegistroHoras = {
      id: options.idFactory?.() ?? generateUUID(),
      cliente_id: data.cliente_id,
      proyecto_id: data.proyecto_id,
      tarea_id: data.tarea_id,
      usuario_id: usuarioId,
      fecha: data.fecha,
      horas: data.horas,
      horas_trabajadas: horasTrabajadas,
      horas_a_cobrar: horasACobrar,
      descripcion: sanitize(data.descripcion),
      precio_hora_aplicado: precioAplicado,
      monto_total: montoTotal,
      estado: data.estado,
      created_at: timestamp,
      updated_at: timestamp,
    };

    await createRegistroHoras(options.ctx, registro);
    await updateProyectoHorasAcumuladas(
      options.ctx,
      data.proyecto_id,
      Math.round((proyecto.horas_acumuladas + data.horas) * 10000) / 10000,
    );

    return actionOk(registro);
  } catch (error) {
    return actionError(error, "Error desconocido al crear");
  }
}
