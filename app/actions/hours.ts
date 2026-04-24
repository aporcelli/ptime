'use server';
import { revalidatePath }    from "next/cache";
import { auth }              from "@/auth";
import { getSheetCtx }       from "@/lib/sheets/context";
import { hourFormSchema }    from "@/lib/schemas/hour";
import { calculateHoursAmount } from "@/lib/pricing/calculateHoursAmount";
import { getPricingConfigForProject } from "@/app/actions/config";
import { getProyectoById, getRegistrosHoras } from "@/lib/sheets/queries";
import { createRegistroHoras, updateRegistroEstado, updateRegistroHoras, updateProyectoHorasAcumuladas } from "@/lib/sheets/mutations";
import { sanitize }          from "@/lib/utils/sanitize";
import { generateUUID }      from "@/lib/utils/index";
import type { ActionResult, HoraEstado, RegistroHoras } from "@/types/entities";

export async function createHour(rawData: unknown): Promise<ActionResult<RegistroHoras>> {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "No autenticado" };

    const parsed = hourFormSchema.safeParse(rawData);
    if (!parsed.success) return { success: false, error: "Datos inválidos", fieldErrors: parsed.error.flatten().fieldErrors as Record<string,string[]> };

    const ctx      = await getSheetCtx();
    const data     = parsed.data;
    const proyecto = await getProyectoById(ctx, data.proyecto_id);
    if (!proyecto) return { success: false, error: "Proyecto no encontrado" };
    if (proyecto.estado !== "activo") return { success: false, error: "El proyecto no está activo" };

    const usuarioId = session.user.email ?? session.user.id;

    const mes = data.fecha.slice(0, 7); // "YYYY-MM"
    const registrosMes = await getRegistrosHoras(ctx, { usuarioId });
    const horasAcumuladasMes = registrosMes
      .filter((r) => r.fecha.startsWith(mes))
      .reduce((sum, r) => sum + r.horas, 0);

    const pricingConfig = await getPricingConfigForProject(data.proyecto_id);
    const { montoTotal, precioAplicado } = calculateHoursAmount(
      data.horas,
      horasAcumuladasMes,
      pricingConfig
    );

    const id = generateUUID();
    const registro: Omit<RegistroHoras, "created_at"|"updated_at"> = {
      id, cliente_id: data.cliente_id, proyecto_id: data.proyecto_id, tarea_id: data.tarea_id,
      usuario_id: usuarioId,
      fecha: data.fecha, horas: data.horas,
      descripcion: sanitize(data.descripcion),
      precio_hora_aplicado: precioAplicado,
      monto_total: montoTotal, estado: data.estado,
    };

    await createRegistroHoras(ctx, registro);
    await updateProyectoHorasAcumuladas(ctx, data.proyecto_id, Math.round((proyecto.horas_acumuladas + data.horas) * 10000) / 10000);

    revalidatePath("/horas");
    revalidatePath("/dashboard");
    return { success: true, data: { ...registro, created_at: "", updated_at: "" } as RegistroHoras };
  } catch (e: unknown) {
    console.error("[createHour] Error:", e);
    return { success: false, error: e instanceof Error ? e.message : "Error desconocido al crear" };
  }
}

export async function changeHourStatus(id: string, estado: HoraEstado): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "No autenticado" };
  const ctx = await getSheetCtx();
  await updateRegistroEstado(ctx, id, estado);
  revalidatePath("/horas");
  return { success: true, data: undefined };
}

export async function updateHourAction(id: string, rawData: unknown): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "No autenticado" };

    const parsed = hourFormSchema.safeParse(rawData);
    if (!parsed.success) return { success: false, error: "Datos inválidos", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };

    const ctx = await getSheetCtx();
    const data = parsed.data;
    const usuarioId = session.user.email ?? session.user.id;

    // Calculamos el precio nuevamente por si cambió horas o proyecto.
    const mes = data.fecha.slice(0, 7);
    const registrosMes = await getRegistrosHoras(ctx, { usuarioId });
    
    // Ojo: Restamos las horas actuales de *este* registro del acumulado para no contarlas doble
    const currentRegistro = registrosMes.find(r => r.id === id);
    if (!currentRegistro) return { success: false, error: "Registro no encontrado" };

    const horasAcumuladasMes = registrosMes
      .filter((r) => r.fecha.startsWith(mes) && r.id !== id)
      .reduce((sum, r) => sum + r.horas, 0);

    const pricingConfig = await getPricingConfigForProject(data.proyecto_id);
    const { montoTotal, precioAplicado } = calculateHoursAmount(
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
      descripcion: cleanDesc,
      precio_hora_aplicado: precioAplicado,
      monto_total: montoTotal,
      estado: data.estado,
    });

    const diffHoras = data.horas - currentRegistro.horas;
    if (diffHoras !== 0) {
      const proyecto = await getProyectoById(ctx, data.proyecto_id);
      if (proyecto) {
        await updateProyectoHorasAcumuladas(ctx, data.proyecto_id, Math.round((proyecto.horas_acumuladas + diffHoras) * 10000) / 10000);
      }
    }

    revalidatePath("/horas");
    revalidatePath("/dashboard");
    revalidatePath(`/horas/${id}`);
    return { success: true, data: undefined };
  } catch (e: unknown) {
    console.error("[updateHourAction] Error:", e);
    const msg = e instanceof Error ? e.message : "Error desconocido al actualizar";
    return { success: false, error: msg };
  }
}
