// lib/hours/service.ts
// ─────────────────────────────────────────────────────────────────────────────
// ÚNICA fuente de verdad para las operaciones de horas que implican pricing,
// recálculo y acumulados. Los Server Actions y API Routes delegan aquí y quedan
// como controladores delgados (< 15 líneas de lógica).
//
// Contratos públicos:
//   - resolvePricingConfig(ctx, proyectoId): PricingConfig   (incluye usarTarifaFija)
//   - updateHourRecord(ctx, id, data, usuarioId): void        (edición + recálculo)
//   - deleteHourRecord(ctx, id, usuarioId): void              (borrado + ajustes)
// ─────────────────────────────────────────────────────────────────────────────
import { calculateHoursAmount } from "@/lib/pricing/calculateHoursAmount";
import type { PricingConfig } from "@/types/entities";
import type { SheetCtx } from "@/lib/sheets/context";
import { getAppConfig, getProyectoById, getRegistrosHoras, getRegistroById, getTareaById } from "@/lib/sheets/queries";
import { deleteRegistroHoras, updateProyectoHorasAcumuladas, updateRegistroHoras, updateTareaHorasAcumuladas } from "@/lib/sheets/mutations";
import { sanitize } from "@/lib/utils/sanitize";
import { applyProjectHourDelta, calculateProjectHourAdjustments, getAccumulatedWorkedHoursUpTo } from "@/lib/hours/accounting";
import type { HourFormData } from "@/lib/schemas/hour";

const round4 = (value: number) => Math.round(value * 10_000) / 10_000;

/**
 * Resuelve la configuración de precios de un proyecto, respetando la tarifa
 * plana (`usarTarifaFija`) cuando esté activa. Unifica el comportamiento entre
 * Server Actions y API Routes (la API antes omitía la tarifa fija).
 */
export async function resolvePricingConfig(ctx: SheetCtx, proyectoId: string): Promise<PricingConfig> {
  const [global, proyecto] = await Promise.all([getAppConfig(ctx), getProyectoById(ctx, proyectoId)]);
  if (!proyecto) return global;
  return {
    precioBase:     proyecto.precio_base        ?? global.precioBase,
    precioAlto:     proyecto.precio_alto        ?? global.precioAlto,
    umbralHoras:    proyecto.umbral_precio_alto ?? global.umbralHoras,
    usarTarifaFija: proyecto.usar_tarifa_fija   ?? global.usarTarifaFija,
  };
}

/**
 * Detecta si un cambio en los datos del registro requiere recalcular el pricing
 * (proyecto, fecha u horas). Ediciones de descripción/estado/cliente NO recalcular.
 */
export function isPricingSensitiveChange(
  current: { proyecto_id: string; fecha: string; horas: number },
  next: { proyecto_id: string; fecha: string; horas: number },
): boolean {
  const normalizeDate = (value: string) => String(value ?? "").slice(0, 10);
  return (
    current.proyecto_id !== next.proyecto_id ||
    normalizeDate(current.fecha) !== normalizeDate(next.fecha) ||
    Number(current.horas) !== Number(next.horas)
  );
}

/**
 * Actualiza un registro de horas con recálculo de pricing por posición
 * cronológica, ajustes de horas acumuladas del proyecto y de la tarea.
 */
export async function updateHourRecord(
  ctx: SheetCtx,
  id: string,
  data: HourFormData,
  usuarioId: string,
): Promise<void> {
  const currentRegistro = await getRegistroById(ctx, id);
  if (!currentRegistro) throw new Error("REGISTRO_NOT_FOUND");

  let horasTrabajadas = currentRegistro.horas_trabajadas ?? currentRegistro.horas;
  let horasACobrar = currentRegistro.horas_a_cobrar ?? currentRegistro.horas;
  let precioAplicado = currentRegistro.precio_hora_aplicado;
  let montoTotal = currentRegistro.monto_total;

  if (isPricingSensitiveChange(currentRegistro, data)) {
    const mes = data.fecha.slice(0, 7);
    const registrosMes = await getRegistrosHoras(ctx, { usuarioId });
    const horasAcumuladasMes = getAccumulatedWorkedHoursUpTo(registrosMes, mes, data.fecha, id, currentRegistro.created_at);
    const pricingConfig = await resolvePricingConfig(ctx, data.proyecto_id);
    const recalculated = calculateHoursAmount(data.horas, horasAcumuladasMes, pricingConfig);
    horasTrabajadas = recalculated.horasTrabajadas;
    horasACobrar = recalculated.horasACobrar;
    precioAplicado = recalculated.precioAplicado;
    montoTotal = recalculated.montoTotal;
  }

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

  // Ajustes de horas acumuladas del proyecto
  for (const adjustment of calculateProjectHourAdjustments(currentRegistro, data)) {
    const proyecto = await getProyectoById(ctx, adjustment.proyectoId);
    if (proyecto) {
      await updateProyectoHorasAcumuladas(
        ctx,
        adjustment.proyectoId,
        applyProjectHourDelta(proyecto.horas_acumuladas, adjustment.deltaHoras),
      );
    }
  }

  // Ajustes de horas acumuladas de la tarea
  if (currentRegistro.tarea_id !== data.tarea_id) {
    // Quitar de la tarea anterior
    if (currentRegistro.tarea_id) {
      const oldTarea = await getTareaById(ctx, currentRegistro.tarea_id);
      if (oldTarea) {
        await updateTareaHorasAcumuladas(
          ctx,
          currentRegistro.tarea_id,
          Math.max(0, Math.round((oldTarea.horas_acumuladas - currentRegistro.horas) * 10000) / 10000),
        );
      }
    }
    // Sumar a la tarea nueva
    if (data.tarea_id) {
      const newTarea = await getTareaById(ctx, data.tarea_id);
      if (newTarea) {
        await updateTareaHorasAcumuladas(
          ctx,
          data.tarea_id,
          Math.round((newTarea.horas_acumuladas + (data.horas ?? currentRegistro.horas)) * 10000) / 10000,
        );
      }
    }
  } else if (currentRegistro.tarea_id && Number(currentRegistro.horas) !== Number(data.horas)) {
    // Misma tarea pero cambiaron las horas — ajustar delta
    const tarea = await getTareaById(ctx, data.tarea_id);
    if (tarea) {
      const delta = (data.horas ?? currentRegistro.horas) - currentRegistro.horas;
      await updateTareaHorasAcumuladas(
        ctx,
        data.tarea_id,
        Math.max(0, Math.round((tarea.horas_acumuladas + delta) * 10000) / 10000),
      );
    }
  }
}

/**
 * Elimina un registro de horas y ajusta las horas acumuladas del proyecto y tarea.
 */
export async function deleteHourRecord(
  ctx: SheetCtx,
  id: string,
  usuarioId: string,
): Promise<void> {
  const registros = await getRegistrosHoras(ctx, { usuarioId });
  const registro = registros.find((r) => r.id === id);
  if (!registro) throw new Error("REGISTRO_NOT_FOUND");

  await deleteRegistroHoras(ctx, id);

  const proyecto = await getProyectoById(ctx, registro.proyecto_id);
  if (proyecto) {
    await updateProyectoHorasAcumuladas(
      ctx,
      registro.proyecto_id,
      Math.max(0, Math.round((proyecto.horas_acumuladas - registro.horas) * 10000) / 10000),
    );
  }

  if (registro.tarea_id) {
    const tarea = await getTareaById(ctx, registro.tarea_id);
    if (tarea) {
      await updateTareaHorasAcumuladas(
        ctx,
        registro.tarea_id,
        Math.max(0, Math.round((tarea.horas_acumuladas - registro.horas) * 10000) / 10000),
      );
    }
  }
}

export { round4 as __serviceRound4 };
